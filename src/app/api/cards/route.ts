import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/store";

export async function GET() {
  const cards = DB.getCards();
  return NextResponse.json({ success: true, cards });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, customerId, customDestinationUrl, batchCount } = body;

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "customerId is required" },
        { status: 400 }
      );
    }

    if (batchCount && typeof batchCount === "number" && batchCount > 1) {
      const createdCards = [];
      for (let i = 0; i < Math.min(batchCount, 50); i++) {
        const card = DB.createCard({ customerId, customDestinationUrl });
        createdCards.push(card);
      }
      return NextResponse.json({ success: true, cards: createdCards });
    }

    const card = DB.createCard({ id, customerId, customDestinationUrl });
    return NextResponse.json({ success: true, card });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create card" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Card id is required" },
        { status: 400 }
      );
    }

    const updated = DB.updateCard(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, card: updated });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update card" },
      { status: 500 }
    );
  }
}
