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
      name: "abhi",
      businessName: "asx company",
      googleReviewUrl: "https://www.instagram.com/abhisajjann._?obrf=cms2cjlkZGd5d3R0",
      contactEmail: "",
      contactPhone: "",
      createdAt: new Date().toISOString(),
    },
  ],
  cards: [
    {
      id: "ABHI",
      customerId: "CUST001",
      active: true,
      nfcConfigured: true,
      totalScans: 12,
      customDestinationUrl: "https://www.instagram.com/abhisajjann._?obrf=cms2cjlkZGd5d3R0",
      createdAt: new Date().toISOString(),
    },
    {
      id: "ASX001",
      customerId: "CUST001",
      active: true,
      nfcConfigured: true,
      totalScans: 52,
      customDestinationUrl: "https://www.instagram.com/abhisajjann._?obrf=cms2cjlkZGd5d3R0",
      createdAt: new Date().toISOString(),
    },
  ],
  scans: [
    {
      id: "SCAN001",
      cardId: "ABHI",
      businessName: "asx company",
      timestamp: new Date().toISOString(),
      userAgent: "Direct Cloud verification",
      deviceType: "Mobile",
    },
  ],
};

const TMP_DATA_FILE = path.join("/tmp", "asxflow-db.json");
let memoryCache: DBData | null = null;

function readDB(): DBData {
  if (memoryCache) {
    return memoryCache;
  }
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      memoryCache = JSON.parse(raw) as DBData;
      return memoryCache;
    }
    if (fs.existsSync(TMP_DATA_FILE)) {
      const raw = fs.readFileSync(TMP_DATA_FILE, "utf-8");
      memoryCache = JSON.parse(raw) as DBData;
      return memoryCache;
    }
    memoryCache = { ...INITIAL_DATA };
    return memoryCache;
  } catch (err) {
    console.error("Error reading database file, using fallback:", err);
    memoryCache = { ...INITIAL_DATA };
    return memoryCache;
  }
}

function writeDB(data: DBData): void {
  memoryCache = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    try {
      fs.writeFileSync(TMP_DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch {
      // Memory cache is already updated
    }
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

  deleteCustomer(id: string): boolean {
    const db = readDB();
    const index = db.customers.findIndex((c) => c.id === id);
    if (index === -1) return false;
    db.customers.splice(index, 1);
    db.cards = db.cards.filter((card) => card.customerId !== id);
    writeDB(db);
    return true;
  },

  deleteCard(id: string): boolean {
    const db = readDB();
    const index = db.cards.findIndex((c) => c.id.toLowerCase() === id.toLowerCase());
    if (index === -1) return false;
    db.cards.splice(index, 1);
    writeDB(db);
    return true;
  },
};
