import { subDays, format } from "date-fns";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  try {
    const days = 30;
    const startDate = subDays(new Date(), days);
    const endDate = new Date();

    console.log("Fetching orders...", startDate, endDate);
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true }
            }
          }
        },
      },
    });
    console.log("Fetched orders:", orders.length);
    
    // Test formatting
    orders.forEach(o => {
      const date = format(o.createdAt, "MMM dd");
    });
    
    console.log("Success");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
