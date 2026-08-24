import React, { useState, useEffect } from 'react';
import { Product } from './types';
import { Navbar, NavTab } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AiCopywritingStudio } from './components/AiCopywritingStudio';
import { AdminPanel } from './components/AdminPanel';
import { WebhookTester } from './components/WebhookTester';
import { AstroCodeViewer } from './components/AstroCodeViewer';
import { CheckoutAndVaultModal } from './components/CheckoutAndVaultModal';
import {
  Sparkles,
  Search,
  Filter,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
  Download,
  Terminal,
  Database,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('store');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);

  // Storefront Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedToolFilter, setSelectedToolFilter] = useState<string>('All');

  // Active Tokens for Navbar indicator
  const [activeTokenCount, setActiveTokenCount] = useState<number>(0);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (e) {
      console.error('Error loading products', e);
    }
  };

  const fetchActiveTokens = async () => {
    try {
      const res = await fetch('/api/db/stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setActiveTokenCount(data.stats.activeTokensCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchActiveTokens();
    const interval = setInterval(fetchActiveTokens, 8000);
    return () => clearInterval(interval);
  }, []);

  const categories = ['All', 'Motion Assets', 'LoRA Models', 'Alpha VFX Passes', 'Prompt & ComfyUI Workflows'];
  const toolFilters = ['All', 'Runway Gen-3', 'ComfyUI', 'Kling 1.5', 'OpenAI Sora', 'AnimateDiff'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.roughBullets?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesTool =
      selectedToolFilter === 'All' ||
      p.compatibility?.some((c) => c.toLowerCase().includes(selectedToolFilter.toLowerCase()));

    return matchesSearch && matchesCategory && matchesTool;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-500/30 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activeTokenCount={activeTokenCount}
        onOpenVaultModal={() => setCurrentTab('webhooks')}
      />

      {/* Main View Switcher */}
      <main className="flex-1">
        {/* VIEW 1: STOREFRONT */}
        {currentTab === 'store' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
            {/* Store Hero Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-8 sm:p-12 shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/10 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>Cloudflare D1 & R2 Powered Master Vault</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  High-Precision Motion & LoRA Assets for <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">AI Animators</span>
                </h1>

                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
                  Studio-grade 4K depth maps, ProRes 4444 unmultiplied alpha passes, 360° turnarounds, and camera vector blueprints for Runway Gen-3, Kling, Sora, and ComfyUI. Instant 10-minute encrypted Cloudflare R2 download tokens.
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    id="btn-hero-ai-copywriter"
                    onClick={() => setCurrentTab('ai-studio')}
                    className="px-5 py-3 font-bold text-xs sm:text-sm text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-xl shadow-lg shadow-orange-500/20 transition flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-zinc-950" />
                    <span>Open AI Copywriter Studio</span>
                  </button>

                  <button
                    id="btn-hero-admin-panel"
                    onClick={() => setCurrentTab('admin')}
                    className="px-5 py-3 font-semibold text-xs sm:text-sm text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Admin /admin Catalog</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                {/* Search Input */}
                <div className="relative w-full sm:w-96">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-store-search"
                    type="text"
                    placeholder="Search depth passes, LoRA models, VFX..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>

                {/* AI Tool Quick Filter */}
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
                  <span className="text-xs text-zinc-500 font-mono shrink-0">Tool:</span>
                  {toolFilters.map((tool) => (
                    <button
                      key={tool}
                      onClick={() => setSelectedToolFilter(tool)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                        selectedToolFilter === tool
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {tool}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 border-b border-zinc-800/80">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      selectedCategory === cat
                        ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div>
              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl space-y-3">
                  <p className="text-zinc-400 text-sm">No digital assets match your filter criteria.</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setSelectedToolFilter('All');
                    }}
                    className="text-xs text-amber-400 underline"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onSelect={(p) => setSelectedProduct(p)}
                      onQuickBuy={(p) => setCheckoutProduct(p)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: AI COPYWRITING & SEO SPECIALIST STUDIO */}
        {currentTab === 'ai-studio' && (
          <AiCopywritingStudio
            onPublishToCatalog={() => {
              fetchProducts();
              fetchActiveTokens();
              setCurrentTab('store');
            }}
          />
        )}

        {/* VIEW 3: ADMIN PANEL */}
        {currentTab === 'admin' && (
          <AdminPanel
            products={products}
            onRefreshProducts={fetchProducts}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        )}

        {/* VIEW 4: WEBHOOK & R2 VAULT TESTER */}
        {currentTab === 'webhooks' && (
          <WebhookTester
            products={products}
            onOrderCreated={() => {
              fetchProducts();
              fetchActiveTokens();
            }}
          />
        )}

        {/* VIEW 5: ASTRO SSR + CLOUDFLARE CODE VIEWER */}
        {currentTab === 'astro-scaffold' && <AstroCodeViewer />}
      </main>

      {/* MODALS */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onBuy={(p) => {
            setSelectedProduct(null);
            setCheckoutProduct(p);
          }}
        />
      )}

      {checkoutProduct && (
        <CheckoutAndVaultModal
          product={checkoutProduct}
          onClose={() => setCheckoutProduct(null)}
          onOrderCompleted={() => {
            fetchActiveTokens();
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-zinc-950 border-t border-zinc-800/80 py-8 text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ArtVault AI · Cloudflare Workers + D1 SQLite + R2 10-Min Ephemeral Links</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Stripe / Midtrans / Mayar Ready</span>
            <span>Gemini 2.5 Flash Copy Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
