import fs from "fs";
import path from "path";
import { Customer, Card, ScanRecord } from "./types";

interface DBData {
  customers: Customer[];
  cards: Card[];
  scans: ScanRecord[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "asxflow-db.json");

const INITIAL_DATA: DBData = {
  customers: [
    {
      id: "CUST001",
      name: "Rahul Sharma",
      businessName: "The Grand Aroma Cafe",
      googleReviewUrl: "https://maps.google.com/?q=The+Grand+Aroma+Cafe",
      contactEmail: "rahul@grandaroma.com",
      contactPhone: "+91 98765 43210",
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: "CUST002",
      name: "Dr. Ananya Roy",
      businessName: "Apex Dental Clinic",
      googleReviewUrl: "https://maps.google.com/?q=Apex+Dental+Clinic",
      contactEmail: "clinic@apexdental.com",
      contactPhone: "+91 91234 56789",
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ],
  cards: [
    {
      id: "ASX001",
      customerId: "CUST001",
      active: true,
      nfcConfigured: true,
      totalScans: 48,
      lastScannedAt: new Date(Date.now() - 15 * 60000).toISOString(),
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: "ASX002",
      customerId: "CUST002",
      active: true,
      nfcConfigured: true,
      totalScans: 23,
      lastScannedAt: new Date(Date.now() - 45 * 60000).toISOString(),
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: "ASX003",
      customerId: "CUST001",
      active: true,
      nfcConfigured: false,
      totalScans: 5,
      lastScannedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ],
  scans: [
    {
      id: "SCAN001",
      cardId: "ASX001",
      businessName: "The Grand Aroma Cafe",
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4)",
      deviceType: "Mobile (iOS)",
    },
    {
      id: "SCAN002",
      cardId: "ASX002",
      businessName: "Apex Dental Clinic",
      timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
      userAgent: "Mozilla/5.0 (Linux; Android 14; SM-S928B)",
      deviceType: "Mobile (Android)",
    },
    {
      id: "SCAN003",
      cardId: "ASX001",
      businessName: "The Grand Aroma Cafe",
      timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
      userAgent: "Mozilla/5.0 (Linux; Android 13; Pixel 7)",
      deviceType: "Mobile (Android)",
    },
  ],
};

function readDB(): DBData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_DATA, null, 2), "utf-8");
      return INITIAL_DATA;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw) as DBData;
  } catch (err) {
    console.error("Error reading database file, using fallback:", err);
    return INITIAL_DATA;
  }
}

function writeDB(data: DBData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

export const DB = {
  getCustomers(): Customer[] {
    const db = readDB();
    return db.customers;
  },

  addCustomer(customer: Omit<Customer, "id" | "createdAt">): Customer {
    const db = readDB();
    const id = `CUST${String(db.customers.length + 1).padStart(3, "0")}`;
    const newCustomer: Customer = {
      ...customer,
      id,
      createdAt: new Date().toISOString(),
    };
    db.customers.push(newCustomer);
    writeDB(db);
    return newCustomer;
  },

  getCards(): Card[] {
    const db = readDB();
    const customerMap = new Map(db.customers.map((c) => [c.id, c]));

    return db.cards.map((card) => {
      const cust = customerMap.get(card.customerId);
      return {
        ...card,
        customerName: cust?.name || "Unknown Customer",
        businessName: cust?.businessName || "Unknown Business",
        customDestinationUrl: card.customDestinationUrl || cust?.googleReviewUrl || "",
      };
    });
  },

  getCardById(id: string): (Card & { destinationUrl: string }) | null {
    const db = readDB();
    const card = db.cards.find((c) => c.id.toLowerCase() === id.toLowerCase());
    if (!card) return null;

    const cust = db.customers.find((c) => c.id === card.customerId);
    const destinationUrl = card.customDestinationUrl || cust?.googleReviewUrl || "https://google.com";

    return {
      ...card,
      customerName: cust?.name,
      businessName: cust?.businessName,
      destinationUrl,
    };
  },

  createCard(data: { id?: string; customerId: string; customDestinationUrl?: string }): Card {
    const db = readDB();
    const nextNumber = db.cards.length + 1;
    const cardId = data.id?.trim().toUpperCase() || `ASX${String(nextNumber).padStart(3, "0")}`;

    const newCard: Card = {
      id: cardId,
      customerId: data.customerId,
      customDestinationUrl: data.customDestinationUrl?.trim() || undefined,
      active: true,
      nfcConfigured: false,
      totalScans: 0,
      createdAt: new Date().toISOString(),
    };

    db.cards.push(newCard);
    writeDB(db);

    const cust = db.customers.find((c) => c.id === data.customerId);
    return {
      ...newCard,
      customerName: cust?.name,
      businessName: cust?.businessName,
    };
  },

  updateCard(id: string, updates: Partial<Card>): Card | null {
    const db = readDB();
    const index = db.cards.findIndex((c) => c.id.toLowerCase() === id.toLowerCase());
    if (index === -1) return null;

    db.cards[index] = {
      ...db.cards[index],
      ...updates,
    };

    writeDB(db);
    return db.cards[index];
  },

  recordScan(cardId: string, userAgent = ""): void {
    const db = readDB();
    const cardIndex = db.cards.findIndex((c) => c.id.toLowerCase() === cardId.toLowerCase());
    if (cardIndex === -1) return;

    db.cards[cardIndex].totalScans += 1;
    const now = new Date().toISOString();
    db.cards[cardIndex].lastScannedAt = now;

    const cust = db.customers.find((c) => c.id === db.cards[cardIndex].customerId);

    let deviceType = "Desktop Browser";
    if (/iphone|ipad|ipod/i.test(userAgent)) deviceType = "Mobile (iOS)";
    else if (/android/i.test(userAgent)) deviceType = "Mobile (Android)";
    else if (/mobile/i.test(userAgent)) deviceType = "Mobile";

    const scan: ScanRecord = {
      id: `SCAN${Date.now().toString(36).toUpperCase()}`,
      cardId: db.cards[cardIndex].id,
      businessName: cust?.businessName || "Unknown Business",
      timestamp: now,
      userAgent: userAgent.slice(0, 100),
      deviceType,
    };

    db.scans.unshift(scan);
    if (db.scans.length > 100) db.scans.pop();

    writeDB(db);
  },

  getScans(): ScanRecord[] {
    const db = readDB();
    return db.scans;
  },
};
