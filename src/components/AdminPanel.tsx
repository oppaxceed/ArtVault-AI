import React, { useState, useEffect } from 'react';
import { Product, Order, DownloadToken, DatabaseStats } from '../types';
import { formatPrice, formatTimeRemaining } from '../utils/helpers';
import {
  ShieldCheck,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Database,
  Terminal,
  Clock,
  CheckCircle2,
  DollarSign,
  Package,
  Layers,
  ArrowUpRight,
  Loader2,
  X,
  RefreshCw,
  ExternalLink,
  Zap,
} from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  onRefreshProducts: () => void;
  onSelectProduct: (p: Product) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  products,
  onRefreshProducts,
  onSelectProduct,
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'catalog' | 'd1-db' | 'webhooks'>('catalog');
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tokens, setTokens] = useState<DownloadToken[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [aiAssistLoading, setAiAssistLoading] = useState(false);
  const [aiAssistRoughInput, setAiAssistRoughInput] = useState('');
  const [aiAssistProductName, setAiAssistProductName] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    category: 'Motion Assets',
    priceCents: 2900,
    currency: 'USD' as 'USD' | 'IDR',
    roughBullets: '',
    hookBullets: ['', '', ''],
    techSpecs: [
      { label: 'Resolution', value: '3840 x 2160 (4K UHD) @ 60 FPS' },
      { label: 'Format', value: 'ProRes 4444 + 16-bit PNG' },
      { label: 'AI Compatibility', value: 'Runway Gen-3, Kling 1.5, ComfyUI' },
    ],
    faqs: [
      { question: 'Is commercial use allowed?', answer: 'Yes, full commercial rights included.' },
    ],
    fileKey: 'r2://vault-art/custom_master_pack.zip',
    fileSizeMb: 950,
    compatibility: ['Runway Gen-3', 'ComfyUI', 'Kling 1.5'],
  });

  const fetchAdminData = async () => {
    try {
      const [statsRes, ordersRes, tokensRes] = await Promise.all([
        fetch('/api/db/stats'),
        fetch('/api/orders'),
        fetch('/api/download-tokens'),
      ]);

      const statsData = await statsRes.json();
      const ordersData = await ordersRes.json();
      const tokensData = await tokensRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
        setWebhookLogs(statsData.recentWebhookLogs || []);
      }
      if (ordersData.success) setOrders(ordersData.orders);
      if (tokensData.success) setTokens(tokensData.tokens);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const timer = setInterval(fetchAdminData, 6000);
    return () => clearInterval(timer);
  }, []);

  // AI Assist handler inside Admin
  const handleAiAssist = async () => {
    if (!aiAssistProductName || !aiAssistRoughInput) {
      alert('Please enter a product name and rough bullet points first.');
      return;
    }

    setAiAssistLoading(true);
    try {
      const res = await fetch('/api/admin/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: aiAssistProductName,
          roughBullets: aiAssistRoughInput,
          category: formData.category,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const copy = data.data;
        setFormData((prev) => ({
          ...prev,
          title: copy.title,
          tagline: copy.tagline || prev.tagline,
          hookBullets: copy.hookBullets || prev.hookBullets,
          techSpecs: copy.techSpecs || prev.techSpecs,
          faqs: copy.faqs || prev.faqs,
          roughBullets: aiAssistRoughInput,
        }));
      }
    } catch (err) {
      console.error(err);
      alert('AI Assist failed. Check API key configuration.');
    } finally {
      setAiAssistLoading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'active',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        onRefreshProducts();
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product from D1?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      onRefreshProducts();
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Admin & Database Control Center
            </h1>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
              /admin
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Cloudflare D1 SQLite Engine · Cloudflare R2 Vault (10-Min Ephemeral Signatures) · Gemini Sales Copywriter
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-admin-refresh"
            onClick={() => {
              fetchAdminData();
              onRefreshProducts();
            }}
            className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition"
            title="Refresh D1 Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            id="btn-admin-add-product"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 font-bold text-xs text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-xl shadow transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product with AI Assist</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400 font-mono uppercase">
            Total D1 Products
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-mono">
              {stats?.productsCount ?? products.length}
            </span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400 font-mono uppercase">
            Processed Orders
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-mono">
              {stats?.ordersCount ?? orders.length}
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400 font-mono uppercase">
            Total Revenue
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {formatPrice(stats?.totalRevenueCents ?? 0, 'USD')}
            </span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400 font-mono uppercase">
            Active 10-Min Tokens
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-cyan-400 font-mono">
              {stats?.activeTokensCount ?? 0}
            </span>
            <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Admin Tab Switcher */}
      <div className="flex border-b border-zinc-800 space-x-4 text-sm font-medium">
        <button
          id="btn-admin-tab-catalog"
          onClick={() => setActiveAdminTab('catalog')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeAdminTab === 'catalog'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Catalog ({products.length})</span>
        </button>

        <button
          id="btn-admin-tab-d1"
          onClick={() => setActiveAdminTab('d1-db')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeAdminTab === 'd1-db'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Cloudflare D1 Tables (products, orders, tokens)</span>
        </button>
      </div>

      {/* TAB 1: Product Catalog Table */}
      {activeAdminTab === 'catalog' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-zinc-950/60 border-b border-zinc-800 flex justify-between items-center">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Active Digital Products in Cloudflare D1
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              {products.length} Items Available
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono border-b border-zinc-800">
                <tr>
                  <th className="p-4">Product / Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">R2 Vault Key</th>
                  <th className="p-4">AI Hooks</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-800/40 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.thumbnailUrl}
                          alt={p.title}
                          className="w-10 h-10 rounded-lg object-cover bg-zinc-950 border border-zinc-800 shrink-0"
                        />
                        <div className="max-w-xs">
                          <span
                            onClick={() => onSelectProduct(p)}
                            className="font-bold text-zinc-100 hover:text-amber-400 transition cursor-pointer line-clamp-1 block"
                          >
                            {p.title}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {p.id} · {p.fileSizeMb} MB
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-zinc-300">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {formatPrice(p.priceCents, p.currency)}
                    </td>
                    <td className="p-4 font-mono text-zinc-400 text-[11px] truncate max-w-[180px]">
                      {p.fileKey}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                        {p.hookBullets?.length || 3} Benefits
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => onSelectProduct(p)}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition"
                      >
                        Preview Copy
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Cloudflare D1 Tables Inspector */}
      {activeAdminTab === 'd1-db' && (
        <div className="space-y-6">
          {/* Orders Table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center">
              <span className="text-xs font-mono uppercase text-emerald-400 flex items-center gap-2">
                <Database className="w-3.5 h-3.5" />
                <span>D1 Table: orders ({orders.length} Rows)</span>
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                Real-time Webhook & Checkout Orders
              </span>
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 text-zinc-400 font-mono text-[11px] border-b border-zinc-800">
                  <tr>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Product Title</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Gateway</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 font-mono text-[11px]">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-zinc-500">
                        No orders recorded yet. Trigger a test checkout or webhook simulator!
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-zinc-800/40">
                        <td className="p-3 font-semibold text-white">{o.id}</td>
                        <td className="p-3 text-zinc-300">{o.customerEmail}</td>
                        <td className="p-3 text-zinc-200 line-clamp-1">{o.productTitle}</td>
                        <td className="p-3 font-bold text-emerald-400">
                          {formatPrice(o.amountCents, o.currency as any)}
                        </td>
                        <td className="p-3">
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 uppercase text-[10px] text-zinc-300">
                            {o.paymentGateway}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-bold">
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-400">
                          {new Date(o.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Download Tokens Table (10-min R2 Ephemeral Vault) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center">
              <span className="text-xs font-mono uppercase text-cyan-400 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>D1 Table: download_tokens (Cloudflare R2 10-Min Ephemeral Links)</span>
              </span>
              <span className="text-[11px] text-zinc-400 font-mono">
                Strict 10-Minute Vault TTL
              </span>
            </div>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 text-zinc-400 font-mono text-[11px] border-b border-zinc-800">
                  <tr>
                    <th className="p-3">Token</th>
                    <th className="p-3">Order ID</th>
                    <th className="p-3">R2 File Key</th>
                    <th className="p-3">Expires In</th>
                    <th className="p-3">Usage</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 font-mono text-[11px]">
                  {tokens.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-zinc-500">
                        No signed tokens generated yet.
                      </td>
                    </tr>
                  ) : (
                    tokens.map((t) => {
                      const now = Date.now();
                      const isExpired = now > t.expiresAt;
                      const remainingMs = Math.max(0, t.expiresAt - now);
                      return (
                        <tr key={t.token} className="hover:bg-zinc-800/40">
                          <td className="p-3 text-cyan-300 font-semibold truncate max-w-[150px]">
                            {t.token}
                          </td>
                          <td className="p-3 text-zinc-400">{t.orderId}</td>
                          <td className="p-3 text-zinc-300 truncate max-w-[180px]">
                            {t.fileKey}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                                isExpired
                                  ? 'bg-rose-950 text-rose-400'
                                  : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {formatTimeRemaining(remainingMs)}
                            </span>
                          </td>
                          <td className="p-3 text-zinc-300">
                            {t.downloadCount} / {t.maxDownloads} DLs
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                                isExpired
                                  ? 'bg-zinc-800 text-zinc-500'
                                  : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                              }`}
                            >
                              {isExpired ? 'EXPIRED' : 'ACTIVE_VAULT'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL WITH "AI ASSIST" */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Add Digital Asset with Gemini AI Assist
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    Cloudflare D1 Catalog Entry · Auto-Generate 4-Part Sales Copy
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Top AI Assist Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>AI Assist Copywriter (Gemini 2.5 Flash)</span>
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Auto-writes Title, Hooks & FAQ
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Short Product Name..."
                      value={aiAssistProductName}
                      onChange={(e) => setAiAssistProductName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Rough feature notes / bullet points..."
                      value={aiAssistRoughInput}
                      onChange={(e) => setAiAssistRoughInput(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-trigger-ai-assist"
                  onClick={handleAiAssist}
                  disabled={aiAssistLoading}
                  className="w-full py-2.5 px-4 rounded-lg font-bold text-xs text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 transition flex items-center justify-center gap-2 shadow"
                >
                  {aiAssistLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating Sales Copy...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Click to Auto-Write Sales Copy with "AI Assist"</span>
                    </>
                  )}
                </button>
              </div>

              {/* Product Form Fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. NeonVeil 4K: Cinematic Cyberpunk Rain & Depth Motion Assets"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="Short benefit-driven subtitle..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white"
                    >
                      <option value="Motion Assets">Motion Assets</option>
                      <option value="LoRA Models">LoRA Models</option>
                      <option value="Alpha VFX Passes">Alpha VFX Passes</option>
                      <option value="Prompt & ComfyUI Workflows">Prompt & ComfyUI Workflows</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">Price (USD)</label>
                    <input
                      type="number"
                      value={formData.priceCents / 100}
                      onChange={(e) => setFormData({ ...formData, priceCents: Math.round(Number(e.target.value) * 100) })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">File Size (MB)</label>
                    <input
                      type="number"
                      value={formData.fileSizeMb}
                      onChange={(e) => setFormData({ ...formData, fileSizeMb: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-950 border border-zinc-800 text-white font-mono"
                    />
                  </div>
                </div>

                {/* 3 Hooks */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    3 Animator Benefit Hooks (Auto-Filled by AI Assist)
                  </label>
                  {formData.hookBullets.map((hook, i) => (
                    <input
                      key={i}
                      type="text"
                      value={hook}
                      onChange={(e) => {
                        const copy = [...formData.hookBullets];
                        copy[i] = e.target.value;
                        setFormData({ ...formData, hookBullets: copy });
                      }}
                      placeholder={`Hook Benefit #${i + 1}`}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-200"
                    />
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-submit-add-product"
                  className="px-6 py-2.5 font-bold text-xs text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl shadow hover:brightness-110 transition"
                >
                  Save Product to D1
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
