import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/store";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ cardId: string }> }
) {
  const { cardId } = await context.params;
  const userAgent = request.headers.get("user-agent") || "";

  const card = DB.getCardById(cardId);

  // If card is not found or not yet linked to any Google link, send directly to the Activation Link page!
  if (!card || !card.linked || !card.destinationUrl) {
    const activateUrl = new URL(`/activate?card=${encodeURIComponent(cardId.toUpperCase())}`, request.url);
    return NextResponse.redirect(activateUrl);
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
