export interface TechSpec {
  label: string;
  value: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SeoMeta {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  priceCents: number;
  currency: 'USD' | 'IDR';
  category: string;
  thumbnailUrl: string;
  bannerUrl: string;
  fileKey: string;
  fileSizeMb: number;
  roughBullets: string;
  hookBullets: string[];
  techSpecs: TechSpec[];
  faqs: FAQItem[];
  fullMarkdownCopy: string;
  seoMeta: SeoMeta;
  compatibility: string[];
  createdAt: string;
  status: 'active' | 'draft' | 'archived';
  featured?: boolean;
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  customerEmail: string;
  customerName: string;
  amountCents: number;
  currency: string;
  paymentGateway: 'stripe' | 'midtrans' | 'mayar' | 'simulated';
  gatewayTransactionId: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  createdAt: string;
  paidAt: string | null;
}

export interface DownloadToken {
  token: string;
  orderId: string;
  productId: string;
  productTitle: string;
  fileKey: string;
  fileSizeMb: number;
  r2SignedUrl: string;
  expiresAt: number; // timestamp in ms (10 minutes)
  maxDownloads: number;
  downloadCount: number;
  isUsed: boolean;
  createdAt: string;
  clientIp?: string;
}

export interface AiCopywritingRequest {
  productName: string;
  roughBullets: string;
  category?: string;
  targetTools?: string[];
  tone?: string;
}

export interface AiCopywritingResult {
  title: string;
  hookBullets: [string, string, string] | string[];
  techSpecs: TechSpec[];
  faqs: FAQItem[];
  rawMarkdown: string;
  seoMeta: SeoMeta;
}

export interface WebhookPaymentPayload {
  gateway: 'stripe' | 'midtrans' | 'mayar';
  eventType: string;
  orderId: string;
  productId: string;
  customerEmail: string;
  customerName: string;
  amount: number;
  currency: string;
  transactionId: string;
  signature?: string;
  status: string;
}

export interface DatabaseStats {
  productsCount: number;
  ordersCount: number;
  tokensCount: number;
  activeTokensCount: number;
  totalRevenueCents: number;
}
