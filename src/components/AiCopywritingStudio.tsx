import React, { useState } from 'react';
import { Product, AiCopywritingResult, TechSpec, FAQItem } from '../types';
import { copyToClipboard } from '../utils/helpers';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  Download,
  Send,
  Loader2,
  RefreshCw,
  PlusCircle,
  Search,
  Sliders,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileCode,
  Globe,
} from 'lucide-react';

interface AiCopywritingStudioProps {
  onPublishToCatalog?: (product: Partial<Product>) => void;
}

const PRESET_EXAMPLES = [
  {
    name: 'Cyberpunk Rain & Neon Depth Maps',
    category: 'Motion Assets',
    roughBullets: `Cyberpunk rain overlay, 4k 60fps, neon depth maps, works with runway gen 3 and comfyui controlnet, includes alpha prores and png sequence, lifetime commercial license.`,
    targetTools: ['Runway Gen-3', 'ComfyUI', 'Kling 1.5', 'OpenAI Sora'],
    price: 29,
  },
  {
    name: 'Anime Character Turnaround LoRA',
    category: 'LoRA Models',
    roughBullets: `Anime character turnaround lora, SDXL and Flux trained, 360 degree rotation angles, no face deformation, includes comfyui prompt templates and pose reference sheets.`,
    targetTools: ['ComfyUI', 'Flux.1-Dev', 'SDXL 1.0', 'AnimateDiff'],
    price: 39,
  },
  {
    name: 'Fluid & Explosion Alpha VFX Loops',
    category: 'Alpha VFX Passes',
    roughBullets: `Fluid and plasma explosion vfx, 4k 60fps, pre-keyed transparent background, 80+ clips, works as init video for Runway Gen-3 and Sora, commercial use.`,
    targetTools: ['Runway Gen-3', 'Kling 1.5', 'ComfyUI', 'After Effects'],
    price: 34,
  },
  {
    name: 'Camera Move Latent Vectors for Sora & Kling',
    category: 'Prompt & ComfyUI Workflows',
    roughBullets: `Camera movement prompt library, 50+ cinematic moves, includes comfyui camera node workflows, dolly zoom, vertigo effect, orbital arc, works for Sora Kling and Gen3.`,
    targetTools: ['OpenAI Sora', 'Kling 1.5', 'Runway Gen-3', 'ComfyUI'],
    price: 24,
  },
  {
    name: 'Sci-Fi Mech Rigging & Normal Map Kit',
    category: '3D Normal/Depth Maps',
    roughBullets: `Sci-fi robotic mech hard-surface kit, 4k normal maps and ambient occlusion passes, turntable 360 rotations, 0 temporal noise, ready for ControlNet normal pass.`,
    targetTools: ['ComfyUI ControlNet', 'Kling AI', 'Runway Gen-3'],
    price: 45,
  },
];

export const AiCopywritingStudio: React.FC<AiCopywritingStudioProps> = ({
  onPublishToCatalog,
}) => {
  const [productName, setProductName] = useState('');
  const [roughBullets, setRoughBullets] = useState('');
  const [category, setCategory] = useState('Motion Assets');
  const [tone, setTone] = useState('High-Impact Technical & Creator-Centric');
  const [priceCents, setPriceCents] = useState(2900);
  const [selectedTools, setSelectedTools] = useState<string[]>([
    'Runway Gen-3',
    'ComfyUI',
    'Kling 1.5',
    'OpenAI Sora',
  ]);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiCopywritingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [published, setPublished] = useState(false);
  const [activeViewTab, setActiveViewTab] = useState<'formatted' | 'markdown' | 'seo'>('formatted');

  const ALL_TOOLS = [
    'Runway Gen-3',
    'Kling 1.5',
    'OpenAI Sora',
    'ComfyUI',
    'AnimateDiff',
    'Flux.1-Dev',
    'SDXL 1.0',
    'Luma Dream Machine',
    'DaVinci Resolve',
  ];

  const handleToggleTool = (tool: string) => {
    if (selectedTools.includes(tool)) {
      setSelectedTools(selectedTools.filter((t) => t !== tool));
    } else {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const handleApplyPreset = (preset: (typeof PRESET_EXAMPLES)[0]) => {
    setProductName(preset.name);
    setCategory(preset.category);
    setRoughBullets(preset.roughBullets);
    setSelectedTools(preset.targetTools);
    setPriceCents(preset.price * 100);
  };

  const handleGenerate = async () => {
    if (!productName.trim() || !roughBullets.trim()) {
      setError('Please provide both a product name and rough bullet points.');
      return;
    }

    setLoading(true);
    setError(null);
    setPublished(false);

    try {
      const res = await fetch('/api/admin/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          roughBullets,
          category,
          targetTools: selectedTools,
          tone,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      setResult(data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to call Gemini Copywriting API.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMarkdown = async () => {
    if (!result?.rawMarkdown) return;
    const ok = await copyToClipboard(result.rawMarkdown);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveToCatalog = async () => {
    if (!result) return;
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: result.title,
          tagline: (result as any).tagline || '',
          priceCents,
          currency: 'USD',
          category,
          roughBullets,
          hookBullets: result.hookBullets,
          techSpecs: result.techSpecs,
          faqs: result.faqs,
          fullMarkdownCopy: result.rawMarkdown,
          seoMeta: result.seoMeta,
          compatibility: selectedTools,
          status: 'active',
          fileKey: `r2://vault-art/${productName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_master.zip`,
          fileSizeMb: 1200,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPublished(true);
        if (onPublishToCatalog) onPublishToCatalog(data.product);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to persist to D1 catalog.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>AI Copywriting & SEO Specialist Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
            E-Commerce Copywriting & SEO Specialist for Digital Art Products
          </h1>
          <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
            Provide a short product name and rough bullet points. Powered by Gemini, this engine generates high-converting titles, 3 animator hook benefits, technical specs checklists, and licensing FAQs formatted in pristine Markdown.
          </p>
        </div>
      </div>

      {/* Preset Quick Loader */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        <span className="text-zinc-400 font-mono shrink-0 font-medium">
          Quick Preset Samples:
        </span>
        {PRESET_EXAMPLES.map((preset, idx) => (
          <button
            key={idx}
            id={`btn-preset-${idx}`}
            onClick={() => handleApplyPreset(preset)}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 text-zinc-300 hover:text-white transition whitespace-nowrap"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Product Parameters</span>
            </h2>

            {/* Product Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                1. Short Product Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="input-product-name"
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Cyberpunk Rain & Neon Depth Maps"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
              />
            </div>

            {/* Rough Bullets Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                2. Rough Bullet Points & Notes <span className="text-rose-400">*</span>
              </label>
              <textarea
                id="input-rough-bullets"
                rows={5}
                value={roughBullets}
                onChange={(e) => setRoughBullets(e.target.value)}
                placeholder="Paste unpolished feature points, specs, resolution, tool compatibility, or license details..."
                className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-500 text-xs font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition leading-relaxed"
              />
            </div>

            {/* Category & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Category
                </label>
                <select
                  id="select-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="Motion Assets">Motion Assets</option>
                  <option value="LoRA Models">LoRA Models</option>
                  <option value="Alpha VFX Passes">Alpha VFX Passes</option>
                  <option value="Prompt & ComfyUI Workflows">Prompt & ComfyUI Workflows</option>
                  <option value="3D Normal/Depth Maps">3D Normal/Depth Maps</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Catalog Price (USD)
                </label>
                <input
                  id="input-price"
                  type="number"
                  value={priceCents / 100}
                  onChange={(e) => setPriceCents(Math.round(Number(e.target.value) * 100))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Target AI Tools Multiselect */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                Target AI Animation Ecosystem
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_TOOLS.map((tool) => {
                  const active = selectedTools.includes(tool);
                  return (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => handleToggleTool(tool)}
                      className={`px-2.5 py-1 text-xs rounded-lg transition border font-medium ${
                        active
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {tool}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tone Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Sales Copywriting Tone
              </label>
              <select
                id="select-tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-white text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="High-Impact Technical & Creator-Centric">
                  High-Impact Technical & Creator-Centric (Recommended)
                </option>
                <option value="Cinematic & Authoritative Film Industry">
                  Cinematic & Authoritative Film Industry
                </option>
                <option value="Direct Response High Conversion">
                  Direct Response High Conversion
                </option>
                <option value="Minimalist Studio Excellence">
                  Minimalist Studio Excellence
                </option>
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            {/* Action Button */}
            <button
              id="btn-generate-ai-copy"
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-zinc-950 bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Synthesizing Copy with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-zinc-950" />
                  <span>Generate High-Converting Copy & SEO</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Panel: Output Studio (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[600px]">
            {/* View Mode Bar */}
            <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs font-medium">
                <button
                  id="tab-view-formatted"
                  onClick={() => setActiveViewTab('formatted')}
                  className={`px-3 py-1.5 rounded-md transition ${
                    activeViewTab === 'formatted'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Formatted Visual Copy
                </button>
                <button
                  id="tab-view-markdown"
                  onClick={() => setActiveViewTab('markdown')}
                  className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${
                    activeViewTab === 'markdown'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-amber-400" />
                  <span>Clean Markdown</span>
                </button>
                <button
                  id="tab-view-seo"
                  onClick={() => setActiveViewTab('seo')}
                  className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${
                    activeViewTab === 'seo'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SEO Metadata</span>
                </button>
              </div>

              {result && (
                <div className="flex items-center gap-2">
                  <button
                    id="btn-copy-result-markdown"
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Copy .md</span>
                      </>
                    )}
                  </button>

                  <button
                    id="btn-publish-d1-catalog"
                    onClick={handleSaveToCatalog}
                    disabled={published}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow ${
                      published
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950 hover:brightness-110'
                    }`}
                  >
                    {published ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Published to D1!</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Save to Store</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Results Content Body */}
            <div className="flex-1 p-6 overflow-y-auto">
              {!result && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 text-zinc-400">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-inner">
                    <Sparkles className="w-8 h-8 text-amber-500/60" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-200">
                      AI Copywriting Specialist is Ready
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-sm mt-1">
                      Fill out the parameters on the left or select a quick preset to generate the 4-part e-commerce copy.
                    </p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-amber-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Analyzing Product Notes & Target AI Tools...
                    </p>
                    <p className="text-xs text-zinc-400 font-mono mt-1">
                      Generating Title · 3 Animator Hooks · Specs Checklist · Licensing FAQs
                    </p>
                  </div>
                </div>
              )}

              {result && !loading && (
                <div className="space-y-6">
                  {/* VIEW 1: Formatted Visual Copy */}
                  {activeViewTab === 'formatted' && (
                    <div className="space-y-6">
                      {/* SECTION 1: Product Title */}
                      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-semibold uppercase text-amber-400">
                            1. High-Converting Product Title
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {result.title.length} chars
                          </span>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                          {result.title}
                        </h2>
                        {(result as any).tagline && (
                          <p className="text-xs text-zinc-300 italic pt-1">
                            {(result as any).tagline}
                          </p>
                        )}
                      </div>

                      {/* SECTION 2: 3 Persuasive Hook Bullets */}
                      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-semibold uppercase text-emerald-400 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5" />
                            <span>2. Persuasive Benefits for AI Animators (3 Hooks)</span>
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {result.hookBullets.map((hook, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800/90 flex items-start gap-3"
                            >
                              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
                                <span
                                  dangerouslySetInnerHTML={{
                                    __html: hook.replace(
                                      /\*\*(.*?)\*\*/g,
                                      '<strong class="text-emerald-300 font-semibold">$1</strong>'
                                    ),
                                  }}
                                />
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SECTION 3: Technical Specifications Checklist */}
                      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                        <span className="text-[11px] font-mono font-semibold uppercase text-cyan-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>3. Technical Specifications Checklist</span>
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {result.techSpecs.map((spec, i) => (
                            <div
                              key={i}
                              className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800 flex items-start gap-2"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                              <div className="text-xs">
                                <span className="text-zinc-400 font-medium block">
                                  {spec.label}
                                </span>
                                <span className="text-zinc-100 font-mono font-semibold">
                                  {spec.value}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* SECTION 4: FAQ & Licensing */}
                      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                        <span className="text-[11px] font-mono font-semibold uppercase text-purple-400 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>4. FAQ & License Terms</span>
                        </span>

                        <div className="space-y-2.5">
                          {result.faqs.map((faq, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-lg bg-zinc-900/90 border border-zinc-800 space-y-1"
                            >
                              <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                                <span className="text-purple-400 font-mono">Q{i + 1}:</span>
                                <span>{faq.question}</span>
                              </h4>
                              <p className="text-xs text-zinc-300 leading-relaxed pl-5">
                                {faq.answer}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VIEW 2: Raw Clean Markdown */}
                  {activeViewTab === 'markdown' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                        <span>Clean Markdown formatted output</span>
                        <span>{result.rawMarkdown.split('\n').length} lines</span>
                      </div>
                      <pre className="p-5 rounded-xl bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto leading-relaxed border border-zinc-800 whitespace-pre-wrap selection:bg-amber-500/30">
                        {result.rawMarkdown}
                      </pre>
                    </div>
                  )}

                  {/* VIEW 3: SEO Metadata */}
                  {activeViewTab === 'seo' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                        <span className="text-xs font-mono font-semibold uppercase text-cyan-400">
                          Google Search Result Preview
                        </span>
                        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1">
                          <span className="text-xs text-emerald-400 font-mono block">
                            https://artvault.studio/products/{result.title.toLowerCase().slice(0, 20)}
                          </span>
                          <h4 className="text-sm font-bold text-blue-400 hover:underline cursor-pointer">
                            {result.seoMeta.metaTitle}
                          </h4>
                          <p className="text-xs text-zinc-300 line-clamp-2">
                            {result.seoMeta.metaDescription}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                        <span className="text-xs font-mono font-semibold uppercase text-amber-400">
                          Target High-Intent Keywords
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {result.seoMeta.keywords.map((kw, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 text-xs font-mono rounded-lg bg-zinc-900 text-amber-300 border border-zinc-800"
                            >
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
