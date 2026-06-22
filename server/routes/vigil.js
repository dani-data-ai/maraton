const express = require("express");
const prisma = require("../db");
const { authMiddleware } = require("../auth");
const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const months = await prisma.vigilMonth.findMany({ where: { userId: req.user.id } });
  res.json(months.map((m) => m.month));
});

router.post("/toggle", authMiddleware, async (req, res) => {
  const { month } = req.body;
  if (!month) return res.status(400).json({ error: "Luna este necesara" });

  const existing = await prisma.vigilMonth.findUnique({
    where: { userId_month: { userId: req.user.id, month } },
  });

  if (existing) {
    await prisma.vigilMonth.delete({ where: { id: existing.id } });
    res.json({ marked: false });
  } else {
    await prisma.vigilMonth.create({ data: { userId: req.user.id, month } });
    res.json({ marked: true });
  }
});

module.exports = router;
