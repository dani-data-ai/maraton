const express = require("express");
const prisma = require("../db");
const { authMiddleware, requireMentor } = require("../auth");
const router = express.Router();

// Mentor: creeaza un extra step
router.post("/", authMiddleware, requireMentor, async (req, res) => {
  const { scutierId, title, description, isRecurring, date, recurrence, startDate, endDate } = req.body;
  if (!scutierId || !title) return res.status(400).json({ error: "Date incomplete" });

  const scutier = await prisma.user.findUnique({ where: { id: scutierId } });
  if (!scutier || scutier.mentorId !== req.user.id)
    return res.status(403).json({ error: "Nu este scutierul tau" });

  if (isRecurring && !recurrence)
    return res.status(400).json({ error: "Tipul de recurenta este necesar" });
  if (!isRecurring && !date)
    return res.status(400).json({ error: "Data este necesara pentru un eveniment unic" });

  const step = await prisma.extraStep.create({
    data: {
      mentorId: req.user.id,
      scutierId,
      title,
      description: description || null,
      isRecurring: !!isRecurring,
      date: isRecurring ? null : date,
      recurrence: isRecurring ? recurrence : null,
      startDate: isRecurring ? (startDate || null) : null,
      endDate: isRecurring ? (endDate || null) : null,
    },
  });
  res.json(step);
});

// Mentor: sterge un extra step
router.delete("/:id", authMiddleware, requireMentor, async (req, res) => {
  const step = await prisma.extraStep.findUnique({ where: { id: req.params.id } });
  if (!step || step.mentorId !== req.user.id)
    return res.status(403).json({ error: "Nu ai permisiune" });
  await prisma.extraStep.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// Scutier: vede extra steps ale lui
router.get("/my", authMiddleware, async (req, res) => {
  const steps = await prisma.extraStep.findMany({
    where: { scutierId: req.user.id },
    include: { completions: { where: { userId: req.user.id } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(steps);
});

// Mentor: vede extra steps create de el
router.get("/created", authMiddleware, requireMentor, async (req, res) => {
  const steps = await prisma.extraStep.findMany({
    where: { mentorId: req.user.id },
    include: {
      scutier: { select: { name: true } },
      completions: true,
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(steps);
});

// Scutier: bifeaza/debifeaza un extra step pe o data
router.post("/:id/complete", authMiddleware, async (req, res) => {
  const { date } = req.body;
  if (!date) return res.status(400).json({ error: "Data este necesara" });

  const step = await prisma.extraStep.findUnique({ where: { id: req.params.id } });
  if (!step || step.scutierId !== req.user.id)
    return res.status(403).json({ error: "Nu ai permisiune" });

  const existing = await prisma.extraStepCompletion.findUnique({
    where: { stepId_userId_date: { stepId: req.params.id, userId: req.user.id, date } },
  });

  if (existing) {
    await prisma.extraStepCompletion.delete({ where: { id: existing.id } });
    res.json({ completed: false });
  } else {
    await prisma.extraStepCompletion.create({
      data: { stepId: req.params.id, userId: req.user.id, date },
    });
    res.json({ completed: true });
  }
});

module.exports = router;
