"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function CardStatusContent() {
  const searchParams = useSearchParams();
  const cardId = searchParams.get("card") || "UNKNOWN";
  const reason = searchParams.get("reason") || "not_found";

  const isInactive = reason === "inactive";

  return (
    <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-6 text-2xl font-bold font-mono">
        {cardId.slice(0, 3)}
      </div>

      <h1 className="text-2xl font-extrabold text-white mb-2">
        {isInactive ? "Card Temporarily Inactive" : "Card Not Activated"}
      </h1>

      <div className="inline-block px-3 py-1 rounded-full bg-slate-800 text-cyan-400 text-xs font-mono font-bold mb-4">
        ID: {cardId}
      </div>

      <p className="text-slate-400 text-sm leading-relaxed mb-6">
        {isInactive
          ? "This ASXFLOW card has been paused by the business administrator. Please check back later or notify the staff."
          : "This ASXFLOW NFC card or QR standee has not been assigned to a live merchant yet."}
      </p>

      <div className="border-t border-slate-800 pt-6">
        <Link
          href="/"
          className="inline-flex items-center justify-center w-full rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
        >
          Return to ASXFLOW Home
        </Link>
      </div>
    </div>
  );
}

export default function CardStatusPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading card status...</div>}>
        <CardStatusContent />
      </Suspense>

      <p className="text-xs text-slate-600 mt-8">
        Powered by ASXFLOW Smart Review Platform
      </p>
    </main>
  );
}
