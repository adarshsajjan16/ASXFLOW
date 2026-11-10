import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cardId, businessName, destinationUrl, customerName } = body;

    if (!cardId || !businessName || !destinationUrl) {
      return NextResponse.json(
        { success: false, error: "Card ID, Business Name, and Destination URL are required" },
        { status: 400 }
      );
    }

    const card = DB.linkCard(cardId, {
      businessName,
      destinationUrl,
      customerName,
    });

    return NextResponse.json({ success: true, card });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to link card" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get("cardId");

    if (!cardId) {
      return NextResponse.json(
        { success: false, error: "Card ID is required" },
        { status: 400 }
      );
    }

    const unlinked = DB.unlinkCard(cardId);
    if (!unlinked) {
      return NextResponse.json(
        { success: false, error: "Card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, card: unlinked });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to unlink card" },
      { status: 500 }
    );
  }
}
