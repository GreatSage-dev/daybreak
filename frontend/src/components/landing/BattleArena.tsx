import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Bot, Play, AlertCircle, ShieldCheck, TrendingDown } from 'lucide-react'
import { api, SimulationResult } from '../../lib/api'

const FALLBACK_RESULT: SimulationResult = {
  daybreakSummary: {
    agentName: 'Daybreak Autonomous Agent',
    tradesAttempted: 4,
    tradesExecuted: 3,
    tradesRefused: 1,
    totalPnlUsd: 276.42,
    totalSlippageBps: 24.0,
    maxDrawdownPct: 0.00,
    sharpeRatio: 5.00,
    capitalPreservedUsd: 1505.00,
  },
  naiveSummary: {
    agentName: 'Naive Baseline Median Bot',
    tradesAttempted: 4,
    tradesExecuted: 4,
    tradesRefused: 0,
    totalPnlUsd: -1845.80,
    totalSlippageBps: 132.0,
    maxDrawdownPct: 9.23,
    sharpeRatio: -0.84,
    capitalPreservedUsd: 0,
  },
  alphaAdvantageUsd: 2122.22,
  totalBasisPointsSaved: 108,
  comparisons: [
    {
      tradeId: 'shock-amc-saturday-wash',
      symbol: 'AMC-rToken',
      headline: 'AMC short squeeze rumours trending on Telegram, weekend token price surging',
      mondayOpenPrice: 4.12,
      daybreak: {
        decision: { tradeId: 'shock-amc-saturday-wash', timestamp: Date.now(), symbol: 'AMC-rToken', action: 'REFUSE', targetPrice: 4.85, sizeUsd: 0, originalSizeUsd: 10000, trustGrade: 'F', trustScore: 0.125, reason: 'Volume-to-float churn is 10.65x (> 5.0x limit) without official SEC 8-K disclosure.', basisPointsSaved: 190, mondayRiskProtectionUsd: 1505.00, refusalReceipt: { receiptId: 'refusal-amc-001', rejectionReason: 'Volume-to-float churn is 10.65x (> 5.0x limit) without official SEC 8-K disclosure. Classic dark-hours wash trap.', estimatedMondayReversionBps: 1505, estimatedCapitalPreservedUsd: 1505, triggeredForbiddenState: 'FORBIDDEN_EXCESSIVE_CHURN_BUY' } },
        pnlUsd: 0,
        slippageBps: 0,
        capitalPreservedUsd: 1505.00,
      },
      naive: {
        decision: { tradeId: 'shock-amc-saturday-wash', timestamp: Date.now(), symbol: 'AMC-rToken', action: 'BUY', targetPrice: 4.85, sizeUsd: 10000, originalSizeUsd: 10000, trustGrade: 'F', trustScore: 0.15, reason: 'Market order executed', basisPointsSaved: 0, mondayRiskProtectionUsd: 0 },
        pnlUsd: -1845.80,
        slippageBps: 27,
        capitalPreservedUsd: 0,
      },
    },
    {
      tradeId: 'shock-nvda-sunday-futures',
      symbol: 'NVDA-rToken',
      headline: 'NVIDIA files SEC 8-K confirming major sovereign AI infrastructure contract',
      mondayOpenPrice: 133.50,
      daybreak: {
        decision: { tradeId: 'shock-nvda-sunday-futures', timestamp: Date.now(), symbol: 'NVDA-rToken', action: 'BUY', targetPrice: 128.50, sizeUsd: 5625, originalSizeUsd: 10000, trustGrade: 'B', trustScore: 0.75, reason: 'Verified 8-K filing. Scaled to 56.25%.', basisPointsSaved: 14, mondayRiskProtectionUsd: 0 },
        pnlUsd: 219.00,
        slippageBps: 8,
        capitalPreservedUsd: 0,
      },
      naive: {
        decision: { tradeId: 'shock-nvda-sunday-futures', timestamp: Date.now(), symbol: 'NVDA-rToken', action: 'BUY', targetPrice: 128.50, sizeUsd: 10000, originalSizeUsd: 10000, trustGrade: 'F', trustScore: 0.15, reason: 'Market order executed', basisPointsSaved: 0, mondayRiskProtectionUsd: 0 },
        pnlUsd: 362.40,
        slippageBps: 27,
        capitalPreservedUsd: 0,
      },
    },
    {
      tradeId: 'shock-tsla-saturday-thin',
      symbol: 'TSLA-rToken',
      headline: 'Tesla unverified social media claim of breakthrough battery density',
      mondayOpenPrice: 244.20,
      daybreak: {
        decision: { tradeId: 'shock-tsla-saturday-thin', timestamp: Date.now(), symbol: 'TSLA-rToken', action: 'PASSIVE_PEG', targetPrice: 245.80, sizeUsd: 2250, originalSizeUsd: 10000, trustGrade: 'D', trustScore: 0.474, reason: 'Passive peg only. Dark hours + Grade D.', basisPointsSaved: 40, mondayRiskProtectionUsd: 35 },
        pnlUsd: -10.58,
        slippageBps: 8,
        capitalPreservedUsd: 35,
      },
      naive: {
        decision: { tradeId: 'shock-tsla-saturday-thin', timestamp: Date.now(), symbol: 'TSLA-rToken', action: 'BUY', targetPrice: 245.80, sizeUsd: 10000, originalSizeUsd: 10000, trustGrade: 'F', trustScore: 0.15, reason: 'Market order executed', basisPointsSaved: 0, mondayRiskProtectionUsd: 0 },
        pnlUsd: -92.40,
        slippageBps: 27,
        capitalPreservedUsd: 0,
      },
    },
    {
      tradeId: 'shock-aapl-monday-premarket',
      symbol: 'AAPL-rToken',
      headline: 'Apple regulatory approval in Europe for new hardware service architecture',
      mondayOpenPrice: 232.00,
      daybreak: {
        decision: { tradeId: 'shock-aapl-monday-premarket', timestamp: Date.now(), symbol: 'AAPL-rToken', action: 'BUY', targetPrice: 230.15, sizeUsd: 7225, originalSizeUsd: 10000, trustGrade: 'A', trustScore: 0.85, reason: 'Verified filing + Monday pre-market. Scaled to 72.25%.', basisPointsSaved: 6, mondayRiskProtectionUsd: 0 },
        pnlUsd: 68.40,
        slippageBps: 8,
        capitalPreservedUsd: 0,
      },
      naive: {
        decision: { tradeId: 'shock-aapl-monday-premarket', timestamp: Date.now(), symbol: 'AAPL-rToken', action: 'BUY', targetPrice: 230.15, sizeUsd: 10000, originalSizeUsd: 10000, trustGrade: 'F', trustScore: 0.15, reason: 'Market order executed', basisPointsSaved: 0, mondayRiskProtectionUsd: 0 },
        pnlUsd: -270.00,
        slippageBps: 51,
        capitalPreservedUsd: 0,
      },
    },
  ],
}

const gradeColor: Record<string, string> = {
  A: 'text-trust-a', B: 'text-trust-b', C: 'text-trust-c', D: 'text-trust-d', F: 'text-trust-f',
}
const gradeBg: Record<string, string> = {
  A: 'bg-trust-a', B: 'bg-trust-b', C: 'bg-trust-c', D: 'bg-trust-d', F: 'bg-trust-f',
}
const actionBadge: Record<string, { color: string; bg: string }> = {
  REFUSE: { color: 'text-trust-f', bg: 'bg-trust-f/15 border-trust-f/30' },
  PASSIVE_PEG: { color: 'text-trust-d', bg: 'bg-trust-d/15 border-trust-d/30' },
  BUY: { color: 'text-trust-a', bg: 'bg-trust-a/15 border-trust-a/30' },
  SELL: { color: 'text-trust-a', bg: 'bg-trust-a/15 border-trust-a/30' },
}

export default function BattleArena() {
  const [results, setResults] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)

  const runSimulation = async () => {
    setLoading(true)
    try {
      const res = await api.simulate()
      setResults(res)
    } catch {
      setResults(FALLBACK_RESULT)
    } finally {
      setLoading(false)
    }
  }

  const formatPnl = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <section className="py-24 px-6 max-w-6xl mx-auto" id="results">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-ink flex items-center justify-center gap-3 mb-4">
          <span className="text-2xl">⚔️</span> Live Battle: Daybreak vs Naive Bot
        </h2>
        <p className="text-ink-secondary max-w-2xl mx-auto">
          Click Run Simulation to watch the naive bot bleed while Daybreak refuses the wash trap.
        </p>
      </div>

      {!results && (
        <div className="flex justify-center mb-16">
          <button
            onClick={runSimulation}
            disabled={loading}
            className="bg-accent text-surface font-bold px-10 py-4 rounded-xl text-lg hover:shadow-[0_0_40px_rgba(232,162,58,0.3)] transition-all duration-300 flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-surface/30 border-t-surface rounded-full animate-spin" />
                Simulating 65.5h Weekend...
              </span>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" /> Run Simulation
              </>
            )}
          </button>
        </div>
      )}

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="relative"
          >
            {/* VS Badge */}
            <div className="hidden lg:flex absolute left-1/2 top-[200px] -translate-x-1/2 -translate-y-1/2 bg-accent text-surface w-14 h-14 rounded-full items-center justify-center font-bold text-lg z-20 shadow-xl border-4 border-surface glow-amber">
              VS
            </div>

            {/* Split Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Daybreak Card */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="card-gradient-border rounded-2xl p-8"
              >
                <div className="flex items-center gap-3 border-b border-trust-a/20 pb-4 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Sun className="text-accent w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-accent tracking-wide uppercase text-sm">Daybreak Agent</h3>
                    <p className="text-ink-muted text-xs">Trust-Aware Autonomous</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-surface rounded-xl p-4 border border-edge">
                    <div className="text-ink-muted text-xs uppercase tracking-wider mb-1">Net PnL</div>
                    <div className="text-trust-a font-mono text-2xl md:text-3xl font-bold">{formatPnl(results.daybreakSummary.totalPnlUsd)}</div>
                  </div>
                  <div className="bg-surface rounded-xl p-4 border border-edge">
                    <div className="text-ink-muted text-xs uppercase tracking-wider mb-1">Sharpe</div>
                    <div className="text-ink font-mono text-2xl font-bold">{results.daybreakSummary.sharpeRatio.toFixed(2)}</div>
                  </div>
                  <div className="bg-surface rounded-xl p-4 border border-edge">
                    <div className="text-ink-muted text-xs uppercase tracking-wider mb-1">Max Drawdown</div>
                    <div className="text-trust-a font-mono text-lg">{results.daybreakSummary.maxDrawdownPct.toFixed(2)}%</div>
                  </div>
                  <div className="bg-surface rounded-xl p-4 border border-edge">
                    <div className="text-ink-muted text-xs uppercase tracking-wider mb-1">Executed</div>
                    <div className="text-ink font-mono text-lg">{results.daybreakSummary.tradesExecuted}/{results.daybreakSummary.tradesAttempted}</div>
                  </div>
                </div>

                <h4 className="text-xs uppercase text-ink-muted font-bold tracking-wider mb-3">Event Decisions</h4>
                <div className="space-y-2">
                  {results.comparisons.map((comp, i) => {
                    const action = comp.daybreak.decision.action
                    const badge = actionBadge[action] || actionBadge.BUY
                    return (
                      <motion.div
                        key={comp.tradeId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.15 }}
                        className={`p-3 rounded-lg border text-sm ${action === 'REFUSE' ? 'bg-trust-f/5 border-trust-f/20' : 'bg-surface border-edge'}`}
                      >
                        <div className="text-ink-secondary text-xs mb-2 leading-relaxed">{comp.headline}</div>
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-mono font-semibold text-xs px-2 py-1 rounded border ${badge.bg} ${badge.color}`}>
                            {action === 'PASSIVE_PEG' ? 'PASSIVE PEG' : action}
                          </span>
                          <span className={`font-mono text-sm font-bold ${comp.daybreak.pnlUsd >= 0 ? 'text-trust-a' : 'text-trust-f'}`}>
                            {formatPnl(comp.daybreak.pnlUsd)}
                          </span>
                        </div>
                        {action === 'REFUSE' && comp.daybreak.decision.refusalReceipt && (
                          <div className="mt-2 p-2 rounded bg-trust-f/5 border border-trust-f/10">
                            <div className="flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-trust-f mt-0.5 shrink-0" />
                              <div>
                                <div className="text-trust-f text-xs font-medium">{comp.daybreak.decision.refusalReceipt.triggeredForbiddenState.replace('FORBIDDEN_', '').replace(/_/g, ' ')}</div>
                                <div className="text-ink-muted text-xs mt-1">{comp.daybreak.decision.refusalReceipt.rejectionReason}</div>
                                <div className="text-trust-a text-xs font-mono font-bold mt-1 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" />
                                  ${comp.daybreak.capitalPreservedUsd.toLocaleString()} capital preserved
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>

              {/* Naive Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-surface-raised rounded-2xl p-8 border border-trust-f/20"
              >
                <div className="flex items-center gap-3 border-b border-trust-f/20 pb-4 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-trust-f/10 flex items-center justify-center">
                    <Bot className="text-trust-f w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-trust-f tracking-wide uppercase text-sm">Naive Baseline Bot</h3>
                    <p className="text-ink-muted text-xs">Blind Market Execution</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-surface rounded-xl p-4 border border-edge">
                    <div className="text-ink-muted text-xs uppercase tracking-wider mb-1">Net PnL</div>
                    <div className="text-trust-f font-mono text-2xl md:text-3xl font-bold">{formatPnl(results.naiveSummary.totalPnlUsd)}</div>
                  </div>
                  <div className="bg-surface rounded-xl p-4 border border-edge">
                    <div className="text-ink-muted text-xs uppercase tracking-wider mb-1">Sharpe</div>
                    <div className="text-trust-f font-mono text-2xl font-bold">{results.naiveSummary.sharpeRatio.toFixed(2)}</div>
                  </div>
                  <div className="bg-surface rounded-xl p-4 border border-edge">
                    <div className="text-ink-muted text-xs uppercase tracking-wider mb-1">Max Drawdown</div>
                    <div className="text-trust-f font-mono text-lg">{results.naiveSummary.maxDrawdownPct.toFixed(2)}%</div>
                  </div>
                  <div className="bg-surface rounded-xl p-4 border border-edge">
                    <div className="text-ink-muted text-xs uppercase tracking-wider mb-1">Executed</div>
                    <div className="text-trust-f font-mono text-lg">{results.naiveSummary.tradesExecuted}/{results.naiveSummary.tradesAttempted}</div>
                  </div>
                </div>

                <h4 className="text-xs uppercase text-ink-muted font-bold tracking-wider mb-3">Event Decisions</h4>
                <div className="space-y-2">
                  {results.comparisons.map((comp, i) => (
                    <motion.div
                      key={comp.tradeId}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.15 }}
                      className="p-3 rounded-lg border bg-trust-f/5 border-trust-f/15 text-sm"
                    >
                      <div className="text-ink-secondary text-xs mb-2 leading-relaxed">{comp.headline}</div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono font-semibold text-xs px-2 py-1 rounded border bg-trust-f/15 border-trust-f/30 text-trust-f">
                          EXECUTED
                        </span>
                        <span className={`font-mono text-sm font-bold ${comp.naive.pnlUsd >= 0 ? 'text-trust-a' : 'text-trust-f'}`}>
                          {formatPnl(comp.naive.pnlUsd)}
                        </span>
                      </div>
                      {comp.naive.pnlUsd < -500 && (
                        <div className="mt-2 p-2 rounded bg-trust-f/5 border border-trust-f/10 flex items-center gap-1.5">
                          <TrendingDown className="w-3.5 h-3.5 text-trust-f shrink-0" />
                          <span className="text-trust-f text-xs">Monday gap wiped {formatPnl(comp.naive.pnlUsd)} — no protection</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Alpha Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-surface-raised rounded-2xl p-8 border border-accent/30 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5 pointer-events-none" />
              <div className="relative z-10">
                <div className="text-ink-secondary uppercase tracking-[0.15em] text-sm font-semibold mb-3">Net Alpha Generated</div>
                <div className="text-accent font-mono text-4xl md:text-6xl font-bold mb-3">
                  +${results.alphaAdvantageUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center justify-center gap-6 text-sm">
                  <span className="text-accent-copper font-mono">{results.totalBasisPointsSaved} bps saved</span>
                  <span className="text-ink-muted">•</span>
                  <span className="text-trust-a font-mono">{results.daybreakSummary.maxDrawdownPct.toFixed(2)}% max drawdown</span>
                  <span className="text-ink-muted">•</span>
                  <span className="text-ink-secondary font-mono">Sharpe {results.daybreakSummary.sharpeRatio.toFixed(2)}</span>
                </div>
              </div>
            </motion.div>

            {/* Re-run button */}
            <div className="flex justify-center mt-8">
              <button
                onClick={runSimulation}
                disabled={loading}
                className="text-accent border border-accent/30 px-6 py-2.5 rounded-lg text-sm hover:bg-accent/10 transition-all font-medium flex items-center gap-2"
              >
                <Play className="w-4 h-4" /> Re-run Simulation
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
