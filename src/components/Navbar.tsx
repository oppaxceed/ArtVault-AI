import React from 'react';
import {
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Code2,
  Terminal,
  Clock,
  ExternalLink,
  Layers,
} from 'lucide-react';

export type NavTab = 'store' | 'ai-studio' | 'admin' | 'webhooks' | 'astro-scaffold';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  activeTokenCount: number;
  onOpenVaultModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  activeTokenCount,
  onOpenVaultModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            id="brand-logo"
            onClick={() => onTabChange('store')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors">
                  ArtVault AI
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  Cloudflare D1 & R2
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono hidden sm:block">
                Digital Art & AI Animation Assets Store
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              id="nav-tab-store"
              onClick={() => onTabChange('store')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'store'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-orange-400" />
              <span className="hidden md:inline">Storefront</span>
            </button>

            <button
              id="nav-tab-ai-studio"
              onClick={() => onTabChange('ai-studio')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'ai-studio'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-orange-300 border border-orange-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>AI Copywriter</span>
            </button>

            <button
              id="nav-tab-admin"
              onClick={() => onTabChange('admin')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'admin'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Admin /admin</span>
            </button>

            <button
              id="nav-tab-webhooks"
              onClick={() => onTabChange('webhooks')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'webhooks'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="hidden lg:inline">Webhooks & R2</span>
            </button>

            <button
              id="nav-tab-astro"
              onClick={() => onTabChange('astro-scaffold')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'astro-scaffold'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Code2 className="w-4 h-4 text-purple-400" />
              <span className="hidden lg:inline">Astro Code</span>
            </button>
          </nav>

          {/* Active Vault Tokens Indicator */}
          {activeTokenCount > 0 && onOpenVaultModal && (
            <button
              id="btn-active-vault-tokens"
              onClick={onOpenVaultModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold animate-pulse hover:bg-emerald-900 transition"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{activeTokenCount} Active 10-Min Vault</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
