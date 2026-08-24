import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { INITIAL_PRODUCTS } from './src/data/initialProducts';
import { Product, Order, DownloadToken, AiCopywritingResult } from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Cloudflare D1 Database Engine Simulation
// Tables: products, orders, download_tokens, webhook_logs
class CloudflareD1Simulation {
  private products: Map<string, Product> = new Map();
  private orders: Map<string, Order> = new Map();
  private downloadTokens: Map<string, DownloadToken> = new Map();
  private webhookLogs: Array<{
    id: string;
    gateway: string;
    timestamp: string;
    payload: any;
    status: string;
    createdToken?: string;
  }> = [];

  constructor() {
    INITIAL_PRODUCTS.forEach((p) => this.products.set(p.id, p));
  }

  // Products
  getAllProducts(): Product[] {
    return Array.from(this.products.values());
  }

  getProductById(id: string): Product | undefined {
    return this.products.get(id);
  }

  saveProduct(product: Product): Product {
    this.products.set(product.id, product);
    return product;
  }

  deleteProduct(id: string): boolean {
    return this.products.delete(id);
  }

  // Orders
  getAllOrders(): Order[] {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.get(id);
  }

  createOrder(order: Order): Order {
    this.orders.set(order.id, order);
    return order;
  }

  updateOrderStatus(orderId: string, status: 'paid' | 'pending' | 'failed', paidAt?: string): Order | undefined {
    const order = this.orders.get(orderId);
    if (order) {
      order.paymentStatus = status;
      if (paidAt) order.paidAt = paidAt;
      this.orders.set(orderId, order);
    }
    return order;
  }

  // Download Tokens (R2 Signed URLs with strict 10-min TTL)
  createDownloadToken(orderId: string, productId: string, clientIp?: string): DownloadToken {
    const product = this.getProductById(productId);
    const token = 'r2_sig_' + crypto.randomBytes(24).toString('hex');
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000; // Strictly 10 minutes (600,000 ms)

    // Generate Cloudflare R2 Presigned S3-compatible URL representation
    const r2SignedUrl = `https://r2.artvault-cdn.net/${product?.fileKey.replace('r2://', '')}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=cf-r2-vault%2F${new Date().toISOString().slice(0, 10)}&X-Amz-Date=${new Date().toISOString().replace(/[:-]|\.\d{3}/g, '')}&X-Amz-Expires=600&X-Amz-Signature=${crypto.randomBytes(32).toString('hex')}&token=${token}`;

    const downloadToken: DownloadToken = {
      token,
      orderId,
      productId,
      productTitle: product?.title || 'Digital Asset Pack',
      fileKey: product?.fileKey || 'r2://vault-art/asset_pack.zip',
      fileSizeMb: product?.fileSizeMb || 450,
      r2SignedUrl,
      expiresAt,
      maxDownloads: 5,
      downloadCount: 0,
      isUsed: false,
      createdAt: new Date().toISOString(),
      clientIp,
    };

    this.downloadTokens.set(token, downloadToken);
    return downloadToken;
  }

  getDownloadToken(token: string): DownloadToken | undefined {
    return this.downloadTokens.get(token);
  }

  recordDownloadUsage(token: string): { success: boolean; message: string; tokenData?: DownloadToken } {
    const tokenData = this.downloadTokens.get(token);
    if (!tokenData) {
      return { success: false, message: 'Invalid or revoked signed token.' };
    }

    const now = Date.now();
    if (now > tokenData.expiresAt) {
      return {
        success: false,
        message: `Signed URL expired ${(Math.round((now - tokenData.expiresAt) / 1000))}s ago. The 10-minute security window has closed.`,
      };
    }

    if (tokenData.downloadCount >= tokenData.maxDownloads) {
      return {
        success: false,
        message: 'Maximum download limit reached for this signed token session.',
      };
    }

    tokenData.downloadCount += 1;
    tokenData.isUsed = true;
    this.downloadTokens.set(token, tokenData);

    return { success: true, message: 'Token verified. Streaming digital master.', tokenData };
  }

  getAllTokens(): DownloadToken[] {
    return Array.from(this.downloadTokens.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Webhook audit logs
  logWebhook(entry: { gateway: string; payload: any; status: string; createdToken?: string }) {
    this.webhookLogs.unshift({
      id: 'whlog_' + crypto.randomBytes(8).toString('hex'),
      timestamp: new Date().toISOString(),
      ...entry,
    });
  }

  getWebhookLogs() {
    return this.webhookLogs.slice(0, 50);
  }

  getStats() {
    const orders = this.getAllOrders();
    const paidOrders = orders.filter((o) => o.paymentStatus === 'paid');
    const revenue = paidOrders.reduce((sum, o) => sum + o.amountCents, 0);
    const now = Date.now();
    const activeTokens = Array.from(this.downloadTokens.values()).filter((t) => t.expiresAt > now);

    return {
      productsCount: this.products.size,
      ordersCount: orders.length,
      tokensCount: this.downloadTokens.size,
      activeTokensCount: activeTokens.length,
      totalRevenueCents: revenue,
    };
  }
}

const db = new CloudflareD1Simulation();

// Initialize Gemini Client
const getGenAI = () => {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// ==========================================
// 1. PRODUCTS API
// ==========================================

app.get('/api/products', (req: Request, res: Response) => {
  res.json({ success: true, products: db.getAllProducts() });
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }
  res.json({ success: true, product });
});

app.post('/api/products', (req: Request, res: Response) => {
  try {
    const raw = req.body;
    const newProduct: Product = {
      id: raw.id || 'prod_' + crypto.randomBytes(6).toString('hex'),
      title: raw.title || 'Untitled Asset Pack',
      slug: (raw.title || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      tagline: raw.tagline || '',
      priceCents: typeof raw.priceCents === 'number' ? raw.priceCents : 2900,
      currency: raw.currency || 'USD',
      category: raw.category || 'Motion Assets',
      thumbnailUrl: raw.thumbnailUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      bannerUrl: raw.bannerUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
      fileKey: raw.fileKey || `r2://vault-art/${Date.now()}_asset_master.zip`,
      fileSizeMb: raw.fileSizeMb || 850,
      roughBullets: raw.roughBullets || '',
      hookBullets: Array.isArray(raw.hookBullets) ? raw.hookBullets : [],
      techSpecs: Array.isArray(raw.techSpecs) ? raw.techSpecs : [],
      faqs: Array.isArray(raw.faqs) ? raw.faqs : [],
      fullMarkdownCopy: raw.fullMarkdownCopy || '',
      seoMeta: raw.seoMeta || {
        metaTitle: raw.title,
        metaDescription: raw.tagline,
        keywords: ['AI animation', 'digital art', 'motion assets'],
      },
      compatibility: Array.isArray(raw.compatibility) ? raw.compatibility : ['Runway Gen-3', 'ComfyUI', 'Kling 1.5'],
      createdAt: new Date().toISOString(),
      status: raw.status || 'active',
      featured: Boolean(raw.featured),
    };

    db.saveProduct(newProduct);
    res.status(201).json({ success: true, product: newProduct });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/products/:id', (req: Request, res: Response) => {
  const existing = db.getProductById(req.params.id);
  if (!existing) {
    res.status(404).json({ success: false, error: 'Product not found' });
    return;
  }

  const updated: Product = {
    ...existing,
    ...req.body,
    id: existing.id,
  };

  db.saveProduct(updated);
  res.json({ success: true, product: updated });
});

app.delete('/api/products/:id', (req: Request, res: Response) => {
  const deleted = db.deleteProduct(req.params.id);
  res.json({ success: deleted });
});

// ==========================================
// 2. AI ASSIST COPYWRITER & SEO SPECIALIST
// ==========================================

app.post('/api/admin/ai-assist', async (req: Request, res: Response) => {
  try {
    const { productName, roughBullets, category, targetTools, tone } = req.body;

    if (!productName || !roughBullets) {
      res.status(400).json({
        success: false,
        error: 'Product name and rough bullet points are required.',
      });
      return;
    }

    const ai = getGenAI();

    const systemPrompt = `You are an elite E-Commerce Copywriting & SEO Specialist for Digital Art Products and AI Animation Assets (Motion Packs, LoRAs, Depth Maps, ProRes Alpha VFX, ComfyUI Workflows, Sora/Kling Prompt Vectors).

Your job is: Given a short product name and rough bullet points, generate:
1. A high-converting product title (punchy, clear format, SEO optimized).
2. Exactly 3 persuasive hook bullet points highlighting specific, tangible benefits for AI animators and creators (e.g., temporal stability, 60fps consistency, zero flicker, ControlNet ready, ProRes 4444 unmultiplied alpha, workflow speedup).
3. A technical specifications checklist (e.g., Resolution, File format, FPS, Bit depth, File Size, AI Tool compatibility like Runway Gen-3, Kling, Sora, ComfyUI, AnimateDiff, Luma).
4. FAQ section addressing common license terms, commercial usage, model training rights, and the 10-minute temporary signed download vault.
5. Meta title, meta description, and SEO keywords.

Return the response formatted as strict JSON with this schema:
{
  "title": "High converting product title",
  "tagline": "A powerful 1-sentence subtitle",
  "hookBullets": [
    "⚡ **Benefit 1 Header**: Detailed high-value benefit sentence.",
    "🚀 **Benefit 2 Header**: Detailed high-value benefit sentence.",
    "💎 **Benefit 3 Header**: Detailed high-value benefit sentence."
  ],
  "techSpecs": [
    { "label": "Resolution & FPS", "value": "3840x2160 (4K UHD) @ 60 FPS" },
    { "label": "File Format & Codec", "value": "Apple ProRes 4444 with Alpha + PNG Seq" },
    { "label": "AI Compatibility", "value": "Runway Gen-3, Kling 1.5, Sora, ComfyUI, AnimateDiff" },
    { "label": "Color Space", "value": "ACEScg / Rec.709 Linear" },
    { "label": "License", "value": "Royalty-Free Commercial License" }
  ],
  "faqs": [
    { "question": "Can I use these assets in client commercial productions?", "answer": "Yes, full royalty-free commercial usage rights are included with no royalties or credits required." },
    { "question": "How do I import these assets into ComfyUI / Kling?", "answer": "..." },
    { "question": "How does the 10-minute download security vault work?", "answer": "Upon checkout, Cloudflare R2 issues an ephemeral cryptographically signed URL valid for 10 minutes to prevent unauthorized URL sharing." }
  ],
  "rawMarkdown": "Full clean markdown representation combining Title, Tagline, Key Benefits, Technical Specs checklist (- [x]), and FAQs",
  "seoMeta": {
    "metaTitle": "SEO optimized title under 60 chars",
    "metaDescription": "High CTR meta description with keywords under 160 chars",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
  }
}`;

    const userPrompt = `Product Name: ${productName}
Category: ${category || 'Digital Art & Motion Asset'}
Target AI Tools: ${targetTools?.join(', ') || 'Runway Gen-3, Kling 1.5, ComfyUI, Sora, AnimateDiff'}
Tone: ${tone || 'High-Impact, Technical Authority & Creator-Centric'}

Rough Product Notes & Bullets:
${roughBullets}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            tagline: { type: Type.STRING },
            hookBullets: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            techSpecs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                },
                required: ['label', 'value'],
              },
            },
            faqs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                },
                required: ['question', 'answer'],
              },
            },
            rawMarkdown: { type: Type.STRING },
            seoMeta: {
              type: Type.OBJECT,
              properties: {
                metaTitle: { type: Type.STRING },
                metaDescription: { type: Type.STRING },
                keywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['metaTitle', 'metaDescription', 'keywords'],
            },
          },
          required: ['title', 'tagline', 'hookBullets', 'techSpecs', 'faqs', 'rawMarkdown', 'seoMeta'],
        },
      },
    });

    const text = response.text || '{}';
    const parsed: AiCopywritingResult = JSON.parse(text);

    // If rawMarkdown was sparse, construct a pristine Markdown block
    if (!parsed.rawMarkdown || parsed.rawMarkdown.length < 50) {
      parsed.rawMarkdown = `# ${parsed.title}

> *${(parsed as any).tagline || 'Engineered for high-end AI animation workflows.'}*

---

### 🔥 Key Benefits for AI Animators
${parsed.hookBullets.map((b) => `* ${b}`).join('\n')}

---

### ⚙️ Technical Specifications & Checklist
${parsed.techSpecs.map((s) => `- [x] **${s.label}:** ${s.value}`).join('\n')}

---

### ❓ Frequently Asked Questions & License Terms
${parsed.faqs.map((f, i) => `#### Q${i + 1}: ${f.question}\n**A:** ${f.answer}`).join('\n\n')}`;
    }

    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Gemini AI Assist Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate AI sales copy.',
    });
  }
});

// ==========================================
// 3. PAYMENT WEBHOOK (MIDTRANS / MAYAR / STRIPE)
// ==========================================

app.post('/api/webhook/payment', (req: Request, res: Response) => {
  try {
    const payload = req.body;
    const clientIp = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';

    let gateway: 'stripe' | 'midtrans' | 'mayar' = 'stripe';
    let orderId = '';
    let productId = '';
    let amountCents = 0;
    let currency = 'USD';
    let customerEmail = '';
    let customerName = 'Digital Creator';
    let isPaymentSuccessful = false;
    let gatewayTxId = '';

    // Detect Gateway format
    if (payload.event_type || payload.type?.startsWith('payment_intent') || payload.type?.startsWith('checkout')) {
      // Stripe Format
      gateway = 'stripe';
      const eventType = payload.type || payload.event_type;
      gatewayTxId = payload.data?.object?.id || 'ch_' + crypto.randomBytes(8).toString('hex');
      customerEmail = payload.data?.object?.customer_details?.email || payload.data?.object?.receipt_email || 'creator@example.com';
      customerName = payload.data?.object?.customer_details?.name || 'Verified AI Artist';
      amountCents = payload.data?.object?.amount || 2900;
      currency = (payload.data?.object?.currency || 'usd').toUpperCase();
      productId = payload.data?.object?.metadata?.productId || payload.productId || INITIAL_PRODUCTS[0].id;
      orderId = payload.data?.object?.metadata?.orderId || 'ord_str_' + crypto.randomBytes(6).toString('hex');

      isPaymentSuccessful = ['checkout.session.completed', 'payment_intent.succeeded', 'charge.succeeded'].includes(eventType) || payload.status === 'succeeded' || payload.paid === true;
    } else if (payload.transaction_status || payload.order_id) {
      // Midtrans Format
      gateway = 'midtrans';
      gatewayTxId = payload.transaction_id || 'mid_' + crypto.randomBytes(8).toString('hex');
      orderId = payload.order_id || 'ord_mid_' + crypto.randomBytes(6).toString('hex');
      productId = payload.custom_field1 || payload.productId || INITIAL_PRODUCTS[0].id;
      amountCents = Math.round((Number(payload.gross_amount) || 450000) / 100);
      currency = 'IDR';
      customerEmail = payload.customer_details?.email || payload.customerEmail || 'buyer@midtrans.id';
      customerName = payload.customer_details?.first_name || 'Midtrans Customer';

      isPaymentSuccessful = ['capture', 'settlement'].includes(payload.transaction_status) && payload.fraud_status !== 'deny';
    } else if (payload.event === 'payment.received' || payload.payment_id || payload.customer_name) {
      // Mayar Format
      gateway = 'mayar';
      gatewayTxId = payload.payment_id || 'may_' + crypto.randomBytes(8).toString('hex');
      orderId = payload.order_id || 'ord_may_' + crypto.randomBytes(6).toString('hex');
      productId = payload.metadata?.productId || payload.productId || INITIAL_PRODUCTS[0].id;
      amountCents = payload.amount || 350000;
      currency = payload.currency || 'IDR';
      customerEmail = payload.customer_email || 'creator@mayar.id';
      customerName = payload.customer_name || 'Mayar Verified Member';

      isPaymentSuccessful = payload.event === 'payment.received' || payload.status === 'SUCCESS' || payload.status === 'PAID';
    } else {
      // Generic payload format
      gateway = payload.gateway || 'stripe';
      orderId = payload.orderId || 'ord_' + crypto.randomBytes(6).toString('hex');
      productId = payload.productId || INITIAL_PRODUCTS[0].id;
      customerEmail = payload.customerEmail || 'creator@ai-animation.studio';
      customerName = payload.customerName || 'AI Filmmaker';
      amountCents = payload.amountCents || 2900;
      currency = payload.currency || 'USD';
      gatewayTxId = payload.transactionId || 'tx_' + crypto.randomBytes(8).toString('hex');
      isPaymentSuccessful = payload.status === 'paid' || payload.status === 'succeeded' || payload.status === 'settlement';
    }

    if (!isPaymentSuccessful) {
      db.logWebhook({
        gateway,
        payload,
        status: 'IGNORED_OR_PENDING',
      });
      res.json({
        success: true,
        message: 'Webhook received but payment status is not finalized.',
        gateway,
      });
      return;
    }

    // 1. Create or update the order in Cloudflare D1
    const product = db.getProductById(productId) || INITIAL_PRODUCTS[0];
    const order: Order = {
      id: orderId,
      productId: product.id,
      productTitle: product.title,
      customerEmail,
      customerName,
      amountCents,
      currency,
      paymentGateway: gateway,
      gatewayTransactionId: gatewayTxId,
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
    };
    db.createOrder(order);

    // 2. Security: Mint Ephemeral Cloudflare R2 Signed URL Valid for exactly 10 Minutes
    const tokenData = db.createDownloadToken(order.id, product.id, clientIp);

    // 3. Log webhook audit entry
    db.logWebhook({
      gateway,
      payload,
      status: 'PROCESSED_SUCCESS',
      createdToken: tokenData.token,
    });

    // 4. Return signed token response
    res.json({
      success: true,
      message: 'Payment verified successfully. Signed Cloudflare R2 download vault token created.',
      order: {
        id: order.id,
        status: order.paymentStatus,
        customerEmail: order.customerEmail,
        productTitle: order.productTitle,
      },
      download: {
        token: tokenData.token,
        signedUrl: tokenData.r2SignedUrl,
        expiresAt: tokenData.expiresAt,
        ttlMinutes: 10,
        vaultStatus: 'UNLOCKED',
      },
    });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Direct test checkout session endpoint for buyers
app.post('/api/checkout/create-session', (req: Request, res: Response) => {
  try {
    const { productId, customerEmail, customerName, gateway = 'stripe' } = req.body;
    const product = db.getProductById(productId);

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    const orderId = 'ord_' + crypto.randomBytes(8).toString('hex');
    const order: Order = {
      id: orderId,
      productId: product.id,
      productTitle: product.title,
      customerEmail: customerEmail || 'customer@studio.ai',
      customerName: customerName || 'AI Artist',
      amountCents: product.priceCents,
      currency: product.currency,
      paymentGateway: gateway,
      gatewayTransactionId: 'sim_' + crypto.randomBytes(8).toString('hex'),
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString(),
    };

    db.createOrder(order);
    const tokenData = db.createDownloadToken(order.id, product.id, req.ip);

    res.json({
      success: true,
      order,
      downloadToken: tokenData,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 4. DOWNLOAD VAULT & SIGNED R2 VERIFICATION
// ==========================================

app.get('/api/download-verify/:token', (req: Request, res: Response) => {
  const token = req.params.token;
  const tokenData = db.getDownloadToken(token);

  if (!tokenData) {
    res.status(404).json({
      valid: false,
      error: 'Signed download token not found or revoked.',
    });
    return;
  }

  const now = Date.now();
  const isExpired = now > tokenData.expiresAt;
  const remainingSeconds = Math.max(0, Math.round((tokenData.expiresAt - now) / 1000));

  res.json({
    valid: !isExpired,
    token: tokenData.token,
    orderId: tokenData.orderId,
    productId: tokenData.productId,
    productTitle: tokenData.productTitle,
    fileKey: tokenData.fileKey,
    fileSizeMb: tokenData.fileSizeMb,
    r2SignedUrl: tokenData.r2SignedUrl,
    expiresAt: tokenData.expiresAt,
    remainingSeconds,
    isExpired,
    downloadCount: tokenData.downloadCount,
    maxDownloads: tokenData.maxDownloads,
  });
});

app.get('/api/download/:token', (req: Request, res: Response) => {
  const token = req.params.token;
  const result = db.recordDownloadUsage(token);

  if (!result.success || !result.tokenData) {
    res.status(403).json({
      error: 'Access Denied',
      reason: result.message,
      securityPolicy: 'Cloudflare R2 Signed URLs expire strictly after 10 minutes to prevent unauthorized asset sharing.',
    });
    return;
  }

  const filename = result.tokenData.fileKey.split('/').pop() || 'asset_pack.zip';

  // Return a sample ZIP/Binary stream simulation for instant verification
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('X-Cloudflare-R2-Signed', 'verified-ok');
  res.setHeader('X-Asset-Vault-TTL-Remaining', `${Math.max(0, Math.round((result.tokenData.expiresAt - Date.now()) / 1000))}s`);

  // Generate a mock archive payload containing license certificate and workflow JSON
  const dummyZipContent = Buffer.from(
    `[DIGITAL ART & AI ANIMATION MASTER ASSET VAULT]
Product: ${result.tokenData.productTitle}
Order ID: ${result.tokenData.orderId}
Signed Token: ${result.tokenData.token}
Downloaded: ${new Date().toISOString()}
License: Full Perpetual Commercial Rights (AI Film / Client Commercials / Game Assets)
Cloudflare R2 ETag: "${crypto.randomBytes(16).toString('hex')}"

=== COMFYUI WORKFLOW NODE CONFIGURATION ===
{
  "nodes": [
    { "id": 1, "type": "ControlNetDepth", "inputs": { "strength": 0.85, "frame_pass": "${filename}" } },
    { "id": 2, "type": "AnimateDiffLoader", "inputs": { "motion_scale": 1.0, "fps": 60 } },
    { "id": 3, "type": "ProResAlphaCompositor", "inputs": { "blend_mode": "unmultiplied_alpha" } }
  ]
}
`
  );

  res.send(dummyZipContent);
});

// ==========================================
// 5. DATABASE INSPECTION & STATS (ADMIN)
// ==========================================

app.get('/api/db/stats', (req: Request, res: Response) => {
  res.json({
    success: true,
    stats: db.getStats(),
    recentWebhookLogs: db.getWebhookLogs(),
  });
});

app.get('/api/orders', (req: Request, res: Response) => {
  res.json({ success: true, orders: db.getAllOrders() });
});

app.get('/api/download-tokens', (req: Request, res: Response) => {
  res.json({ success: true, tokens: db.getAllTokens() });
});

// Start Express Server with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Digital Art Store Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
