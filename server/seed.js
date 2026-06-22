const prisma = require("./db");
const bcrypt = require("bcryptjs");

async function seed() {
  try {
    const existing = await prisma.user.findUnique({ where: { email: "admin1@test.com" } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email: "admin1@test.com",
          name: "Admin",
          passwordHash: await bcrypt.hash("1234", 10),
          role: "MENTOR",
        },
      });
      console.log("✓ Seed: cont admin1@test.com creat");
    } else {
      console.log("✓ Seed: admin1@test.com exista deja");
    }
  } catch (err) {
    console.error("⚠ Seed error:", err.message);
  }
}

seed().then(() => process.exit(0));
