import { NextResponse } from "next/server";
import { DB } from "@/lib/store";

export async function GET() {
  const cards = DB.getCards();
  const customers = DB.getCustomers();
  const custMap = new Map(customers.map((c) => [c.id, c]));

  const headers = [
    "Card ID",
    "Customer ID",
    "Business Name",
    "Owner Name",
    "Active",
    "NFC Programmed",
    "Total Scans",
    "Last Scanned At",
    "ASXFLOW Redirect URL",
    "Destination Google Review URL",
  ];

  const rows = cards.map((c) => {
    const cust = custMap.get(c.customerId);
    const dest = c.customDestinationUrl || cust?.googleReviewUrl || "";
    return [
      c.id,
      c.customerId,
      `"${(cust?.businessName || "").replace(/"/g, '""')}"`,
      `"${(cust?.name || "").replace(/"/g, '""')}"`,
      c.active ? "YES" : "NO",
      c.nfcConfigured ? "YES" : "NO",
      c.totalScans || 0,
      c.lastScannedAt || "",
      `https://asxflow.in/c/${c.id}`,
      `"${dest.replace(/"/g, '""')}"`,
    ].join(",");
  });

  const csvContent = [headers.join(","), ...rows].join("\r\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ASXFLOW-Cards-Export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
