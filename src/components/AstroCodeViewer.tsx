import React, { useState } from 'react';
import { ASTRO_CLOUDFLARE_SCAFFOLD, ScaffoldFile } from '../data/astroScaffoldCode';
import { copyToClipboard } from '../utils/helpers';
import {
  Code2,
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
  ExternalLink,
  Layers,
  Database,
  Cloud,
} from 'lucide-react';

export const AstroCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<ScaffoldFile>(ASTRO_CLOUDFLARE_SCAFFOLD[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(selectedFile.content);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadAll = () => {
    const content = ASTRO_CLOUDFLARE_SCAFFOLD.map(
      (f) => `// ==========================================\n// FILE: ${f.path}\n// DESC: ${f.description}\n// ==========================================\n\n${f.content}\n\n`
    ).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'astro_cloudflare_workers_digital_store_scaffold.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Code2 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Astro SSR + Cloudflare Workers Scaffold Code
            </h1>
          </div>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Complete deployable architecture for Cloudflare Workers + D1 Database + R2 Object Storage + Gemini API
          </p>
        </div>

        <button
          onClick={handleDownloadAll}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-950 bg-gradient-to-r from-purple-400 to-indigo-400 hover:brightness-110 rounded-xl shadow transition"
        >
          <Download className="w-4 h-4" />
          <span>Export All Scaffold Files</span>
        </button>
      </div>

      {/* Cloudflare Architecture Blueprint Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
          <div className="flex items-center gap-2 text-orange-400">
            <Cloud className="w-4 h-4" />
            <span className="text-xs font-bold uppercase font-mono">1. Runtime</span>
          </div>
          <p className="text-xs text-zinc-300">
            Astro SSR with <code>@astrojs/cloudflare</code> adapter on Cloudflare Edge Workers.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
          <div className="flex items-center gap-2 text-cyan-400">
            <Database className="w-4 h-4" />
            <span className="text-xs font-bold uppercase font-mono">2. D1 SQL Database</span>
          </div>
          <p className="text-xs text-zinc-300">
            Tables: <code>products</code>, <code>orders</code>, <code>download_tokens</code>.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-400">
            <Terminal className="w-4 h-4" />
            <span className="text-xs font-bold uppercase font-mono">3. R2 10-Min Vault</span>
          </div>
          <p className="text-xs text-zinc-300">
            AWS S3-compatible HMAC Presigned URLs valid for strictly 600 seconds.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-400">
            <Layers className="w-4 h-4" />
            <span className="text-xs font-bold uppercase font-mono">4. Gemini AI Assist</span>
          </div>
          <p className="text-xs text-zinc-300">
            Server-side sales copy generation in <code>/api/admin/ai-assist</code>.
          </p>
        </div>
      </div>

      {/* Code Viewer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* File Tree (4 Cols) */}
        <div className="lg:col-span-4 border-r border-zinc-800 p-4 space-y-2 bg-zinc-950/60">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 block px-2 pb-2 border-b border-zinc-800">
            Scaffold Files ({ASTRO_CLOUDFLARE_SCAFFOLD.length})
          </span>

          <div className="space-y-1">
            {ASTRO_CLOUDFLARE_SCAFFOLD.map((file) => {
              const active = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition flex items-start gap-2.5 ${
                    active
                      ? 'bg-zinc-800 text-white font-semibold border border-purple-500/40 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${active ? 'text-purple-400' : 'text-zinc-500'}`} />
                  <div className="min-w-0">
                    <span className="font-mono block truncate">{file.filename}</span>
                    <span className="text-[10px] text-zinc-500 block truncate">{file.path}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Content Area (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col min-h-[500px]">
          {/* File Toolbar */}
          <div className="px-6 py-3.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold text-white block">
                {selectedFile.path}
              </span>
              <span className="text-[11px] text-zinc-400">
                {selectedFile.description}
              </span>
            </div>

            <button
              onClick={handleCopy}
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
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Textarea */}
          <pre className="flex-1 p-6 text-zinc-200 font-mono text-xs overflow-x-auto leading-relaxed bg-zinc-950 whitespace-pre selection:bg-purple-500/30">
            {selectedFile.content}
          </pre>
        </div>
      </div>
    </div>
  );
};
