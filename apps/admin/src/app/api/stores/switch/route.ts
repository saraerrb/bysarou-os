import { NextRequest, NextResponse } from "next/server";
import { setActiveStoreId } from "@/lib/store-context";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { storeId } = await request.json();

  // Verify membership before switching
  const membership = await prisma.storeMember.findUnique({
    where: {
      storeId_userId: {
        storeId,
        userId: session.id
      }
    }
  });

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await setActiveStoreId(storeId);

  return NextResponse.json({ success: true });
}
