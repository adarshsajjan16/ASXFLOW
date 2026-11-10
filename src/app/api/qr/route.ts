import { NextRequest, NextResponse } from "next/server";
import { generateQRDataURL, generateQRSVG } from "@/lib/qr-generator";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cardId = searchParams.get("cardId") || "ASX001";
  const format = searchParams.get("format") || "png"; // 'png' | 'svg' | 'json'
  const host = req.headers.get("host") || "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";

  const targetLink = `${protocol}://${host}/c/${cardId.toUpperCase()}`;

  try {
    if (format === "svg") {
      const svg = await generateQRSVG(targetLink);
      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": `attachment; filename="ASXFLOW-${cardId}.svg"`,
        },
      });
    }

    const dataUrl = await generateQRDataURL(targetLink);

    if (format === "json") {
      return NextResponse.json({
        success: true,
        cardId,
        targetLink,
        dataUrl,
      });
    }

    // Direct PNG buffer
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename="ASXFLOW-${cardId}.png"`,
      },
    });
  } catch (err) {
    console.error("QR generation error:", err);
    return NextResponse.json({ success: false, error: "Failed to generate QR" }, { status: 500 });
  }
}
