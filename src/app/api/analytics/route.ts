import { NextResponse } from "next/server";
import { DB } from "@/lib/store";

export async function GET() {
  const scans = DB.getScans();
  const cards = DB.getCards();
  const customers = DB.getCustomers();

  const totalScans = cards.reduce((sum, c) => sum + (c.totalScans || 0), 0);
  const activeCards = cards.filter((c) => c.active).length;

  return NextResponse.json({
    success: true,
    stats: {
      totalCustomers: customers.length,
      totalCards: cards.length,
      activeCards,
      totalScans,
    },
    scans,
  });
}
