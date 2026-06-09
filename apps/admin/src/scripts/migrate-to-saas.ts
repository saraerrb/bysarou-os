import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Multi-Store SaaS Migration...");

  // 1. Get the first user (should be the admin)
  const firstUser = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" }
  });

  if (!firstUser) {
    console.error("❌ No users found. Please create an admin first.");
    return;
  }

  // 2. Create the default "BySarou" store
  const store = await prisma.store.create({
    data: {
      name: "BySarou",
      ownerId: firstUser.id,
      members: {
        create: {
          userId: firstUser.id,
          role: "ADMIN"
        }
      }
    }
  });

  console.log(`✅ Created default store: ${store.name} (ID: ${store.id})`);

  // 3. Migrate all existing records
  const modelsToMigrate = [
    "product",
    "order",
    "carrier",
    "category",
    "expense",
    "automationLog"
  ];

  for (const model of modelsToMigrate) {
    // @ts-ignore
    const result = await prisma[model].updateMany({
      where: { storeId: null },
      data: { storeId: store.id }
    });
    console.log(`📦 Migrated ${result.count} records for model: ${model}`);
  }

  // 4. Special case: Settings (Settings has a default ID, we need to link it)
  const existingSettings = await prisma.settings.findFirst({
    where: { storeId: "default" }
  });

  if (existingSettings) {
    // We can't update @id in Prisma easily, so we recreate
    await prisma.settings.create({
      data: {
        ...existingSettings,
        id: undefined as any, // Let cuid generate
        storeId: store.id
      }
    });
    await prisma.settings.delete({ where: { id: "default" } });
    console.log("⚙️ Migrated settings to the new store.");
  } else {
    // Just create default settings for the store
    await prisma.settings.create({
      data: { storeId: store.id }
    });
  }

  console.log("\n🎉 SaaS Migration Complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
