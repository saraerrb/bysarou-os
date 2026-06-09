import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding BySarou OS database (Multi-Store)...\n");

  // Clean existing data
  try {
    await prisma.automationLog.deleteMany();
    await prisma.orderHistory.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.return.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.storeMember.deleteMany();
    await prisma.settings.deleteMany();
    await prisma.store.deleteMany();
    await prisma.user.deleteMany();
  } catch (e) {
    console.log("Note: Some tables might not exist yet, skipping clean phase.");
  }

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

  await prisma.settings.create({
    data: {
      storeId: store.id,
      storeName: "BySarou Fashion",
      currency: "MAD",
    },
  });

  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Robes", storeId: store.id } }),
    prisma.category.create({ data: { name: "Tops", storeId: store.id } }),
  ]);

  const sizes = [
    { name: "XS", displayOrder: 1, storeId: store.id },
    { name: "S", displayOrder: 2, storeId: store.id },
    { name: "M", displayOrder: 3, storeId: store.id },
    { name: "L", displayOrder: 4, storeId: store.id },
    { name: "XL", displayOrder: 5, storeId: store.id },
    { name: "XXL", displayOrder: 6, storeId: store.id },
    { name: "3XL", displayOrder: 7, storeId: store.id },
  ];
  await prisma.size.createMany({ data: sizes });
  const seedSizeList = await prisma.size.findMany({ where: { storeId: store.id } });
  const sizeM = seedSizeList.find((s: any) => s.name === "M");

  const colors = [
    { name: "Black", hexCode: "#000000", storeId: store.id },
    { name: "White", hexCode: "#FFFFFF", storeId: store.id },
    { name: "Beige", hexCode: "#F5F5DC", storeId: store.id },
    { name: "Navy", hexCode: "#000080", storeId: store.id },
    { name: "Burgundy", hexCode: "#800020", storeId: store.id },
  ];
  await prisma.color.createMany({ data: colors });
  const seedColorList = await prisma.color.findMany({ where: { storeId: store.id } });
  const colorBlack = seedColorList.find((c: any) => c.name === "Black");

  const product = await prisma.product.create({
    data: {
      name: "Robe Élégante Satin",
      description: "Robe longue en satin",
      categoryId: categories[0].id,
      storeId: store.id,
      price: 299,
      costPrice: 120,
      sellingPrice: 299,
    },
  });

  const variant = await prisma.productVariant.create({
    data: {
      productId: product.id,
      sku: "ROB-SAT-M",
      size: "M",
      color: "Black",
      sizeId: sizeM?.id,
      colorId: colorBlack?.id,
      stockQuantity: 50,
      costPrice: 120,
      sellingPrice: 299,
    },
  });

  await prisma.stockMovement.create({
    data: {
      variantId: variant.id,
      type: "IN",
      quantity: 50,
      reason: "Initial Stock",
    },
  });

  console.log("🎉 Seed complete! You can now login.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
