"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  QrCode,
  Radio,
  Users,
  BarChart3,
  ExternalLink,
  Plus,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  Copy,
  Smartphone,
  Edit2,
  Check,
  X,
  Printer
} from "lucide-react";
import { Customer, Card, ScanRecord } from "@/lib/types";

export default function DashboardPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Active view tab
  const [activeTab, setActiveTab] = useState<"cards" | "customers" | "analytics">("cards");

  // Selected card for QR Code Standee Modal
  const [selectedCardForQR, setSelectedCardForQR] = useState<Card | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [qrLoading, setQrLoading] = useState(false);

  // Selected card for NFC Programming Modal
  const [selectedCardForNFC, setSelectedCardForNFC] = useState<Card | null>(null);
  const [copiedNfcUrl, setCopiedNfcUrl] = useState(false);

  // Modals for creation
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);

  // Editing destination link
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editUrlInput, setEditUrlInput] = useState("");

  // Form states
  const [newCustName, setNewCustName] = useState("");
  const [newCustBiz, setNewCustBiz] = useState("");
  const [newCustReviewUrl, setNewCustReviewUrl] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");

  const [newCardId, setNewCardId] = useState("");
  const [newCardCustomerId, setNewCardCustomerId] = useState("");
  const [batchCount, setBatchCount] = useState<number>(1);

  // Web NFC direct write states
  const [nfcWriting, setNfcWriting] = useState(false);
  const [nfcWriteSuccess, setNfcWriteSuccess] = useState(false);
  const [nfcError, setNfcError] = useState("");

  // Base URL for links
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const [cardsRes, custRes, anaRes] = await Promise.all([
        fetch("/api/cards").then((r) => r.json()),
        fetch("/api/customers").then((r) => r.json()),
        fetch("/api/analytics").then((r) => r.json()),
      ]);

      if (cardsRes.success) setCards(cardsRes.cards);
      if (custRes.success) {
        setCustomers(custRes.customers);
        if (custRes.customers.length > 0 && !newCardCustomerId) {
          setNewCardCustomerId(custRes.customers[0].id);
        }
      }
      if (anaRes.success) setScans(anaRes.scans);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  }

  // Generate QR for modal
  async function openQRModal(card: Card) {
    setSelectedCardForQR(card);
    setQrLoading(true);
    try {
      const res = await fetch(`/api/qr?cardId=${card.id}&format=json`).then((r) => r.json());
      if (res.success) {
        setQrDataUrl(res.dataUrl);
      }
    } catch (err) {
      console.error("QR modal fetch error", err);
    } finally {
      setQrLoading(false);
    }
  }

  // Open NFC modal
  function openNFCModal(card: Card) {
    setSelectedCardForNFC(card);
    setCopiedNfcUrl(false);
  }

  async function toggleCardActive(card: Card) {
    const updatedStatus = !card.active;
    try {
      const res = await fetch("/api/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: card.id, active: updatedStatus }),
      }).then((r) => r.json());

      if (res.success) {
        setCards((prev) =>
          prev.map((c) => (c.id === card.id ? { ...c, active: updatedStatus } : c))
        );
      }
    } catch (err) {
      console.error("Failed to toggle card status", err);
    }
  }

  async function toggleNfcConfigured(card: Card) {
    const updatedStatus = !card.nfcConfigured;
    try {
      const res = await fetch("/api/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: card.id, nfcConfigured: updatedStatus }),
      }).then((r) => r.json());

      if (res.success) {
        setCards((prev) =>
          prev.map((c) => (c.id === card.id ? { ...c, nfcConfigured: updatedStatus } : c))
        );
        if (selectedCardForNFC?.id === card.id) {
          setSelectedCardForNFC({ ...selectedCardForNFC, nfcConfigured: updatedStatus });
        }
      }
    } catch (err) {
      console.error("Failed to update NFC status", err);
    }
  }

  async function saveEditedDestination(cardId: string) {
    if (!editUrlInput.trim()) return;
    try {
      const res = await fetch("/api/cards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cardId, customDestinationUrl: editUrlInput.trim() }),
      }).then((r) => r.json());

      if (res.success) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === cardId ? { ...c, customDestinationUrl: editUrlInput.trim() } : c
          )
        );
        setEditingCardId(null);
      }
    } catch (err) {
      console.error("Failed to save destination url", err);
    }
  }

  async function handleCreateCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!newCustName || !newCustBiz || !newCustReviewUrl) return;

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCustName,
          businessName: newCustBiz,
          googleReviewUrl: newCustReviewUrl,
          contactEmail: newCustEmail,
          contactPhone: newCustPhone,
        }),
      }).then((r) => r.json());

      if (res.success) {
        setShowAddCustomerModal(false);
        setNewCustName("");
        setNewCustBiz("");
        setNewCustReviewUrl("");
        setNewCustEmail("");
        setNewCustPhone("");
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed to add customer", err);
    }
  }

  async function writeDirectNFC(targetUrl: string, card: Card) {
    if (typeof window === "undefined" || !("NDEFReader" in window)) {
      setNfcError("Web NFC is supported in Chrome on Android. For iOS and others, please use the NFC Tools instructions below!");
      return;
    }
    try {
      setNfcWriting(true);
      setNfcError("");
      setNfcWriteSuccess(false);
      // @ts-expect-error Web NFC API
      const ndef = new window.NDEFReader();
      await ndef.write({
        records: [{ recordType: "url", data: targetUrl }],
      });
      setNfcWriteSuccess(true);
      await toggleNfcConfigured(card);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to write NFC chip. Make sure NFC is enabled.";
      setNfcError(errorMsg);
    } finally {
      setNfcWriting(false);
    }
  }

  async function handleCreateCard(e: React.FormEvent) {
    e.preventDefault();
    if (!newCardCustomerId) return;

    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newCardId || undefined,
          customerId: newCardCustomerId,
          batchCount: batchCount > 1 ? batchCount : undefined,
        }),
      }).then((r) => r.json());

      if (res.success) {
        setShowAddCardModal(false);
        setNewCardId("");
        setBatchCount(1);
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Failed to add card", err);
    }
  }

  const totalScans = cards.reduce((sum, c) => sum + (c.totalScans || 0), 0);
  const activeCardsCount = cards.filter((c) => c.active).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center font-black text-slate-950 text-xl shadow-md shadow-cyan-500/20">
              A
            </div>
            <span className="text-xl font-bold tracking-wider text-white">
              ASX<span className="text-cyan-400">FLOW</span>
            </span>
          </Link>
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Control Console
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchDashboardData()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-xs text-slate-300 hover:text-white hover:bg-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-cyan-400 transition"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Total Scans / Taps</span>
              <BarChart3 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white">{totalScans}</div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <span>●</span> Real-time redirect tracking
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Active Cards</span>
              <QrCode className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {activeCardsCount} <span className="text-sm font-normal text-slate-500">/ {cards.length}</span>
            </div>
            <div className="text-[11px] text-cyan-400 mt-1">Live in field</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">Customers</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white">{customers.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Active businesses</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-medium uppercase tracking-wider">NFC Programmed</span>
              <Radio className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {cards.filter((c) => c.nfcConfigured).length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">NTAG chips encoded</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-6">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab("cards")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === "cards"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Cards & QR Codes ({cards.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("customers")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === "customers"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Customers ({customers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === "analytics"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Scan Logs ({scans.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "cards" && (
              <button
                onClick={() => setShowAddCardModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-xl shadow transition"
              >
                <Plus className="w-4 h-4" />
                <span>Issue New Card ID</span>
              </button>
            )}

            {activeTab === "customers" && (
              <button
                onClick={() => setShowAddCustomerModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs rounded-xl shadow transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Merchant</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Cards & QR Codes Table */}
        {activeTab === "cards" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">Loading card records...</div>
            ) : cards.length === 0 ? (
              <div className="p-12 text-center">
                <QrCode className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-white mb-1">No Cards Issued Yet</h4>
                <p className="text-sm text-slate-400 mb-4">Issue your first ASXFLOW card to start generating QR codes.</p>
                <button
                  onClick={() => setShowAddCardModal(true)}
                  className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Create Card
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 border-b border-slate-800 text-xs text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Card ID</th>
                      <th className="py-3.5 px-4">Merchant</th>
                      <th className="py-3.5 px-4">Live Dynamic Destination URL</th>
                      <th className="py-3.5 px-3 text-center">Scans</th>
                      <th className="py-3.5 px-3 text-center">Status</th>
                      <th className="py-3.5 px-3 text-center">NFC</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {cards.map((card) => {
                      const redirectUrl = `${origin}/c/${card.id}`;
                      const isEditing = editingCardId === card.id;

                      return (
                        <tr key={card.id} className="hover:bg-slate-850/50 transition">
                          {/* Card ID */}
                          <td className="py-4 px-4 font-mono font-bold text-cyan-400 whitespace-nowrap">
                            <span className="bg-slate-800/90 px-2 py-1 rounded border border-slate-700">
                              {card.id}
                            </span>
                          </td>

                          {/* Merchant */}
                          <td className="py-4 px-4">
                            <div className="font-semibold text-white">{card.businessName}</div>
                            <div className="text-xs text-slate-400">{card.customerName}</div>
                          </td>

                          {/* Editable Destination URL */}
                          <td className="py-4 px-4 max-w-xs">
                            {isEditing ? (
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="url"
                                  value={editUrlInput}
                                  onChange={(e) => setEditUrlInput(e.target.value)}
                                  className="w-full bg-slate-950 border border-cyan-500 rounded px-2 py-1 text-xs text-white focus:outline-none"
                                  placeholder="https://..."
                                />
                                <button
                                  onClick={() => saveEditedDestination(card.id)}
                                  className="p-1 rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                                  title="Save destination"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingCardId(null)}
                                  className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between group">
                                <a
                                  href={card.customDestinationUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-slate-300 hover:text-cyan-400 truncate max-w-[200px] block"
                                  title={card.customDestinationUrl}
                                >
                                  {card.customDestinationUrl}
                                </a>
                                <button
                                  onClick={() => {
                                    setEditingCardId(card.id);
                                    setEditUrlInput(card.customDestinationUrl || "");
                                  }}
                                  className="text-slate-500 hover:text-cyan-400 p-1 opacity-0 group-hover:opacity-100 transition"
                                  title="Edit Destination Link"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>

                          {/* Total Scans */}
                          <td className="py-4 px-3 text-center font-bold text-white">
                            {card.totalScans}
                          </td>

                          {/* Active / Inactive switch */}
                          <td className="py-4 px-3 text-center">
                            <button
                              onClick={() => toggleCardActive(card)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                                card.active
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              }`}
                              title="Click to toggle active status"
                            >
                              {card.active ? (
                                <>
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Active</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3" />
                                  <span>Paused</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* NFC Configured */}
                          <td className="py-4 px-3 text-center">
                            <button
                              onClick={() => toggleNfcConfigured(card)}
                              className={`p-1.5 rounded-lg border text-xs transition ${
                                card.nfcConfigured
                                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                                  : "bg-slate-800 border-slate-700 text-slate-500"
                              }`}
                              title={card.nfcConfigured ? "NFC Tag Programmed" : "Click to mark as programmed"}
                            >
                              <Radio className="w-3.5 h-3.5" />
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                            {/* Standee Studio Print Button */}
                            <Link
                              href={`/print/${card.id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-400 hover:text-slate-950 text-xs font-semibold text-amber-300 border border-amber-500/30 transition shadow-sm"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print Standee</span>
                            </Link>

                            {/* QR Generator Modal Button */}
                            <button
                              onClick={() => openQRModal(card)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                            >
                              QR Standee
                            </button>

                            {/* NFC Payload Modal Button */}
                            <button
                              onClick={() => openNFCModal(card)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                            >
                              NFC Tool
                            </button>

                            {/* Live Redirect Test */}
                            <a
                              href={redirectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition"
                              title="Test live redirect"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Customers Table */}
        {activeTab === "customers" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {customers.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No customers added yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 border-b border-slate-800 text-xs text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Merchant / Business</th>
                      <th className="py-3.5 px-4">Owner Name</th>
                      <th className="py-3.5 px-4">Assigned Cards</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Default Google Review Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {customers.map((cust) => {
                      const assignedCards = cards.filter((c) => c.customerId === cust.id);

                      return (
                        <tr key={cust.id} className="hover:bg-slate-850/50 transition">
                          <td className="py-4 px-4 font-semibold text-white">
                            {cust.businessName}
                            <span className="block text-xs font-mono text-slate-500">{cust.id}</span>
                          </td>
                          <td className="py-4 px-4 text-slate-300">{cust.name}</td>
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1">
                              {assignedCards.length === 0 ? (
                                <span className="text-xs text-slate-500">None</span>
                              ) : (
                                assignedCards.map((c) => (
                                  <span
                                    key={c.id}
                                    className="px-2 py-0.5 rounded text-xs font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/40"
                                  >
                                    {c.id}
                                  </span>
                                ))
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-400">
                            <div>{cust.contactEmail || "—"}</div>
                            <div>{cust.contactPhone || "—"}</div>
                          </td>
                          <td className="py-4 px-4">
                            <a
                              href={cust.googleReviewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-cyan-400 hover:underline truncate max-w-xs block"
                            >
                              {cust.googleReviewUrl}
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Analytics Scan Logs */}
        {activeTab === "analytics" && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">Recent Customer Interventions</span>
              <span className="text-xs text-slate-500">Auto-logged on every QR scan or NFC tap</span>
            </div>
            {scans.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No scans logged yet. Test a card redirect to record an entry!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 border-b border-slate-800 text-xs text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Card ID</th>
                      <th className="py-3 px-4">Merchant</th>
                      <th className="py-3 px-4">Device</th>
                      <th className="py-3 px-4">User Agent Snippet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {scans.map((scan) => (
                      <tr key={scan.id} className="hover:bg-slate-850/50 transition">
                        <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                          {new Date(scan.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                          {scan.cardId}
                        </td>
                        <td className="py-3 px-4 font-medium text-white">{scan.businessName}</td>
                        <td className="py-3 px-4 text-xs text-emerald-400">{scan.deviceType}</td>
                        <td className="py-3 px-4 text-xs text-slate-500 font-mono truncate max-w-xs">
                          {scan.userAgent || "Direct request"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL 1: QR Standee & Print Preview */}
      {selectedCardForQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedCardForQR(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
                ASXFLOW Standee Generator
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">
                {selectedCardForQR.businessName}
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">Card ID: {selectedCardForQR.id}</p>
            </div>

            {/* Visual Card / Standee Preview Box */}
            <div className="bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-slate-800 rounded-2xl p-6 text-center shadow-inner relative overflow-hidden mb-6">
              {/* Brand Header on Standee */}
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-6 h-6 rounded bg-cyan-500 flex items-center justify-center text-slate-950 font-black text-xs">
                  A
                </div>
                <span className="font-extrabold tracking-wider text-sm text-white">
                  ASX<span className="text-cyan-400">FLOW</span>
                </span>
              </div>

              <div className="text-xs uppercase tracking-widest text-slate-300 font-semibold mb-3">
                Review Us On Google
              </div>

              {/* QR Image with embedded logo styling */}
              <div className="inline-block p-3 bg-white rounded-2xl shadow-xl relative">
                {qrLoading ? (
                  <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                    Generating high-res QR...
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={qrDataUrl}
                    alt={`ASXFLOW QR Code for ${selectedCardForQR.id}`}
                    className="w-48 h-48 rounded-lg"
                  />
                )}
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Scan with Camera or Tap with NFC</span>
              </div>

              <div className="mt-2 text-[11px] font-mono text-cyan-300 bg-slate-950/80 py-1 px-3 rounded-full inline-block border border-slate-800">
                {origin}/c/{selectedCardForQR.id}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={qrDataUrl}
                download={`ASXFLOW-${selectedCardForQR.id}.png`}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </a>

              <a
                href={`/api/qr?cardId=${selectedCardForQR.id}&format=svg`}
                download={`ASXFLOW-${selectedCardForQR.id}.svg`}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download SVG (Vector)</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: NFC Programming Instructions & Payload */}
      {selectedCardForNFC && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedCardForNFC(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
                  NFC Tag Programming
                </span>
                <h3 className="text-xl font-bold text-white">Card ID: {selectedCardForNFC.id}</h3>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-5">
              <span className="text-xs text-slate-400 block mb-1 font-medium">NDEF URI Record to write:</span>
              <div className="flex items-center justify-between gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <code className="text-xs font-mono text-cyan-300 break-all">
                  {origin}/c/{selectedCardForNFC.id}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${origin}/c/${selectedCardForNFC.id}`);
                    setCopiedNfcUrl(true);
                    setTimeout(() => setCopiedNfcUrl(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 transition"
                >
                  {copiedNfcUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Direct Browser Web NFC Write Button */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => writeDirectNFC(`${origin}/c/${selectedCardForNFC.id}`, selectedCardForNFC)}
                disabled={nfcWriting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Radio className={`w-4 h-4 ${nfcWriting ? "animate-ping" : ""}`} />
                <span>
                  {nfcWriting
                    ? "Ready! Hold phone near NFC card now..."
                    : "⚡ Write Directly via Phone (Chrome Android)"}
                </span>
              </button>

              {nfcWriteSuccess && (
                <div className="mt-2 text-xs text-emerald-400 text-center font-medium">
                  ✓ Successfully programmed to physical NFC chip!
                </div>
              )}
              {nfcError && (
                <div className="mt-2 text-xs text-amber-400 text-center font-medium">
                  {nfcError}
                </div>
              )}
            </div>

            {/* Quick 3-step guide for NFC Tools */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                How to write using free &quot;NFC Tools&quot; app:
              </h4>

              <div className="text-xs text-slate-300 space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Install <b>NFC Tools</b> from Google Play Store or Apple App Store.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <span>Tap <b>Write</b> ➔ <b>Add a record</b> ➔ <b>Custom URL / URI</b>, then paste the copied link.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <span>Tap <b>Write / NDEF</b> and hold the phone against your physical NTAG213/215 card.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => toggleNfcConfigured(selectedCardForNFC)}
              className={`w-full py-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                selectedCardForNFC.nfcConfigured
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  : "bg-cyan-500 hover:bg-cyan-400 text-slate-950"
              }`}
            >
              {selectedCardForNFC.nfcConfigured ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Marked as Programmed (Click to unmark)</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Mark This Card as Programmed</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Issue New Card */}
      {showAddCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddCardModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Issue New ASXFLOW Card</h3>
            <p className="text-xs text-slate-400 mb-5">Assign a new QR & NFC ID to a merchant.</p>

            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Select Customer / Merchant *
                </label>
                <select
                  value={newCardCustomerId}
                  onChange={(e) => setNewCardCustomerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  required
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.businessName} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Batch Generation (Create multiple cards at once)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 5, 10, 25].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setBatchCount(count)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition ${
                        batchCount === count
                          ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {count === 1 ? "1 Card" : `${count} Cards`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Custom Card ID (Optional, only used when creating 1 card)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ASX004 or VIP-01"
                  value={newCardId}
                  onChange={(e) => setNewCardId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none uppercase font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-bold text-xs text-slate-950 transition shadow"
                >
                  Create & Activate Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Add Merchant */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddCustomerModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">Add New Merchant</h3>
            <p className="text-xs text-slate-400 mb-5">Register a business with their Google Review destination.</p>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ocean View Cafe"
                  value={newCustBiz}
                  onChange={(e) => setNewCustBiz(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Owner / Contact Person *
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Merchant Google Review URL *
                </label>
                <input
                  type="url"
                  placeholder="https://g.page/r/.../review or Maps link"
                  value={newCustReviewUrl}
                  onChange={(e) => setNewCustReviewUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="contact@biz.com"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+91..."
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-bold text-xs text-slate-950 transition shadow"
                >
                  Save Merchant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
