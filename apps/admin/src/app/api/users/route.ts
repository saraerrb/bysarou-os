import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { getActiveStoreId } = await import("@/lib/store-context");
  const storeId = await getActiveStoreId();

  if (!storeId) {
    return NextResponse.json({ error: "Store context missing" }, { status: 400 });
  }

  const members = await prisma.storeMember.findMany({
    where: { storeId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          createdAt: true,
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  // Flatten for UI compatibility
  const users = members.map(m => ({
    ...m.user,
    role: m.role
  }));

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { getActiveStoreId } = await import("@/lib/store-context");
  const storeId = await getActiveStoreId();

  if (!storeId) {
    return NextResponse.json({ error: "Store context missing" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    const hashedPassword = await hashPassword(password);
    
    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          isActive: true,
        }
      });
    }

    // Add to store
    await prisma.storeMember.upsert({
      where: {
        storeId_userId: {
          storeId,
          userId: user.id
        }
      },
      update: { role },
      create: {
        storeId,
        userId: user.id,
        role
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
