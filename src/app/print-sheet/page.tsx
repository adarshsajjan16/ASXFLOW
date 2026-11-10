"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, Star, Smartphone, RefreshCw } from "lucide-react";
import { Card } from "@/lib/types";

function PrintSheetContent() {
  const [cards, setCards] = useState<Card[]>([]);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/cards").then((r) => r.json());
        if (res.success) {
          setCards(res.cards);
          // Fetch QR codes for all cards
          const qrPromises = res.cards.map(async (c: Card) => {
            const qrRes = await fetch(`/api/qr?cardId=${c.id}&format=json`).then((r) => r.json());
            return { id: c.id, url: qrRes.dataUrl };
          });
          const resolved = await Promise.all(qrPromises);
          const map: Record<string, string> = {};
          resolved.forEach((item) => {
            if (item.url) map[item.id] = item.url;
          });
          setQrMap(map);
        }
      } catch (err) {
        console.error("Error loading print sheet", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Non-printing Control Bar */}
      <div className="print:hidden w-full max-w-4xl mb-6 bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-xl">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="text-center">
          <span className="text-xs font-bold text-white uppercase tracking-wider block">
            A4 Batch Sticker & Standee Sheet
          </span>
          <span className="text-[11px] text-slate-400">
            Optimized for printing 6 table standees or stickers per page
          </span>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print A4 Sheet</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
          <span>Generating multi-card print sheet...</span>
        </div>
      ) : (
        /* Printable 6-Card Grid (Fits A4 Paper perfectly) */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6 max-w-5xl bg-white text-slate-950 rounded-2xl shadow-2xl print:p-0 print:shadow-none print:m-0 print:gap-4">
          {cards.map((card) => (
            <div
              key={card.id}
              className="border-2 border-dashed border-slate-300 rounded-2xl p-4 flex flex-col items-center justify-between text-center bg-slate-50 print:bg-white print:border-slate-400 h-[340px]"
            >
              {/* Card Header */}
              <div className="w-full flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-extrabold text-xs tracking-wider">
                  ASX<span className="text-cyan-600">FLOW</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-slate-200 px-2 py-0.5 rounded">
                  {card.id}
                </span>
              </div>

              {/* Business Name */}
              <div className="my-1">
                <h4 className="font-black text-sm tracking-tight text-slate-900 truncate max-w-[200px]">
                  {card.businessName || "Business"}
                </h4>
                <div className="flex items-center justify-center gap-0.5 text-amber-500 my-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">
                  Review Us On Google
                </span>
              </div>

              {/* QR Code */}
              <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                {qrMap[card.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrMap[card.id]}
                    alt={card.id}
                    className="w-32 h-32 rounded"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center text-xs text-slate-400">
                    Loading QR...
                  </div>
                )}
              </div>

              {/* Tap or Scan Instruction */}
              <div className="mt-2 text-[10px] font-semibold text-slate-600 flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-cyan-600" />
                <span>Tap Phone (NFC) or Scan QR</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PrintSheetPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center">
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading batch print sheet...</div>}>
        <PrintSheetContent />
      </Suspense>
    </main>
  );
}
