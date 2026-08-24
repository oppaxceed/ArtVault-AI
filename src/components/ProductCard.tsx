import React from 'react';
import { Product } from '../types';
import { formatPrice } from '../utils/helpers';
import { Download, Sparkles, CheckCircle2, Zap, ArrowRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickBuy: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickBuy,
}) => {
  return (
    <div
      id={`product-card-${product.id}`}
      className="group flex flex-col bg-zinc-900/90 border border-zinc-800 rounded-xl overflow-hidden hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300"
    >
      {/* Thumbnail Area */}
      <div className="relative aspect-[16/10] overflow-hidden bg-zinc-950">
        <img
          src={product.thumbnailUrl}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-zinc-950/80 backdrop-blur-md text-amber-300 border border-zinc-700/60 shadow">
            {product.category}
          </span>
          {product.featured && (
            <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-orange-500/90 text-white shadow flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}
        </div>

        {/* File Size & R2 Pill */}
        <div className="absolute bottom-3 right-3">
          <span className="px-2 py-0.5 text-[11px] font-mono rounded bg-zinc-900/90 text-zinc-300 border border-zinc-700/60">
            {product.fileSizeMb} MB · R2 Vault
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <h3
            onClick={() => onSelect(product)}
            className="text-base font-bold text-zinc-100 group-hover:text-amber-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {product.title}
          </h3>

          <p className="mt-2 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {product.tagline || product.roughBullets}
          </p>

          {/* AI Compatibility Chips */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.compatibility.slice(0, 3).map((tool, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[10px] font-medium bg-zinc-800/80 text-zinc-300 rounded border border-zinc-700/50"
              >
                {tool}
              </span>
            ))}
            {product.compatibility.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] text-zinc-500">
                +{product.compatibility.length - 3} more
              </span>
            )}
          </div>

          {/* First Hook Bullet Preview */}
          {product.hookBullets && product.hookBullets.length > 0 && (
            <div className="mt-3 text-[11px] text-emerald-400/90 flex items-start gap-1.5 bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/20">
              <Zap className="w-3.5 h-3.5 mt-0.5 text-emerald-400 shrink-0" />
              <span className="line-clamp-1">
                {product.hookBullets[0].replace(/\*\*/g, '')}
              </span>
            </div>
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 uppercase tracking-wider block">
              Instant Access
            </span>
            <span className="text-lg font-bold text-white font-mono">
              {formatPrice(product.priceCents, product.currency)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id={`btn-view-details-${product.id}`}
              onClick={() => onSelect(product)}
              className="px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
            >
              Details
            </button>
            <button
              id={`btn-quick-buy-${product.id}`}
              onClick={() => onQuickBuy(product)}
              className="px-3.5 py-2 text-xs font-bold text-zinc-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-lg shadow transition flex items-center gap-1.5"
            >
              <span>Buy Now</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
