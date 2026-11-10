import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/store";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await context.params;
  const userAgent = request.headers.get("user-agent") || "";

  const card = DB.getCardById(cardId);

  if (!card) {
    const errorUrl = new URL(`/card-status?card=${encodeURIComponent(cardId)}&reason=not_found`, request.url);
    return NextResponse.redirect(errorUrl);
  }

  if (!card.active) {
    const inactiveUrl = new URL(`/card-status?card=${encodeURIComponent(cardId)}&reason=inactive`, request.url);
    return NextResponse.redirect(inactiveUrl);
  }

  // Record scan in analytics
  DB.recordScan(cardId, userAgent);

  // Instant redirect to customer's Google Review page
  let targetUrl = card.destinationUrl;
  if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
    targetUrl = `https://${targetUrl}`;
  }

  return NextResponse.redirect(targetUrl, 307);
}
