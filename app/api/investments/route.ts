import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const investmentSchema = z.object({
  ticker: z.string().min(1).max(10),
  type: z.enum(["stock", "etf", "crypto"]),
  action: z.enum(["buy", "sell"]),
  units: z.number().positive(),
  price_per_unit: z.number().positive(),
  date: z.string().datetime(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = investmentSchema.parse(body);

    // Save to database
    const investment = await db.investmentTransaction.create({
      data: {
        ticker: validatedData.ticker.toUpperCase(),
        type: validatedData.type,
        action: validatedData.action,
        units: validatedData.units,
        price_per_unit: validatedData.price_per_unit,
        date: new Date(validatedData.date),
      },
    });

    return NextResponse.json(
      { success: true, data: investment },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating investment:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Fetch from database
    const investments = await db.investmentTransaction.findMany({
      orderBy: { date: "desc" },
    });

    return NextResponse.json(
      { success: true, data: investments },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching investments:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

