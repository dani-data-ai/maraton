const express = require("express");
const prisma = require("../db");
const { authMiddleware, requireMentor } = require("../auth");
const router = express.Router();

// GET planul meu de citire + intrari
router.get("/my", authMiddleware, async (req, res) => {
  const plan = await prisma.readingPlan.findUnique({ where: { userId: req.user.id } });
  const entries = await prisma.readingEntry.findMany({
    where: { userId: req.user.id },
    orderBy: { date: "asc" },
  });
  res.json({ plan, entries });
});

// Mentor: asigneaza plan unui scutier
router.post("/assign", authMiddleware, requireMentor, async (req, res) => {
  const { scutierId, planType, startDate } = req.body;
  if (!scutierId || !planType || !startDate)
    return res.status(400).json({ error: "Date incomplete" });

  const validTypes = ["GOSPELS_42", "NT_42", "NT_60", "BIBLE_180"];
  if (!validTypes.includes(planType))
    return res.status(400).json({ error: "Tip plan invalid" });

  // Verifica ca scutierul apartine acestui mentor
  const scutier = await prisma.user.findUnique({ where: { id: scutierId } });
  if (!scutier || scutier.mentorId !== req.user.id)
    return res.status(403).json({ error: "Nu este scutierul tau" });

  const plan = await prisma.readingPlan.upsert({
    where: { userId: scutierId },
    update: { planType, startDate },
    create: { userId: scutierId, planType, startDate },
  });
  res.json(plan);
});

// Scutier: bifeaza o zi + scrie un gand
router.post("/entry", authMiddleware, async (req, res) => {
  const { date, dayNumber, thought } = req.body;
  if (!date || !dayNumber) return res.status(400).json({ error: "Data si numarul zilei sunt necesare" });

  const entry = await prisma.readingEntry.upsert({
    where: { userId_date: { userId: req.user.id, date } },
    update: { thought: thought || null, dayNumber },
    create: { userId: req.user.id, date, dayNumber, thought: thought || null },
  });
  res.json(entry);
});

// Scutier: sterge o zi bifata
router.delete("/entry/:date", authMiddleware, async (req, res) => {
  await prisma.readingEntry.deleteMany({
    where: { userId: req.user.id, date: req.params.date },
  });
  res.json({ ok: true });
});

// Mentor: vede intrarile unui scutier
router.get("/scutier/:id", authMiddleware, requireMentor, async (req, res) => {
  const scutier = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!scutier || scutier.mentorId !== req.user.id)
    return res.status(403).json({ error: "Nu este scutierul tau" });

  const plan = await prisma.readingPlan.findUnique({ where: { userId: req.params.id } });
  const entries = await prisma.readingEntry.findMany({
    where: { userId: req.params.id },
    orderBy: { date: "asc" },
  });
  res.json({ plan, entries });
});

module.exports = router;
