const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("technician123", 10);

  const technicians = [
    { name: "Dawit A.", email: "dawit@natimaintenance.com", phone: "0911111111" },
    { name: "Sara G.", email: "sara@natimaintenance.com", phone: "0922222222" },
    { name: "Yonas B.", email: "yonas@natimaintenance.com", phone: "0933333333" },
    { name: "Hanna M.", email: "hanna@natimaintenance.com", phone: "0944444444" },
    { name: "Abel T.", email: "abel@natimaintenance.com", phone: "0955555555" },
  ];

  for (const t of technicians) {
    const existing = await prisma.user.findUnique({ where: { email: t.email } });
    if (existing) {
      console.log("Skipping " + t.email + " (already exists)");
      continue;
    }
    await prisma.user.create({
      data: {
        name: t.name,
        email: t.email,
        phone: t.phone,
        password: hash,
        role: "TECHNICIAN",
        isActive: true,
      },
    });
    console.log("Created technician: " + t.name + " (" + t.email + ")");
  }

  const all = await prisma.user.findMany({
    where: { role: "TECHNICIAN" },
    select: { name: true, email: true },
  });
  console.log("");
  console.log("All technicians in DB:");
  all.forEach((u) => console.log("  - " + u.name + " <" + u.email + ">"));

  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});