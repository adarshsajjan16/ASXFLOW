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
  id: string; // e.g. "ASX001"
  customerId: string;
  customerName?: string;
  businessName?: string;
  customDestinationUrl?: string; // Optional override; defaults to customer's googleReviewUrl
  active: boolean;
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
