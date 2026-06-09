const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log("Stores:", await prisma.store.findMany());
  console.log("Members:", await prisma.storeMember.findMany());
  console.log("Products:", await prisma.product.count());
}
main().catch(console.error).finally(() => prisma.$disconnect());
