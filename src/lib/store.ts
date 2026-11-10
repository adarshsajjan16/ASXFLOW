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
      linked: true,
      active: true,
      nfcConfigured: true,
      totalScans: 12,
      customDestinationUrl: "https://www.instagram.com/abhisajjann._?obrf=cms2cjlkZGd5d3R0",
      createdAt: new Date().toISOString(),
    },
    {
      id: "ASX001",
      customerId: "CUST001",
      linked: true,
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
      const cust = card.customerId ? customerMap.get(card.customerId) : undefined;
      const destination = card.customDestinationUrl || cust?.googleReviewUrl || "";
      const isLinked = Boolean(destination && destination.trim().length > 0);

      return {
        ...card,
        customerName: cust?.name || "Unassigned",
        businessName: cust?.businessName || "Unlinked Stock",
        customDestinationUrl: destination,
        linked: isLinked,
      };
    });
  },

  getCardById(id: string): (Card & { destinationUrl: string }) | null {
    const db = readDB();
    const card = db.cards.find((c) => c.id.toLowerCase() === id.toLowerCase());
    if (!card) return null;

    const cust = card.customerId ? db.customers.find((c) => c.id === card.customerId) : undefined;
    const destinationUrl = card.customDestinationUrl || cust?.googleReviewUrl || "";
    const isLinked = Boolean(destinationUrl && destinationUrl.trim().length > 0);

    return {
      ...card,
      customerName: cust?.name,
      businessName: cust?.businessName,
      destinationUrl,
      linked: isLinked,
    };
  },

  linkCard(cardId: string, data: { businessName: string; destinationUrl: string; customerName?: string }): Card {
    const db = readDB();
    const idUpper = cardId.trim().toUpperCase();
    let cardIndex = db.cards.findIndex((c) => c.id.toLowerCase() === idUpper.toLowerCase());

    // Find or create customer
    let cust = db.customers.find(
      (c) => c.businessName.toLowerCase() === data.businessName.trim().toLowerCase()
    );
    if (!cust) {
      const custId = `CUST${String(db.customers.length + 1).padStart(3, "0")}`;
      cust = {
        id: custId,
        name: data.customerName?.trim() || data.businessName.trim(),
        businessName: data.businessName.trim(),
        googleReviewUrl: data.destinationUrl.trim(),
        createdAt: new Date().toISOString(),
      };
      db.customers.push(cust);
    }

    if (cardIndex === -1) {
      const newCard: Card = {
        id: idUpper,
        customerId: cust.id,
        customDestinationUrl: data.destinationUrl.trim(),
        active: true,
        linked: true,
        nfcConfigured: false,
        totalScans: 0,
        createdAt: new Date().toISOString(),
      };
      db.cards.push(newCard);
      cardIndex = db.cards.length - 1;
    } else {
      db.cards[cardIndex].customerId = cust.id;
      db.cards[cardIndex].customDestinationUrl = data.destinationUrl.trim();
      db.cards[cardIndex].linked = true;
      db.cards[cardIndex].active = true;
    }

    writeDB(db);

    return {
      ...db.cards[cardIndex],
      customerName: cust.name,
      businessName: cust.businessName,
    };
  },

  unlinkCard(cardId: string): Card | null {
    const db = readDB();
    const cardIndex = db.cards.findIndex((c) => c.id.toLowerCase() === cardId.toLowerCase());
    if (cardIndex === -1) return null;

    db.cards[cardIndex].linked = false;
    db.cards[cardIndex].customDestinationUrl = "";
    db.cards[cardIndex].customerId = undefined;

    writeDB(db);
    return db.cards[cardIndex];
  },

  createCard(data: { id?: string; customerId: string; customDestinationUrl?: string }): Card {
    const db = readDB();
    const nextNumber = db.cards.length + 1;
    const cardId = data.id?.trim().toUpperCase() || `ASX${String(nextNumber).padStart(3, "0")}`;

    const newCard: Card = {
      id: cardId,
      customerId: data.customerId,
      customDestinationUrl: data.customDestinationUrl?.trim() || undefined,
      linked: Boolean(data.customDestinationUrl || data.customerId),
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
