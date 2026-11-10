export interface Customer {
  id: string;
  name: string;
  businessName: string;
  googleReviewUrl: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
}

export interface Card {
  id: string; // e.g. "001", "002" or "ASX001"
  customerId?: string;
  customerName?: string;
  businessName?: string;
  customDestinationUrl?: string; // Google Review URL
  linked: boolean; // true = assigned & active, false = blank stock ready to link
  active: boolean; // active/paused toggle
  nfcConfigured: boolean;
  totalScans: number;
  lastScannedAt?: string;
  createdAt: string;
}

export interface ScanRecord {
  id: string;
  cardId: string;
  businessName: string;
  timestamp: string;
  userAgent?: string;
  deviceType?: string;
}
