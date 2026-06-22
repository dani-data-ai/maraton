const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../db");
const { sign, authMiddleware } = require("../auth");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, email, password, inviteCode } = req.body;
  if (!name || !email || !password || !inviteCode)
    return res.status(400).json({ error: "Toate câmpurile sunt necesare" });

  const invite = await prisma.inviteCode.findUnique({ where: { code: inviteCode } });
  if (!invite) return res.status(400).json({ error: "Cod de invitație invalid" });
  if (invite.usedBy) return res.status(400).json({ error: "Cod deja folosit" });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: "Email deja înregistrat" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "SCUTIER", mentorId: invite.createdBy },
  });

  await prisma.inviteCode.update({
    where: { id: invite.id },
    data: { usedBy: user.id, usedAt: new Date() },
  });

  const token = sign(user);
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, { httpOnly: true, sameSite: isProd ? "strict" : "lax", secure: isProd, maxAge: 30 * 24 * 60 * 60 * 1000 });
  res.json({ id: user.id, name: user.name, role: user.role });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ error: "Email sau parolă greșite" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: "Email sau parolă greșite" });

  const token = sign(user);
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, { httpOnly: true, sameSite: isProd ? "strict" : "lax", secure: isProd, maxAge: 30 * 24 * 60 * 60 * 1000 });
  res.json({ id: user.id, name: user.name, role: user.role });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ ok: true });
});

router.get("/me", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true, name: true, email: true, role: true, mentorId: true,
      mentor: { select: { name: true, email: true } },
      readingPlan: true,
    },
  });
  if (!user) return res.status(404).json({ error: "Inexistent" });
  res.json(user);
});

router.patch("/profile", authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Numele este necesar" });
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { name: name.trim() },
    select: { id: true, name: true, email: true, role: true },
  });
  res.json(user);
});

module.exports = router;
