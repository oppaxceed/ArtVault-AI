export interface ScaffoldFile {
  filename: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const ASTRO_CLOUDFLARE_SCAFFOLD: ScaffoldFile[] = [
  {
    filename: 'wrangler.jsonc',
    path: 'wrangler.jsonc',
    language: 'json',
    description: 'Cloudflare Workers configuration with D1 database, R2 bucket, and environment bindings',
    content: `{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "digital-art-store",
  "main": "./dist/_worker.js/index.js",
  "compatibility_date": "2026-08-01",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "digital_art_db",
      "database_id": "YOUR_D1_DATABASE_UUID_HERE"
    }
  ],
  "r2_buckets": [
    {
      "binding": "VAULT_BUCKET",
      "bucket_name": "digital-art-vault",
      "preview_bucket_name": "digital-art-vault-preview"
    }
  ],
  "vars": {
    "STORE_NAME": "ArtVault AI",
    "STORE_URL": "https://artvault.studio"
  }
}`,
  },
  {
    filename: 'schema.sql',
    path: 'src/db/schema.sql',
    language: 'sql',
    description: 'Cloudflare D1 SQLite database migration schema for products, orders, and download tokens',
    content: `-- Cloudflare D1 Database Schema
-- Run: npx wrangler d1 execute digital_art_db --file=src/db/schema.sql

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tagline TEXT,
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  category TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  banner_url TEXT,
  file_key TEXT NOT NULL,
  file_size_mb INTEGER DEFAULT 500,
  rough_bullets TEXT,
  hook_bullets_json TEXT, -- JSON Array of 3 AI animator hook bullets
  tech_specs_json TEXT,   -- JSON Array of technical specs
  faqs_json TEXT,         -- JSON Array of FAQs
  full_markdown TEXT,     -- Complete AI-generated sales copy
  seo_meta_json TEXT,     -- JSON { metaTitle, metaDescription, keywords }
  compatibility_json TEXT,-- JSON Array of AI tools (Runway, Kling, Sora, ComfyUI)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active'
);

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id),
  product_title TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT DEFAULT 'AI Creator',
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_gateway TEXT NOT NULL, -- 'stripe' | 'midtrans' | 'mayar'
  gateway_tx_id TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending', -- 'pending' | 'paid' | 'failed'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME
);

-- 3. Download Tokens Table (Strict 10-minute Cloudflare R2 signed token)
CREATE TABLE IF NOT EXISTS download_tokens (
  token TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  product_id TEXT NOT NULL REFERENCES products(id),
  file_key TEXT NOT NULL,
  r2_signed_url TEXT NOT NULL,
  expires_at INTEGER NOT NULL, -- Unix epoch ms (10 min TTL)
  max_downloads INTEGER DEFAULT 5,
  download_count INTEGER DEFAULT 0,
  is_used INTEGER DEFAULT 0,
  client_ip TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_tokens_expires ON download_tokens(expires_at);`,
  },
  {
    filename: 'payment.ts',
    path: 'src/pages/api/webhook/payment.ts',
    language: 'typescript',
    description: 'Astro SSR Webhook route handling Stripe, Midtrans, and Mayar payment callbacks + R2 10-min signed URL generation',
    content: `import type { APIRoute } from 'astro';
import { AwsClient } from 'aws4fetch';

// Cloudflare Workers runtime environment with D1 and R2 bindings
interface Env {
  DB: D1Database;
  VAULT_BUCKET: R2Bucket;
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  MIDTRANS_SERVER_KEY: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime.env as Env;
  const payload = await request.json();

  let orderId = '';
  let productId = '';
  let customerEmail = '';
  let customerName = 'AI Creator';
  let amountCents = 0;
  let currency = 'USD';
  let gateway = 'stripe';
  let isSuccess = false;
  let gatewayTxId = '';

  // 1. Parse Gateway-Specific Webhooks (Stripe / Midtrans / Mayar)
  if (payload.type?.startsWith('payment_intent') || payload.type?.startsWith('checkout')) {
    // Stripe
    gateway = 'stripe';
    isSuccess = payload.type === 'checkout.session.completed' || payload.type === 'payment_intent.succeeded';
    gatewayTxId = payload.data?.object?.id || 'tx_' + crypto.randomUUID();
    customerEmail = payload.data?.object?.customer_details?.email || 'buyer@studio.ai';
    productId = payload.data?.object?.metadata?.productId;
    orderId = 'ord_' + crypto.randomUUID().slice(0, 8);
    amountCents = payload.data?.object?.amount || 2900;
  } else if (payload.transaction_status) {
    // Midtrans
    gateway = 'midtrans';
    isSuccess = ['capture', 'settlement'].includes(payload.transaction_status);
    gatewayTxId = payload.transaction_id;
    customerEmail = payload.customer_details?.email || 'buyer@midtrans.id';
    productId = payload.custom_field1;
    orderId = payload.order_id;
    amountCents = Math.round(Number(payload.gross_amount) / 100);
    currency = 'IDR';
  } else if (payload.event === 'payment.received') {
    // Mayar
    gateway = 'mayar';
    isSuccess = true;
    gatewayTxId = payload.payment_id;
    customerEmail = payload.customer_email;
    productId = payload.metadata?.productId;
    orderId = payload.order_id;
    amountCents = payload.amount;
    currency = 'IDR';
  }

  if (!isSuccess) {
    return new Response(JSON.stringify({ received: true, status: 'ignored' }), { status: 200 });
  }

  // 2. Fetch Product from Cloudflare D1
  const product = await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(productId).first<any>();
  if (!product) {
    return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
  }

  // 3. Save Order to D1
  await env.DB.prepare(\`
    INSERT INTO orders (id, product_id, product_title, customer_email, customer_name, amount_cents, currency, payment_gateway, gateway_tx_id, payment_status, paid_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', CURRENT_TIMESTAMP)
  \`).bind(orderId, product.id, product.title, customerEmail, customerName, amountCents, currency, gateway, gatewayTxId).run();

  // 4. Security: Generate Cloudflare R2 Signed URL Valid for exactly 10 Minutes (600s)
  const token = 'r2_sig_' + crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes TTL

  // Using aws4fetch to sign AWS S3 compatible presigned URL for Cloudflare R2
  const r2Client = new AwsClient({
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    service: 's3',
    region: 'auto',
  });

  const r2Url = new URL(\`https://\${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/digital-art-vault/\${product.file_key}\`);
  r2Url.searchParams.set('X-Amz-Expires', '600'); // 10 mins
  const signedRequest = await r2Client.sign(r2Url.toString(), { method: 'GET', aws: { signQuery: true } });

  // 5. Store Token in D1
  await env.DB.prepare(\`
    INSERT INTO download_tokens (token, order_id, product_id, file_key, r2_signed_url, expires_at, max_downloads, download_count, is_used)
    VALUES (?, ?, ?, ?, ?, ?, 5, 0, 0)
  \`).bind(token, orderId, product.id, product.file_key, signedRequest.url, expiresAt).run();

  return new Response(JSON.stringify({
    success: true,
    orderId,
    token,
    downloadUrl: \`/download/\${token}\`,
    expiresAt,
    ttlMinutes: 10
  }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
};`,
  },
  {
    filename: 'ai-assist.ts',
    path: 'src/pages/api/admin/ai-assist.ts',
    language: 'typescript',
    description: 'Astro SSR Gemini API copywriting endpoint using GoogleGenAI for high-converting titles, hook bullets, specs, and FAQ',
    content: `import type { APIRoute } from 'astro';
import { GoogleGenAI, Type } from '@google/genai';

interface Env {
  GEMINI_API_KEY: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime.env as Env;
  const { productName, roughBullets, category, targetTools } = await request.json();

  const ai = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });

  const systemInstruction = \`You are an elite E-Commerce Copywriting & SEO Specialist for Digital Art Products and AI Animation Assets.
Given a short product name and rough bullet points, generate:
1. High-converting, SEO-optimized product title.
2. Exactly 3 persuasive hook bullet points highlighting benefits for AI animators (flicker-free, 60fps, ControlNet depth, ProRes alpha).
3. Technical specifications checklist (Resolution, format, compatibility).
4. FAQ section addressing common license, commercial usage, and 10-minute download security vault questions.\`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: \`Product Name: \${productName}\\nCategory: \${category}\\nAI Tools: \${targetTools?.join(', ')}\\nRough Bullets: \${roughBullets}\`,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          tagline: { type: Type.STRING },
          hookBullets: { type: Type.ARRAY, items: { type: Type.STRING } },
          techSpecs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { label: { type: Type.STRING }, value: { type: Type.STRING } },
              required: ['label', 'value']
            }
          },
          faqs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } },
              required: ['question', 'answer']
            }
          },
          rawMarkdown: { type: Type.STRING },
          seoMeta: {
            type: Type.OBJECT,
            properties: {
              metaTitle: { type: Type.STRING },
              metaDescription: { type: Type.STRING },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['metaTitle', 'metaDescription', 'keywords']
          }
        },
        required: ['title', 'tagline', 'hookBullets', 'techSpecs', 'faqs', 'rawMarkdown', 'seoMeta']
      }
    }
  });

  return new Response(response.text, {
    headers: { 'Content-Type': 'application/json' },
    status: 200
  });
};`,
  },
  {
    filename: '[token].ts',
    path: 'src/pages/download/[token].ts',
    language: 'typescript',
    description: 'Astro SSR 10-minute signed token validator and secure file streaming from Cloudflare R2',
    content: `import type { APIRoute } from 'astro';

interface Env {
  DB: D1Database;
  VAULT_BUCKET: R2Bucket;
}

export const GET: APIRoute = async ({ params, locals, request }) => {
  const env = (locals as any).runtime.env as Env;
  const token = params.token;

  // 1. Fetch token record from Cloudflare D1
  const tokenData = await env.DB.prepare(\`
    SELECT * FROM download_tokens WHERE token = ?
  \`).bind(token).first<any>();

  if (!tokenData) {
    return new Response('Invalid or expired signed download token.', { status: 404 });
  }

  // 2. Strict 10-Minute Expiry Verification
  const now = Date.now();
  if (now > tokenData.expires_at) {
    const expiredSeconds = Math.round((now - tokenData.expires_at) / 1000);
    return new Response(\`Access Denied: This signed download token expired \${expiredSeconds}s ago. (Strict 10-Minute Security Window)\`, {
      status: 403,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  // 3. Max download limit verification
  if (tokenData.download_count >= tokenData.max_downloads) {
    return new Response('Max download limit exceeded for this purchase session.', { status: 403 });
  }

  // 4. Update usage in D1
  await env.DB.prepare(\`
    UPDATE download_tokens
    SET download_count = download_count + 1, is_used = 1
    WHERE token = ?
  \`).bind(token).run();

  // 5. Fetch direct object from Cloudflare R2 Vault Bucket
  const r2Object = await env.VAULT_BUCKET.get(tokenData.file_key);
  if (!r2Object) {
    // If testing without real R2 bucket provisioned, redirect to signed URL
    return Response.redirect(tokenData.r2_signed_url, 302);
  }

  const filename = tokenData.file_key.split('/').pop() || 'master_asset.zip';

  return new Response(r2Object.body, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': \`attachment; filename="\${filename}"\`,
      'Cache-Control': 'no-store, private',
      'X-Signed-Expires-In': \`\${Math.round((tokenData.expires_at - now) / 1000)}s\`
    }
  });
};`,
  },
  {
    filename: 'admin.astro',
    path: 'src/pages/admin/index.astro',
    language: 'astro',
    description: 'Minimalist Astro Admin route with AI Assist button calling Gemini API to auto-write sales copy and sync D1',
    content: `---
// Astro Server-Side Admin Component
import Layout from '../../layouts/Layout.astro';
---

<Layout title="Admin Panel - Digital Art Store">
  <main class="max-w-6xl mx-auto p-8 font-sans">
    <header class="flex justify-between items-center pb-6 border-b border-zinc-800 mb-8">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">Admin & AI Copywriter Studio</h1>
        <p class="text-sm text-zinc-400">Cloudflare D1 + R2 + Gemini Sales Copy Specialist</p>
      </div>
      <a href="/" class="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition">View Storefront</a>
    </header>

    <!-- Interactive AI Assist Form with Direct D1 Publishing -->
    <div id="admin-ai-app"></div>
  </main>
</Layout>`,
  },
];
