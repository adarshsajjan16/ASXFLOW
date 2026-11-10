"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Sparkles, Smartphone, ArrowRight, Star, Link as LinkIcon } from "lucide-react";

function ActivateContent() {
  const searchParams = useSearchParams();
  const cardId = (searchParams.get("card") || "001").toUpperCase();

  const [businessName, setBusinessName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [linkedSuccess, setLinkedSuccess] = useState(false);

  async function handleLinkCard(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim() || !googleReviewUrl.trim()) {
      setError("Please fill in both Business Name and Google Review URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/cards/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          businessName: businessName.trim(),
          customerName: customerName.trim() || undefined,
          destinationUrl: googleReviewUrl.trim(),
        }),
      }).then((r) => r.json());

      if (res.success) {
        setLinkedSuccess(true);
      } else {
        setError(res.error || "Failed to link card");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (linkedSuccess) {
    return (
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-lg">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/40">
          Card #{cardId} Activated
        </span>

        <h2 className="text-2xl font-black text-white mt-3 mb-2">
          Successfully Linked!
        </h2>

        <p className="text-sm text-slate-300 mb-6">
          Card <b className="text-cyan-300 font-mono">#{cardId}</b> is now connected to{" "}
          <b className="text-white">&quot;{businessName}&quot;</b>.
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left text-xs text-slate-400 space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <span>Status:</span>
            <span className="text-emerald-400 font-bold">● Active & Live</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Destination:</span>
            <span className="text-slate-200 truncate max-w-[200px]">{googleReviewUrl}</span>
          </div>
        </div>

        <div className="space-y-3">
          <a
            href={`/c/${cardId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            <span>Test My Live Card Redirect</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          <Link
            href="/"
            className="block text-xs text-slate-500 hover:text-cyan-400 transition pt-2"
          >
            ← Return to ASXFLOW Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center font-black text-slate-950 text-sm">
            A
          </div>
          <span className="font-extrabold text-base tracking-wider text-white">
            ASX<span className="text-cyan-400">FLOW</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
          Card #{cardId}
        </div>
      </div>

      <div className="mb-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-3">
          <LinkIcon className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-white">Link Your Smart Card</h2>
        <p className="text-xs text-slate-400 mt-1">
          Connect this physical standee or card to your genuine Google Review link.
        </p>
      </div>

      <form onSubmit={handleLinkCard} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Business / Shop Name *
          </label>
          <input
            type="text"
            placeholder="e.g. Royal Cafe, Apex Dental Studio"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Owner / Contact Name (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Rahul Sharma"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
            <span>Google Review Link *</span>
            <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-amber-400" /> Direct 5-star link
            </span>
          </label>
          <input
            type="url"
            placeholder="https://g.page/r/.../review or Maps link"
            value={googleReviewUrl}
            onChange={(e) => setGoogleReviewUrl(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
            required
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Tip: Open Google Maps ➔ Your Business ➔ Click &quot;Ask for Reviews&quot; ➔ Copy Link.
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 text-center font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? "Linking Card..." : `Link & Activate Card #${cardId}`}</span>
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
        <span>Works with both NFC Tap and QR Scan</span>
      </div>
    </div>
  );
}

export default function ActivatePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 selection:bg-cyan-500 selection:text-slate-950">
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading card activation...</div>}>
        <ActivateContent />
      </Suspense>

      <p className="text-xs text-slate-600 mt-6">
        Powered by ASXFLOW Smart Review Platform • Independent NFC & QR System
      </p>
    </main>
  );
}
