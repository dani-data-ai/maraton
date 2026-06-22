const express = require("express");
const prisma = require("../db");
const { authMiddleware, requireMentor } = require("../auth");
const router = express.Router();

// Lista scutierilor + planurile lor
router.get("/scutieri", authMiddleware, requireMentor, async (req, res) => {
  const scutieri = await prisma.user.findMany({
    where: { mentorId: req.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      readingPlan: true,
    },
    orderBy: { name: "asc" },
  });
  res.json(scutieri);
});

// Genereaza cod de invitatie
router.post("/invite", authMiddleware, requireMentor, async (req, res) => {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  const invite = await prisma.inviteCode.create({
    data: { code, createdBy: req.user.id },
  });
  res.json({ code: invite.code });
});

// Lista coduri de invitatie create de mentor
router.get("/invites", authMiddleware, requireMentor, async (req, res) => {
  const invites = await prisma.inviteCode.findMany({
    where: { createdBy: req.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  res.json(invites);
});

module.exports = router;
