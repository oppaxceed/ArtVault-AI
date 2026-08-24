import React, { useState } from 'react';
import { Product } from '../types';
import { formatPrice, copyToClipboard } from '../utils/helpers';
import {
  X,
  CheckCircle2,
  Zap,
  HelpCircle,
  Copy,
  Check,
  ShieldCheck,
  Download,
  FileCode,
  Sparkles,
  Layers,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onBuy: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onBuy,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'markdown' | 'specs'>('overview');
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const handleCopyMarkdown = async () => {
    const success = await copyToClipboard(product.fullMarkdownCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div
        id="product-detail-modal"
        className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
              {product.category}
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              ID: {product.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Tabs */}
            <div className="flex bg-zinc-800 p-1 rounded-lg text-xs font-medium">
              <button
                id="btn-tab-overview"
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === 'overview'
                    ? 'bg-zinc-700 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Storefront Copy
              </button>
              <button
                id="btn-tab-specs"
                onClick={() => setActiveTab('specs')}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === 'specs'
                    ? 'bg-zinc-700 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Specs & Checklist
              </button>
              <button
                id="btn-tab-markdown"
                onClick={() => setActiveTab('markdown')}
                className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
                  activeTab === 'markdown'
                    ? 'bg-zinc-700 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                <span>Raw Markdown</span>
              </button>
            </div>

            <button
              id="btn-close-product-modal"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Product Hero Banner */}
              <div className="relative rounded-xl overflow-hidden aspect-[21/9] bg-zinc-950 border border-zinc-800">
                <img
                  src={product.bannerUrl || product.thumbnailUrl}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                    1. High-Converting Product Title
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1 leading-snug">
                    {product.title}
                  </h1>
                </div>
              </div>

              {/* Tagline */}
              {product.tagline && (
                <p className="text-sm sm:text-base text-zinc-300 italic border-l-2 border-amber-500 pl-4 py-1">
                  {product.tagline}
                </p>
              )}

              {/* SECTION 2: 3 Persuasive Hook Bullet Points for AI Animators */}
              <div className="space-y-3 bg-zinc-950/60 p-5 rounded-xl border border-zinc-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>2. AI Animator Benefit Hooks (3 Key Advantages)</span>
                  </h3>
                  <span className="text-xs text-amber-400 font-mono">
                    High Conversion Formula
                  </span>
                </div>

                <div className="grid gap-3 pt-2">
                  {product.hookBullets.map((hook, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 hover:border-emerald-500/40 transition flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400 text-xs font-bold font-mono">
                        0{idx + 1}
                      </div>
                      <div className="text-sm text-zinc-200 leading-relaxed font-sans">
                        <span
                          dangerouslySetInnerHTML={{
                            __html: hook.replace(
                              /\*\*(.*?)\*\*/g,
                              '<strong class="text-emerald-300 font-semibold">$1</strong>'
                            ),
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3: Technical Specifications Preview */}
              <div className="space-y-3 bg-zinc-950/60 p-5 rounded-xl border border-zinc-800">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>3. Technical Specifications & AI Compatibility Checklist</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {product.techSpecs.map((spec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-3 rounded-lg bg-zinc-900/80 border border-zinc-800/80"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-medium text-zinc-400 block">
                          {spec.label}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-zinc-100 font-mono">
                          {spec.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: FAQ & Commercial Licensing Accordion */}
              <div className="space-y-3 bg-zinc-950/60 p-5 rounded-xl border border-zinc-800">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <span>4. FAQ & Commercial Licensing Terms</span>
                </h3>

                <div className="space-y-3 pt-2">
                  {product.faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800/80 space-y-1.5"
                    >
                      <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                        <span className="text-purple-400 font-mono text-xs">Q{idx + 1}:</span>
                        <span>{faq.question}</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pl-6">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-6">
              <div className="p-5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Technical Verification Matrix</span>
                </h3>

                <div className="space-y-2">
                  {product.techSpecs.map((spec, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800"
                    >
                      <span className="text-sm font-medium text-zinc-300">
                        {spec.label}
                      </span>
                      <span className="text-sm font-mono font-semibold text-emerald-400">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Supported AI Tool Ecosystem
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.compatibility.map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 text-amber-300 border border-zinc-700"
                    >
                      ✓ {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'markdown' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400 font-mono">
                  Clean Markdown export format ready for Gumroad, Shopify, Discord, or GitHub.
                </p>
                <button
                  id="btn-copy-full-markdown"
                  onClick={handleCopyMarkdown}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Copy Markdown</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-5 rounded-xl bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800 whitespace-pre-wrap selection:bg-amber-500/30">
                {product.fullMarkdownCopy}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Checkout Bar */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {formatPrice(product.priceCents, product.currency)}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                Commercial License Included
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Instant Cloudflare R2 signed download (10-min vault window)</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-modal-checkout"
              onClick={() => {
                onClose();
                onBuy(product);
              }}
              className="px-6 py-3 font-bold text-sm text-zinc-950 bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-xl shadow-lg shadow-orange-500/20 transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Instant Checkout · {formatPrice(product.priceCents, product.currency)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
