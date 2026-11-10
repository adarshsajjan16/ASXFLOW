import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/store";

export async function GET() {
  const customers = DB.getCustomers();
  return NextResponse.json({ success: true, customers });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, businessName, googleReviewUrl, contactEmail, contactPhone } = body;

    if (!name || !businessName || !googleReviewUrl) {
      return NextResponse.json(
        { success: false, error: "Name, business name, and Google Review URL are required" },
        { status: 400 }
      );
    }

    const customer = DB.addCustomer({
      name,
      businessName,
      googleReviewUrl,
      contactEmail,
      contactPhone,
    });

    return NextResponse.json({ success: true, customer });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
