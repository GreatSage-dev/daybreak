import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Loader2, Sparkles, AlertCircle, FileCheck, FileX } from 'lucide-react';
import { api, EvaluateEventRequest, SimulationComparison } from '../../lib/api';

interface ShockInjectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShockEvaluated: (comparison: SimulationComparison) => void;
}

const PRESETS = [
  {
    name: 'AMC 15.6x Churn Anomaly',
    symbol: 'AMC-rToken',
    headline: 'AMC short squeeze rumours trending on Telegram, weekend token price surging',
    deltaHours: 20,
    hasOfficialFiling: false,
    sentiment: 'BULLISH' as const,
    size: 10000,
    mondayOpenPrice: 4.12,
  },
  {
    name: 'NVDA Official 8-K Sovereign AI Deal',
    symbol: 'NVDA-rToken',
    headline: 'NVIDIA files SEC 8-K confirming major sovereign AI infrastructure contract',
    deltaHours: 51,
    hasOfficialFiling: true,
    sentiment: 'BULLISH' as const,
    size: 10000,
    mondayOpenPrice: 133.50,
  },
  {
    name: 'TSLA Social Media Rumor on Thin Book',
    symbol: 'TSLA-rToken',
    headline: 'Tesla unverified social media claim of breakthrough battery density',
    deltaHours: 24,
    hasOfficialFiling: false,
    sentiment: 'BULLISH' as const,
    size: 10000,
    mondayOpenPrice: 244.20,
  },
  {
    name: 'MSTR Weekend Oracle Desync (+9.2%)',
    symbol: 'MSTR-rToken',
    headline: 'MicroStrategy synthetic token surges +9.2% while Bitcoin price remains flat',
    deltaHours: 22,
    hasOfficialFiling: false,
    sentiment: 'BULLISH' as const,
    size: 10000,
    mondayOpenPrice: 192.30,
  },
  {
    name: 'Negative Depth Sweep ($25K)',
    symbol: 'AMC-rToken',
    headline: 'Large aggressive market buy exceeding 50% of top-5 orderbook depth',
    deltaHours: 12,
    hasOfficialFiling: false,
    sentiment: 'BULLISH' as const,
    size: 25000,
    mondayOpenPrice: 4.10,
  },
];

export const ShockInjectorModal: React.FC<ShockInjectorModalProps> = ({
  isOpen,
  onClose,
  onShockEvaluated,
}) => {
  const [symbol, setSymbol] = useState('AMC-rToken');
  const [headline, setHeadline] = useState(PRESETS[0]!.headline);
  const [deltaHours, setDeltaHours] = useState(20);
  const [hasOfficialFiling, setHasOfficialFiling] = useState(false);
  const [sentiment, setSentiment] = useState<'BULLISH' | 'BEARISH' | 'NEUTRAL'>('BULLISH');
  const [sizeUsd, setSizeUsd] = useState(10000);
  const [mondayOpenPrice, setMondayOpenPrice] = useState(4.12);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyPreset = (p: typeof PRESETS[0]) => {
    setSymbol(p.symbol);
    setHeadline(p.headline);
    setDeltaHours(p.deltaHours);
    setHasOfficialFiling(p.hasOfficialFiling);
    setSentiment(p.sentiment);
    setSizeUsd(p.size);
    setMondayOpenPrice(p.mondayOpenPrice);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: EvaluateEventRequest = {
        symbol,
        headline,
        deltaHours,
        hasOfficialFiling,
        sentiment,
        baseSizeUsd: sizeUsd,
        mondayOpenPrice,
      };

      const result = await api.evaluateEvent(payload);
      onShockEvaluated(result);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to evaluate shock event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-surface-raised border border-accent/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-accent/10"
        >
          {/* Header */}
          <div className="bg-surface p-6 border-b border-edge flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-ink text-lg flex items-center gap-2">
                  Interactive Shock Injector
                  <span className="text-xs px-2 py-0.5 rounded bg-accent/20 text-accent font-mono font-bold">
                    SANDBOX
                  </span>
                </h3>
                <p className="text-xs text-ink-muted">
                  Test the Daybreak Policy Gate against simulated or custom weekend market shocks
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Quick Presets */}
            <div>
              <label className="text-xs font-mono text-ink-muted uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-accent" /> Quick Presets for Judges
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="text-xs font-mono px-3 py-1.5 rounded-lg bg-surface border border-edge hover:border-accent hover:text-accent transition-all text-ink-secondary"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Token Selector */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-ink-muted block mb-1">Target rToken</label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full bg-surface border border-edge rounded-lg p-2.5 text-sm font-mono text-ink focus:border-accent outline-none"
                >
                  <option value="AMC-rToken">AMC-rToken (High Churn Test)</option>
                  <option value="NVDA-rToken">NVDA-rToken (Liquid AI Benchmark)</option>
                  <option value="TSLA-rToken">TSLA-rToken (Meme/Thin Depth)</option>
                  <option value="AAPL-rToken">AAPL-rToken (Deep Institutional)</option>
                  <option value="MSTR-rToken">MSTR-rToken (Crypto Beta Desync)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-ink-muted block mb-1">Weekend Phase / Delta</label>
                <select
                  value={deltaHours}
                  onChange={(e) => setDeltaHours(Number(e.target.value))}
                  className="w-full bg-surface border border-edge rounded-lg p-2.5 text-sm font-mono text-ink focus:border-accent outline-none"
                >
                  <option value={1.5}>Friday Post-Close (+1.5h)</option>
                  <option value={12}>Saturday Dark 04:00 AM (+12h)</option>
                  <option value={20}>Saturday Dark 12:00 PM (+20h)</option>
                  <option value={40}>Sunday Pre-Futures (+40h)</option>
                  <option value={51}>Sunday Futures Reopened (+51h)</option>
                  <option value={63}>Monday Pre-Market (+63h)</option>
                  <option value={65.3}>Monday 09:18 AM Front-Run (+65.3h)</option>
                </select>
              </div>
            </div>

            {/* Headline */}
            <div>
              <label className="text-xs font-mono text-ink-muted block mb-1">Breaking Headline Text</label>
              <textarea
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                rows={2}
                className="w-full bg-surface border border-edge rounded-lg p-2.5 text-sm text-ink focus:border-accent outline-none resize-none font-sans"
                placeholder="Enter breaking news or market event headline..."
                required
              />
            </div>

            {/* Toggle SEC 8-K & Sentiment */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-ink-muted block mb-1">Official SEC 8-K Filing?</label>
                <button
                  type="button"
                  onClick={() => setHasOfficialFiling(!hasOfficialFiling)}
                  className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-lg border text-sm font-mono transition-all ${
                    hasOfficialFiling
                      ? 'bg-trust-a/15 border-trust-a/40 text-trust-a font-bold'
                      : 'bg-trust-f/10 border-trust-f/30 text-trust-f'
                  }`}
                >
                  {hasOfficialFiling ? <FileCheck className="w-4 h-4" /> : <FileX className="w-4 h-4" />}
                  {hasOfficialFiling ? 'YES — Official 8-K Filed' : 'NO — Unverified Rumor'}
                </button>
              </div>

              <div>
                <label className="text-xs font-mono text-ink-muted block mb-1">Order Size (USD)</label>
                <input
                  type="number"
                  value={sizeUsd}
                  onChange={(e) => setSizeUsd(Number(e.target.value))}
                  step={1000}
                  min={1000}
                  max={50000}
                  className="w-full bg-surface border border-edge rounded-lg p-2.5 text-sm font-mono text-ink focus:border-accent outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-trust-f/15 border border-trust-f/30 text-xs text-trust-f">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Footer */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-mono text-ink-muted">
                Engine will evaluate T = √(H · G) and apply Policy Gate
              </span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-surface text-ink-muted hover:text-ink text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-surface text-sm font-bold hover:shadow-[0_0_20px_rgba(232,162,58,0.3)] transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {loading ? 'Evaluating Policy...' : 'Simulate Shock'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
