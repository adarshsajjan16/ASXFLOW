"use client";

import { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, Download, Sparkles, QrCode } from "lucide-react";

interface PrintPageProps {
  params: Promise<{ cardId: string }>;
}

function StandeePrintContent({ params }: PrintPageProps) {
  const resolvedParams = use(params);
  const cardId = resolvedParams.cardId.toUpperCase();

  const [cardData, setCardData] = useState<{
    id: string;
    businessName?: string;
    customerName?: string;
    destinationUrl?: string;
  } | null>(null);

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"master-photo" | "vector">("master-photo");

  useEffect(() => {
    async function load() {
      try {
        const [cardRes, qrRes] = await Promise.all([
          fetch(`/api/cards`).then((r) => r.json()),
          fetch(`/api/qr?cardId=${cardId}&format=json`).then((r) => r.json()),
        ]);

        if (cardRes.success) {
          const found = cardRes.cards.find(
            (c: { id: string }) => c.id.toLowerCase() === cardId.toLowerCase()
          );
          if (found) setCardData(found);
        }
        if (qrRes.success) {
          setQrDataUrl(qrRes.dataUrl);
        }
      } catch (err) {
        console.error("Error loading print card", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [cardId]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Non-printing Control Bar */}
      <div className="print:hidden w-full max-w-3xl mb-6 bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* View Mode Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("master-photo")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              viewMode === "master-photo"
                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Luxury Standee (Your Design)</span>
          </button>
          <button
            onClick={() => setViewMode("vector")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              viewMode === "vector"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Vector Vertical Card
          </button>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print Acrylic Standee (Ctrl + P)</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading standee layout...</div>
      ) : viewMode === "master-photo" ? (
        /* MODE 1: Exact Master Luxury Standee Design from User's Uploaded Photo */
        <div className="flex flex-col items-center">
          <div
            id="printable-standee"
            className="relative w-[720px] h-[480px] rounded-[28px] overflow-hidden shadow-2xl border-2 border-amber-400/30 print:shadow-none print:m-0 print:border-none select-none bg-slate-950"
          >
            {/* Base Master Standee Graphic */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/standee-template.jpg"
              alt="ASXFLOW Luxury Standee Template"
              className="w-full h-full object-cover"
            />

            {/* Dynamic Real QR Code Box Overlay */}
            {/* Positioned exactly over the placeholder QR box in the template */}
            <div
              className="absolute bg-white rounded-xl shadow-xl flex items-center justify-center p-1.5 border border-slate-200"
              style={{
                top: "59.3%",
                left: "55.8%",
                width: "17.0%",
                height: "25.2%",
              }}
            >
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt={`Live QR Code for Card ${cardId}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <QrCode className="w-8 h-8 text-slate-400 animate-spin" />
              )}
            </div>

            {/* Bottom Bar Customization: "Provided by ASXFLOW" & Card Number */}
            <div
              className="absolute flex items-center justify-center text-center pointer-events-none"
              style={{
                top: "88.6%",
                left: "26%",
                width: "48%",
                height: "6.5%",
              }}
            >
              <div className="w-full h-full bg-slate-950/95 border border-amber-400/60 rounded-full flex items-center justify-center px-4 shadow-lg">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 font-sans flex items-center gap-1.5">
                  <span>Provided by ASXFLOW</span>
                  <span className="text-amber-500 font-mono text-[10px]">● NO: {cardId}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="print:hidden mt-4 text-center text-xs text-slate-400 max-w-md">
            <p>
              💡 <b>Print Ready:</b> Perfectly sized for standard <b>6x4 inch / A6 Landscape</b> acrylic counter standees.
              Click <b>&quot;Print Acrylic Standee&quot;</b> to print directly on photo paper or cardstock.
            </p>
          </div>
        </div>
      ) : (
        /* MODE 2: Clean Vertical Vector Standee */
        <div className="w-[360px] h-[520px] rounded-3xl p-6 flex flex-col items-center justify-between text-center shadow-2xl relative border bg-slate-950 text-white border-cyan-500/30">
          <div className="w-full flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-1.5">
              <div className="w-6 h-6 rounded-md bg-cyan-400 text-slate-950 flex items-center justify-center font-black text-xs">
                A
              </div>
              <span className="font-extrabold text-sm tracking-wider">
                ASX<span className="text-cyan-400">FLOW</span>
              </span>
            </div>

            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10">
              {cardId}
            </span>
          </div>

          <div className="mt-2">
            <h2 className="text-xl font-black tracking-tight mb-1">
              {cardData?.businessName || "Your Business"}
            </h2>
            <p className="text-xs uppercase tracking-widest font-bold opacity-80">
              Leave Us A Review On Google
            </p>
          </div>

          <div className="my-1.5 p-3 bg-white rounded-2xl shadow-xl relative flex items-center justify-center">
            {qrDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR code for ${cardId}`}
                className="w-40 h-40 rounded-lg"
              />
            )}
          </div>

          <div className="w-full text-center text-[10px] opacity-70 font-mono tracking-wide pt-2 border-t border-white/10">
            Provided by ASXFLOW • NO: {cardId}
          </div>
        </div>
      )}
    </div>
  );
}

export default function StandeePrintPage({ params }: PrintPageProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center">
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading print studio...</div>}>
        <StandeePrintContent params={params} />
      </Suspense>
    </div>
  );
}
