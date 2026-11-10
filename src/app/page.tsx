import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500 selection:text-slate-950">
      {/* Background glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6 border-b border-slate-800/80 backdrop-blur-md bg-slate-950/60 sticky top-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-cyan-500/30">
            A
          </div>
          <h1 className="text-2xl font-bold tracking-wider">
            ASX<span className="text-cyan-400">FLOW</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="rounded-lg bg-cyan-500 px-5 py-2.5 font-semibold text-slate-950 hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
          >
            Open Admin Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex min-h-[75vh] flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto pt-8">
        <p className="mb-5 text-xs sm:text-sm font-semibold tracking-[0.3em] text-cyan-400 uppercase bg-cyan-950/40 px-4 py-1.5 rounded-full border border-cyan-800/40">
          Smart NFC • Dynamic QR • Digital Review Platform
        </p>

        <h2 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
          Connect Your Business <br />
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            With One Tap.
          </span>
        </h2>

        <p className="mt-7 max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
          Manage proprietary QR codes, NFC standees/cards, and digital customer review experiences independently. Full ownership, zero third-party dependencies.
        </p>

        {/* Live Interactive Concept Pill */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-mono text-slate-300 bg-slate-900/90 border border-slate-800 px-5 py-3 rounded-2xl shadow-xl">
          <span className="text-cyan-400 font-bold">NFC Tap / QR Scan</span>
          <span className="text-slate-500">➔</span>
          <span className="bg-slate-800 px-2.5 py-1 rounded text-cyan-300 font-semibold">asxflow.in/c/ASX001</span>
          <span className="text-slate-500">➔</span>
          <span className="text-emerald-400 font-medium">Customer Google Review</span>
        </div>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#features"
            className="rounded-xl bg-cyan-500 px-8 py-4 font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/25 text-base"
          >
            Get Started
          </a>
          <a
            href="#how-it-works"
            className="rounded-xl border border-slate-700 bg-slate-900/80 px-8 py-4 font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all text-base"
          >
            How ASXFLOW Works
          </a>
        </div>
      </section>

      {/* How It Works Architecture Section */}
      <section id="how-it-works" className="relative z-10 px-6 lg:px-12 py-16 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-cyan-400 text-xs font-bold tracking-widest uppercase">System Flow</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-2">How The ASXFLOW Redirect Works</h2>
            <p className="text-slate-400 text-sm mt-2">You retain 100% control over the destination link even after cards are printed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl">
              <div className="text-cyan-400 font-bold text-sm mb-2">Step 1</div>
              <h4 className="font-bold text-lg text-white mb-2">Unique Card ID</h4>
              <p className="text-sm text-slate-400">Each physical standee or NFC card is issued an ID like <code className="text-cyan-300 bg-slate-800 px-1 py-0.5 rounded">ASX001</code>.</p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl">
              <div className="text-cyan-400 font-bold text-sm mb-2">Step 2</div>
              <h4 className="font-bold text-lg text-white mb-2">Dual Interaction</h4>
              <p className="text-sm text-slate-400">Customers scan the generated QR or tap their smartphone via NFC.</p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl">
              <div className="text-cyan-400 font-bold text-sm mb-2">Step 3</div>
              <h4 className="font-bold text-lg text-white mb-2">ASXFLOW Engine</h4>
              <p className="text-sm text-slate-400">ASXFLOW resolves the token, records scan analytics, and redirects instantaneously.</p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl">
              <div className="text-cyan-400 font-bold text-sm mb-2">Step 4</div>
              <h4 className="font-bold text-lg text-white mb-2">Google Review</h4>
              <p className="text-sm text-slate-400">Directly opens the merchant&apos;s verified review prompt on Google Maps.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 lg:px-12 py-16">
        <h2 className="mb-10 text-center text-3xl font-bold">
          Our Platform Modules
        </h2>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          {[
            {
              title: "QR Generator",
              description: "Create unique, high-resolution SVG/PNG QR codes for every customer and standee.",
              badge: "Phase 2"
            },
            {
              title: "NFC Technology",
              description: "Program NDEF URI records directly to NTAG213/215 cards using the same ASXFLOW link.",
              badge: "Phase 4"
            },
            {
              title: "Smart Dashboard",
              description: "Manage customers, swap destination links anytime without reprinting, and track scans.",
              badge: "Phase 5"
            }
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-7 hover:border-cyan-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-cyan-400">
                    {feature.title}
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                    {feature.badge}
                  </span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>ASXFLOW Engine</span>
                <span className="text-cyan-400 font-semibold">Ready</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 px-6 py-8 text-center text-slate-500 text-sm">
        <p>© 2026 ASXFLOW. All rights reserved. Independent Smart NFC & QR Platform.</p>
      </footer>
    </main>
  );
}
