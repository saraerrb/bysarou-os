const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding BySarou OS database (Prisma 5)...\n");

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const user = await prisma.user.create({
    data: {
      email: "admin@bysarou.com",
      name: "Sarou Admin",
      password: hashedPassword,
    },
  });
  console.log(`✅ User created: ${user.email}`);

  const store = await prisma.store.create({
    data: {
      name: "BySarou Fashion",
      ownerId: user.id,
      currency: "MAD",
    },
  });
  console.log(`✅ Store created: ${store.name}`);

  await prisma.storeMember.create({
    data: {
      storeId: store.id,
      userId: user.id,
      role: "ADMIN",
    },
  });

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
