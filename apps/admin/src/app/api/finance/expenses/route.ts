import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: "desc" }
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("GET /api/finance/expenses error:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, notes, date, type = "ADS" } = body;

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description: notes,
        date: date ? new Date(date) : new Date(),
        category: type
      }
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
