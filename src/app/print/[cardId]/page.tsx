"use client";

import { useEffect, useState, use, Suspense } from "react";
import Link from "next/link";
import { Printer, ArrowLeft, Star, Smartphone, QrCode } from "lucide-react";

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
  const [styleTheme, setStyleTheme] = useState<"dark" | "light" | "gold">("dark");
  const [loading, setLoading] = useState(true);

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
      <div className="print:hidden w-full max-w-xl mb-6 bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-xl">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>

        {/* Theme Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStyleTheme("dark")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              styleTheme === "dark" ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-400"
            }`}
          >
            Dark Luxe
          </button>
          <button
            onClick={() => setStyleTheme("light")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              styleTheme === "light" ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-400"
            }`}
          >
            Clean White
          </button>
          <button
            onClick={() => setStyleTheme("gold")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              styleTheme === "gold" ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-slate-400"
            }`}
          >
            Gold VIP
          </button>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading standee layout...</div>
      ) : (
        /* Printable Acrylic Standee Card (A6 / 4x6 inch standard acrylic stand) */
        <div
          className={`w-[360px] h-[520px] rounded-3xl p-6 flex flex-col items-center justify-between text-center shadow-2xl relative border ${
            styleTheme === "dark"
              ? "bg-slate-950 text-white border-cyan-500/30"
              : styleTheme === "light"
              ? "bg-white text-slate-950 border-slate-300"
              : "bg-gradient-to-b from-slate-950 via-zinc-900 to-slate-950 text-amber-200 border-amber-400/40"
          }`}
        >
          {/* Top Brand Header */}
          <div className="w-full flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-1.5">
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs ${
                  styleTheme === "light" ? "bg-slate-950 text-white" : "bg-cyan-400 text-slate-950"
                }`}
              >
                A
              </div>
              <span className="font-extrabold text-sm tracking-wider">
                ASX<span className={styleTheme === "light" ? "text-cyan-600" : "text-cyan-400"}>FLOW</span>
              </span>
            </div>

            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10">
              {cardId}
            </span>
          </div>

          {/* Business & Review Header */}
          <div className="mt-2">
            <h2 className="text-xl font-black tracking-tight mb-1">
              {cardData?.businessName || "Your Business"}
            </h2>
            <div className="flex items-center justify-center gap-1 my-1.5 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs uppercase tracking-widest font-bold opacity-80">
              Leave Us A Review On Google
            </p>
          </div>

          {/* QR Code Container */}
          <div className="my-2 p-3 bg-white rounded-2xl shadow-xl relative flex items-center justify-center">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR code for ${cardId}`}
                className="w-44 h-44 rounded-lg"
              />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center text-slate-500">
                <QrCode className="w-10 h-10 animate-spin" />
              </div>
            )}
          </div>

          {/* Interaction Instruction Badge */}
          <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-2.5 flex items-center justify-center gap-2">
            <Smartphone className="w-4 h-4 shrink-0 text-cyan-400" />
            <span className="text-[11px] font-semibold">
              Tap Phone Here (NFC) or Scan QR
            </span>
          </div>

          {/* Footer Card ID */}
          <div className="w-full text-center text-[10px] opacity-60 font-mono tracking-wide pt-2 border-t border-white/10">
            Powered by ASXFLOW Smart Standee Platform
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
