import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  FileCheck,
  FileX,
  Lock,
  ExternalLink,
} from 'lucide-react';
import {
  api,
  SimulationComparison,
  ScenarioItem,
  RefusalReceiptDetail,
} from '../../lib/api';
import { RefusalModal } from './RefusalModal';
import { ShockInjectorModal } from './ShockInjectorModal';

const gradeBg: Record<string, string> = {
  A: 'bg-trust-a text-surface',
  B: 'bg-trust-b text-surface',
  C: 'bg-trust-c text-surface',
  D: 'bg-trust-d text-surface',
  F: 'bg-trust-f text-surface',
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

export const LiveTerminal: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2 | 5>(1);
  const [scenarios, setScenarios] = useState<ScenarioItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedItems, setFeedItems] = useState<SimulationComparison[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedReceipt, setSelectedReceipt] = useState<RefusalReceiptDetail | null>(null);
  const [isInjectorOpen, setIsInjectorOpen] = useState(false);

  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load scenarios on mount
  useEffect(() => {
    api.scenarios()
      .then((res) => {
        setScenarios(res.scenarios);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load scenarios from API, falling back', err);
        setLoading(false);
      });
  }, []);

  // Streaming loop
  useEffect(() => {
    if (!isPlaying || scenarios.length === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = 3500 / speedMultiplier;

    timerRef.current = setInterval(async () => {
      if (currentIndex >= scenarios.length) {
        // Completed all 18 scenarios — pause or stay at end
        setIsPlaying(false);
        return;
      }

      const nextScenario = scenarios[currentIndex];
      if (!nextScenario) return;

      try {
        // Evaluate single event live
        const comparison = await api.evaluateEvent({
          symbol: nextScenario.event.affectedSymbol,
          headline: nextScenario.event.headline,
          hasOfficialFiling: nextScenario.event.hasOfficialFiling,
          sentiment: nextScenario.event.sentiment,
          rawUrgency: nextScenario.event.rawUrgency,
          baseSizeUsd: nextScenario.baseSizeUsd ?? 10000,
          deltaHours: Math.round(
            (nextScenario.referenceTime - Date.UTC(2026, 9, 9, 20, 0, 0)) / (3600 * 1000)
          ),
          mondayOpenPrice: nextScenario.mondayOpenPrice,
        });

        setFeedItems((prev) => [comparison, ...prev]);
        setCurrentIndex((prev) => prev + 1);
      } catch (err) {
        console.error('Failed to evaluate streaming tick:', err);
      }
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speedMultiplier, scenarios, currentIndex]);

  // Handle custom shock injection
  const handleShockEvaluated = (comparison: SimulationComparison) => {
    setFeedItems((prev) => [comparison, ...prev]);
  };

  const handleRestart = () => {
    setFeedItems([]);
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  // Cumulative Metrics
  const totalDaybreakPnl = feedItems.reduce((acc, item) => acc + item.daybreak.pnlUsd, 0);
  const totalNaivePnl = feedItems.reduce((acc, item) => acc + item.naive.pnlUsd, 0);
  const totalCapitalPreserved = feedItems.reduce(
    (acc, item) => acc + item.daybreak.capitalPreservedUsd,
    0
  );
  const refusalsCount = feedItems.filter((i) => i.daybreak.decision.action === 'REFUSE').length;
  const alphaAdvantage = totalDaybreakPnl - totalNaivePnl;

  return (
    <div className="space-y-6">
      {/* TOP CONTROL BAR */}
      <div className="bg-surface-raised rounded-2xl p-4 border border-edge flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <span
            className={`w-3 h-3 rounded-full ${
              isPlaying ? 'bg-trust-a animate-pulse' : 'bg-trust-d'
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-ink uppercase tracking-wider">
                {isPlaying ? 'Live Streaming Terminal' : 'Stream Paused'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-accent/15 text-accent font-mono">
                {feedItems.length} of {scenarios.length} Scenarios Ticked
              </span>
            </div>
            <p className="text-[11px] text-ink-muted">
              Auto-evaluating weekend microstructure across 65.5h danger window
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all ${
              isPlaying
                ? 'bg-surface border border-edge text-ink-secondary hover:text-ink'
                : 'bg-trust-a text-surface hover:shadow-lg'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause' : 'Resume Stream'}
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-edge text-xs font-mono">
            <span className="text-[11px] text-ink-muted px-1.5">Speed:</span>
            {([1, 2, 5] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeedMultiplier(spd)}
                className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                  speedMultiplier === spd
                    ? 'bg-accent text-surface font-bold'
                    : 'text-ink-secondary hover:text-ink'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Inject Shock */}
          <button
            onClick={() => setIsInjectorOpen(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-accent/20 border border-accent/40 text-accent hover:bg-accent hover:text-surface transition-all flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            Inject Shock
          </button>

          {/* Reset */}
          <button
            onClick={handleRestart}
            title="Restart feed"
            className="p-2 rounded-lg bg-surface border border-edge text-ink-muted hover:text-ink transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* RUNNING STATS BANNER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-raised rounded-xl p-4 border border-edge">
          <span className="text-xs font-mono text-ink-muted block mb-1">Alpha Advantage</span>
          <div className="font-mono text-2xl font-bold text-accent">
            +{formatCurrency(alphaAdvantage)}
          </div>
          <span className="text-[11px] text-trust-a">vs. Blind Naive Bot</span>
        </div>

        <div className="bg-surface-raised rounded-xl p-4 border border-edge">
          <span className="text-xs font-mono text-ink-muted block mb-1">Capital Preserved</span>
          <div className="font-mono text-2xl font-bold text-trust-a">
            +{formatCurrency(totalCapitalPreserved)}
          </div>
          <span className="text-[11px] text-ink-muted">{refusalsCount} Forbidden Refusals</span>
        </div>

        <div className="bg-surface-raised rounded-xl p-4 border border-edge">
          <span className="text-xs font-mono text-ink-muted block mb-1">Wash Drawdown</span>
          <div className="font-mono text-2xl font-bold text-trust-a">0.00%</div>
          <span className="text-[11px] text-trust-f">Naive Bot: -9.23%</span>
        </div>

        <div className="bg-surface-raised rounded-xl p-4 border border-edge">
          <span className="text-xs font-mono text-ink-muted block mb-1">Daybreak Net PnL</span>
          <div
            className={`font-mono text-2xl font-bold ${
              totalDaybreakPnl >= 0 ? 'text-trust-a' : 'text-trust-f'
            }`}
          >
            {totalDaybreakPnl >= 0 ? '+' : ''}
            {formatCurrency(totalDaybreakPnl)}
          </div>
          <span className="text-[11px] text-trust-f">Naive PnL: {formatCurrency(totalNaivePnl)}</span>
        </div>
      </div>

      {/* STREAMING FEED LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-ink-muted px-1">
          <span>LIVE EVENT STREAM ({feedItems.length} EVENTS RECORDED)</span>
          <span>LEFT: DAYBREAK AGENT · RIGHT: NAIVE MEDIAN BOT</span>
        </div>

        {feedItems.length === 0 ? (
          <div className="bg-surface-raised border border-edge border-dashed rounded-2xl p-12 text-center space-y-3">
            <Activity className="w-8 h-8 text-accent mx-auto animate-pulse" />
            <div className="font-bold text-ink">Starting Live Streaming Feed...</div>
            <p className="text-xs text-ink-muted max-w-md mx-auto">
              Ticking through the 18 weekend events. You will see Daybreak calculate trust, scale allocations, and issue Refusal Receipts in real time.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {feedItems.map((item, idx) => {
                const db = item.daybreak;
                const nv = item.naive;
                const isRefusal = db.decision.action === 'REFUSE';
                const isPeg = db.decision.action === 'PASSIVE_PEG';

                return (
                  <motion.div
                    key={item.tradeId + idx}
                    initial={{ opacity: 0, y: -20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-surface-raised rounded-xl border border-edge hover:border-edge-glow transition-all p-5 shadow-lg space-y-4"
                  >
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-edge/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-surface border border-edge text-accent">
                          {item.symbol}
                        </span>
                        <span className="text-xs text-ink-muted font-mono">
                          Monday Open: ${item.mondayOpenPrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono">
                        {db.decision.refusalReceipt?.triggeredForbiddenState && (
                          <span className="px-2 py-0.5 rounded bg-trust-f/15 text-trust-f border border-trust-f/30 text-[11px] font-bold">
                            {db.decision.refusalReceipt.triggeredForbiddenState.replace('FORBIDDEN_', '')}
                          </span>
                        )}
                        <span className="text-ink-muted">Ref #{item.tradeId.slice(-8)}</span>
                      </div>
                    </div>

                    {/* Headline */}
                    <p className="font-semibold text-ink text-sm leading-relaxed">
                      {item.headline}
                    </p>

                    {/* Side-by-Side Execution Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* DAYBREAK (Left) */}
                      <div
                        className={`rounded-xl p-4 border flex flex-col justify-between ${
                          isRefusal
                            ? 'bg-trust-f/5 border-trust-f/30 shadow-sm shadow-trust-f/5'
                            : 'bg-trust-a/5 border-trust-a/30'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-bold flex items-center gap-1.5 text-trust-a">
                              <ShieldCheck className="w-3.5 h-3.5" /> DAYBREAK
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-xs ${
                                  gradeBg[db.decision.trustGrade] || 'bg-surface'
                                }`}
                              >
                                {db.decision.trustGrade}
                              </span>
                              <span className="text-xs font-mono text-ink-muted">
                                {(db.decision.trustScore * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                                isRefusal
                                  ? 'bg-trust-f/20 text-trust-f'
                                  : isPeg
                                  ? 'bg-trust-d/20 text-trust-d'
                                  : 'bg-trust-a/20 text-trust-a'
                              }`}
                            >
                              {db.decision.action}
                            </span>
                            <span className="text-xs font-mono text-ink-secondary">
                              Size: ${db.decision.sizeUsd.toLocaleString()}
                            </span>
                          </div>

                          {isRefusal && (
                            <button
                              onClick={() => setSelectedReceipt(db.decision.refusalReceipt || null)}
                              className="w-full mt-2 p-2 rounded-lg bg-trust-f/10 border border-trust-f/30 text-trust-f text-xs font-mono flex items-center justify-between hover:bg-trust-f/20 transition-all text-left"
                            >
                              <span className="truncate pr-2">
                                🛡️ Refusal Receipt: +${db.capitalPreservedUsd.toFixed(2)} Preserved
                              </span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </button>
                          )}
                        </div>

                        <div className="mt-3 pt-2 border-t border-edge/60 flex items-center justify-between">
                          <span className="text-[11px] text-ink-muted">PnL Impact:</span>
                          <span
                            className={`font-mono text-sm font-bold ${
                              db.pnlUsd > 0
                                ? 'text-trust-a'
                                : db.pnlUsd < 0
                                ? 'text-trust-f'
                                : 'text-ink-secondary'
                            }`}
                          >
                            {db.pnlUsd > 0 ? '+' : ''}
                            {formatCurrency(db.pnlUsd)}
                          </span>
                        </div>
                      </div>

                      {/* NAIVE BOT (Right) */}
                      <div className="rounded-xl p-4 border border-trust-f/20 bg-surface flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-bold text-trust-f">
                              NAIVE MEDIAN BOT
                            </span>
                            <span className="text-xs font-mono text-trust-f bg-trust-f/10 px-2 py-0.5 rounded">
                              BLIND EXEC
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-raised border border-edge text-ink-secondary">
                              MARKET BUY
                            </span>
                            <span className="text-xs font-mono text-ink-secondary">
                              Size: $10,000
                            </span>
                          </div>

                          <p className="text-[11px] text-ink-muted leading-tight mt-1">
                            Executed at market with {nv.slippageBps.toFixed(0)} bps dark-hours slippage penalty.
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-edge/60 flex items-center justify-between">
                          <span className="text-[11px] text-ink-muted">PnL Loss:</span>
                          <span className="font-mono text-sm font-bold text-trust-f">
                            {formatCurrency(nv.pnlUsd)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modals */}
      <RefusalModal
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      <ShockInjectorModal
        isOpen={isInjectorOpen}
        onClose={() => setIsInjectorOpen(false)}
        onShockEvaluated={handleShockEvaluated}
      />
    </div>
  );
};
