import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // 1. Check if any user exists
    const userCount = await prisma.user.count();
    
    if (userCount > 0) {
      return NextResponse.json({ error: "Initial setup already completed" }, { status: 403 });
    }

    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    // 2. Create the first admin and their default store
    const hashedPassword = await hashPassword(password);
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          isActive: true,
        }
      });

      const newStore = await tx.store.create({
        data: {
          name: "BySarou",
          ownerId: newUser.id,
          members: {
            create: {
              userId: newUser.id,
              role: "ADMIN"
            }
          },
          settings: {
            create: {} // Create default settings
          }
        }
      });

      return newUser;
    });

    return NextResponse.json({
      success: true,
      message: "First admin and store created successfully. You can now login.",
      user: { id: user.id, email: user.email, role: "ADMIN" }
    }, { status: 201 });
  } catch (error) {
    console.error("Register Admin error:", error);
    return NextResponse.json({ error: "Failed to create first admin" }, { status: 500 });
  }
}
