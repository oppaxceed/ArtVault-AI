import React, { useState } from 'react';
import { Product } from '../types';
import { formatTimeRemaining } from '../utils/helpers';
import confetti from 'canvas-confetti';
import {
  Terminal,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Download,
  ExternalLink,
  Code2,
  Lock,
  Layers,
  Sparkles,
  Loader2,
  Zap,
} from 'lucide-react';

interface WebhookTesterProps {
  products: Product[];
  onOrderCreated?: () => void;
}

export const WebhookTester: React.FC<WebhookTesterProps> = ({
  products,
  onOrderCreated,
}) => {
  const [gateway, setGateway] = useState<'stripe' | 'midtrans' | 'mayar'>('stripe');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || 'prod_cyber_neon_depth');
  const [customerEmail, setCustomerEmail] = useState('creator@ai-animation.studio');
  const [customerName, setCustomerName] = useState('Alex Rivera (Lead AI VFX)');
  const [loading, setLoading] = useState(false);
  const [webhookResult, setWebhookResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Active Download Token State for Countdown
  const [activeDownload, setActiveDownload] = useState<{
    token: string;
    expiresAt: number;
    signedUrl: string;
    productTitle: string;
  } | null>(null);

  const [msRemaining, setMsRemaining] = useState<number>(0);

  // Countdown timer loop
  React.useEffect(() => {
    if (!activeDownload) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, activeDownload.expiresAt - Date.now());
      setMsRemaining(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeDownload]);

  const generateSamplePayload = () => {
    const prod = products.find((p) => p.id === selectedProductId) || products[0];

    if (gateway === 'stripe') {
      return {
        id: 'evt_' + Math.random().toString(36).substring(2, 12),
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_' + Math.random().toString(36).substring(2, 12),
            amount: prod.priceCents,
            currency: 'usd',
            customer_details: {
              email: customerEmail,
              name: customerName,
            },
            metadata: {
              productId: prod.id,
              orderId: 'ord_str_' + Math.random().toString(36).substring(2, 8),
            },
          },
        },
      };
    }

    if (gateway === 'midtrans') {
      return {
        transaction_status: 'settlement',
        transaction_id: 'mid_' + Math.random().toString(36).substring(2, 12),
        order_id: 'ord_mid_' + Math.random().toString(36).substring(2, 8),
        gross_amount: (prod.priceCents * 155).toString(), // IDR representation
        currency: 'IDR',
        custom_field1: prod.id,
        payment_type: 'qris',
        customer_details: {
          email: customerEmail,
          first_name: customerName,
        },
      };
    }

    // Mayar
    return {
      event: 'payment.received',
      payment_id: 'may_' + Math.random().toString(36).substring(2, 12),
      order_id: 'ord_may_' + Math.random().toString(36).substring(2, 8),
      amount: prod.priceCents * 155,
      currency: 'IDR',
      customer_email: customerEmail,
      customer_name: customerName,
      metadata: {
        productId: prod.id,
      },
    };
  };

  const handleSendWebhook = async () => {
    setLoading(true);
    setError(null);
    setWebhookResult(null);

    const payload = generateSamplePayload();

    try {
      const res = await fetch('/api/webhook/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature-Simulation': 'hmac-sha256-verified-ok',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Webhook verification failed.');
      }

      setWebhookResult(data);
      if (data.download?.token) {
        setActiveDownload({
          token: data.download.token,
          expiresAt: data.download.expiresAt,
          signedUrl: data.download.signedUrl,
          productTitle: data.order?.productTitle || 'Digital Asset',
        });
        setMsRemaining(Math.max(0, data.download.expiresAt - Date.now()));

        // Confetti trigger
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      }

      if (onOrderCreated) onOrderCreated();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error executing webhook.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Payment Webhook & Cloudflare R2 Vault Simulator
            </h1>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Simulate Stripe / Midtrans / Mayar webhooks & verify 10-Minute Ephemeral R2 Signed URLs
          </p>
        </div>
      </div>

      {/* Grid: Simulator Inputs & Live Response */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Simulator Config (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Webhook Payload Configuration</span>
            </h2>

            {/* Gateway Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Select Payment Gateway Provider
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['stripe', 'midtrans', 'mayar'] as const).map((gw) => (
                  <button
                    key={gw}
                    type="button"
                    onClick={() => setGateway(gw)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold uppercase transition border ${
                      gateway === gw
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {gw}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Product */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Target Digital Asset
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title.slice(0, 45)}... (${p.priceCents / 100})
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Details */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Customer Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-300">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-white"
                />
              </div>
            </div>

            {/* Preview Payload */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400 uppercase">
                Raw JSON Request Body to /api/webhook/payment
              </label>
              <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto max-h-44">
                {JSON.stringify(generateSamplePayload(), null, 2)}
              </pre>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* Submit Webhook Button */}
            <button
              id="btn-send-webhook"
              onClick={handleSendWebhook}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs text-zinc-950 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Processing Payment Webhook & Minting R2 Signed URL...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Dispatch Webhook to /api/webhook/payment</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Vault & Response Monitor (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active 10-Minute Vault Countdown Box */}
          {activeDownload && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/40 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                    Cloudflare R2 Ephemeral Vault Unlocked
                  </span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Strict 10-Min Expiry
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black text-white">
                  {activeDownload.productTitle}
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Signed Token: {activeDownload.token}
                </p>
              </div>

              {/* Huge Countdown Clock */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-7 h-7 text-emerald-400" />
                  <div>
                    <span className="text-[11px] text-zinc-400 font-mono block">
                      VAULT EXPIRATION COUNTDOWN
                    </span>
                    <span className={`text-2xl font-black font-mono tracking-tight ${msRemaining < 60000 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                      {formatTimeRemaining(msRemaining)}
                    </span>
                  </div>
                </div>

                <a
                  href={`/api/download/${activeDownload.token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 font-bold text-xs text-zinc-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Master File (.zip)</span>
                </a>
              </div>

              <div className="text-[11px] text-zinc-400 space-y-1">
                <p>
                  🔒 <strong className="text-zinc-200">Security Architecture:</strong> The backend verifies webhook HMAC, inserts order into D1, and signs an S3-compatible R2 authorization query valid for exactly 600 seconds.
                </p>
              </div>
            </div>
          )}

          {/* Response Payload */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Webhook Processing Logs</span>
            </h3>

            {!webhookResult && !loading && (
              <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                Click "Dispatch Webhook" on the left to trigger the full Stripe/Midtrans/Mayar processing pipeline.
              </div>
            )}

            {webhookResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>HTTP 200 OK — Payment Confirmed & Token Generated</span>
                </div>
                <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-200 overflow-x-auto leading-relaxed max-h-72">
                  {JSON.stringify(webhookResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
