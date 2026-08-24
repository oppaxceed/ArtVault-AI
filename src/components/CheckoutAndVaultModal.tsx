import React, { useState, useEffect } from 'react';
import { Product, DownloadToken } from '../types';
import { formatPrice, formatTimeRemaining } from '../utils/helpers';
import confetti from 'canvas-confetti';
import {
  X,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Sparkles,
  Lock,
  ArrowRight,
  Loader2,
  Zap,
} from 'lucide-react';

interface CheckoutAndVaultModalProps {
  product: Product | null;
  onClose: () => void;
  onOrderCompleted?: () => void;
}

export const CheckoutAndVaultModal: React.FC<CheckoutAndVaultModalProps> = ({
  product,
  onClose,
  onOrderCompleted,
}) => {
  const [step, setStep] = useState<'checkout' | 'success'>('checkout');
  const [customerEmail, setCustomerEmail] = useState('creator@ai-animation.studio');
  const [customerName, setCustomerName] = useState('AI Director');
  const [selectedGateway, setSelectedGateway] = useState<'stripe' | 'midtrans' | 'mayar'>('stripe');
  const [loading, setLoading] = useState(false);
  const [downloadToken, setDownloadToken] = useState<DownloadToken | null>(null);
  const [msRemaining, setMsRemaining] = useState<number>(600000); // 10 mins

  // Countdown timer when on success screen
  useEffect(() => {
    if (!downloadToken || step !== 'success') return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, downloadToken.expiresAt - Date.now());
      setMsRemaining(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [downloadToken, step]);

  if (!product) return null;

  const handlePayNow = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerEmail,
          customerName,
          gateway: selectedGateway,
        }),
      });

      const data = await res.json();
      if (data.success && data.downloadToken) {
        setDownloadToken(data.downloadToken);
        setMsRemaining(Math.max(0, data.downloadToken.expiresAt - Date.now()));
        setStep('success');

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });

        if (onOrderCompleted) onOrderCompleted();
      }
    } catch (e) {
      console.error(e);
      alert('Checkout error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div
        id="checkout-vault-modal"
        className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {step === 'checkout' ? 'Instant Secure Checkout' : '10-Minute Vault Unlocked'}
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Cloudflare D1 & R2 Ephemeral Token Architecture
              </p>
            </div>
          </div>
          <button
            id="btn-close-checkout-modal"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {step === 'checkout' ? (
            <>
              {/* Product Summary */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                <img
                  src={product.thumbnailUrl}
                  alt={product.title}
                  className="w-14 h-14 rounded-lg object-cover border border-zinc-800 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">
                    {product.title}
                  </h4>
                  <p className="text-xs text-zinc-400 font-mono">
                    {product.fileSizeMb} MB · Master Archive · Lifetime Commercial License
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-white font-mono">
                    {formatPrice(product.priceCents, product.currency)}
                  </span>
                </div>
              </div>

              {/* Payment Gateway Options */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Select Payment Processor
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGateway('stripe')}
                    className={`p-3 rounded-xl border text-center transition ${
                      selectedGateway === 'stripe'
                        ? 'bg-orange-500/10 border-orange-500/60 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-bold block">Stripe</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Credit Cards / Apple Pay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGateway('midtrans')}
                    className={`p-3 rounded-xl border text-center transition ${
                      selectedGateway === 'midtrans'
                        ? 'bg-orange-500/10 border-orange-500/60 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-bold block">Midtrans</span>
                    <span className="text-[10px] text-zinc-500 font-mono">QRIS / GoPay / VA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedGateway('mayar')}
                    className={`p-3 rounded-xl border text-center transition ${
                      selectedGateway === 'mayar'
                        ? 'bg-orange-500/10 border-orange-500/60 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <span className="text-xs font-bold block">Mayar</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Instant Pay / ID</span>
                  </button>
                </div>
              </div>

              {/* Customer Inputs */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    License Delivery Email
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    Licensee / Artist Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 text-[11px] text-zinc-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  On confirmation, Cloudflare R2 mints a signed 10-minute master download URL to prevent link piracy.
                </span>
              </div>

              <button
                id="btn-complete-pay"
                onClick={handlePayNow}
                disabled={loading}
                className="w-full py-3.5 font-bold text-sm text-zinc-950 bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-xl shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>Minting R2 Signed Vault Link...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay {formatPrice(product.priceCents, product.currency)} & Unlock Vault</span>
                  </>
                )}
              </button>
            </>
          ) : (
            /* STEP: SUCCESS & 10-MINUTE COUNTDOWN VAULT */
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-white">
                  Payment Verified! Vault Unlocked
                </h3>
                <p className="text-xs text-zinc-400 mt-1 font-mono">
                  Order ID: {downloadToken?.orderId} · {customerEmail}
                </p>
              </div>

              {/* Countdown Clock */}
              <div className="p-5 rounded-2xl bg-zinc-950 border border-emerald-500/40 space-y-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Cloudflare R2 Temporary Signed URL TTL
                </span>
                <span className={`text-4xl font-black font-mono tracking-tight ${msRemaining < 60000 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                  {formatTimeRemaining(msRemaining)}
                </span>
                <p className="text-[11px] text-zinc-500 font-mono">
                  Link automatically self-destructs after 10 minutes to protect master assets.
                </p>
              </div>

              {/* Master Download CTA */}
              <div className="space-y-3">
                <a
                  id="btn-download-master-vault"
                  href={`/api/download/${downloadToken?.token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-4 px-6 font-black text-sm text-zinc-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 hover:brightness-110 rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Master Package (.zip)</span>
                </a>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 text-xs text-zinc-400 hover:text-zinc-200 transition"
                >
                  Return to Storefront
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
