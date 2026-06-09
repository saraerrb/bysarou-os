import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getActiveStoreId, setActiveStoreId } from "@/lib/store-context";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [stores, activeId] = await Promise.all([
    prisma.store.findMany({
      where: { members: { some: { userId: session.id } } }
    }),
    getActiveStoreId()
  ]);

  const activeStore = stores.find(s => s.id === activeId) || stores[0];

  return NextResponse.json({ stores, activeStore });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, currency } = await request.json();

  const store = await prisma.store.create({
    data: {
      name,
      currency: currency || "MAD",
      ownerId: session.id,
      members: {
        create: {
          userId: session.id,
          role: "ADMIN"
        }
      }
    }
  });

  // Create default settings for new store
  await prisma.settings.create({
    data: { storeId: store.id }
  });

  await setActiveStoreId(store.id);

  return NextResponse.json(store);
}
