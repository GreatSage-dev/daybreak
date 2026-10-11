import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  ArrowLeft,
  Radio,
  Swords,
  ScrollText,
  TrendingUp,
  Activity,
  Circle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  api,
  TokenData,
  SimulationResult,
  TrustCurveResponse,
  PaperLogEntry,
  RefusalReceiptDetail,
} from '../lib/api';
import { LiveTerminal } from '../components/console/LiveTerminal';
import { RefusalModal } from '../components/console/RefusalModal';

const gradeColor: Record<string, string> = {
  A: 'text-trust-a',
  B: 'text-trust-b',
  C: 'text-trust-c',
  D: 'text-trust-d',
  F: 'text-trust-f',
};
const gradeBg: Record<string, string> = {
  A: 'bg-trust-a',
  B: 'bg-trust-b',
  C: 'bg-trust-c',
  D: 'bg-trust-d',
  F: 'bg-trust-f',
};

const getPhaseStyle = (phase: string) => {
  switch (phase) {
    case 'REGULAR_HOURS':
      return 'text-trust-a border-trust-a/30 bg-trust-a/10';
    case 'SATURDAY_DARK':
      return 'text-trust-f border-trust-f/30 bg-trust-f/10';
    case 'FRIDAY_POST_CLOSE':
      return 'text-accent border-accent/30 bg-accent/10';
    case 'SUNDAY_FUTURES_OPEN':
      return 'text-trust-b border-trust-b/30 bg-trust-b/10';
    case 'MONDAY_PRE_MARKET':
      return 'text-accent border-accent/30 bg-accent/10';
    case 'SUNDAY_PRE_FUTURES':
      return 'text-trust-d border-trust-d/30 bg-trust-d/10';
    default:
      return 'text-ink border-edge bg-surface';
  }
};

const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
const formatNumber = (val: number, decimals = 2) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(val);

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`bg-surface-hover animate-pulse rounded-lg ${className}`} />
);

// --- VIEW COMPONENTS ---

const TrustRadar = () => {
  const [data, setData] = useState<{ count: number; currentPhase: string; tokens: TokenData[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.tokens()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-28 flex-1" />
          <Skeleton className="h-28 flex-1" />
          <Skeleton className="h-28 flex-1" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const avgScore =
    data.tokens.length > 0
      ? data.tokens.reduce((acc, t) => acc + t.trustEvaluation.score, 0) / data.tokens.length
      : 0;

  return (
    <div className="space-y-6 animate-count-up">
      <div className="flex gap-4">
        <div className="bg-surface-raised rounded-xl p-5 border border-edge flex-1 flex flex-col justify-center">
          <span className="text-ink-muted text-sm mb-2 block">Current Phase</span>
          <span className={`inline-block px-3 py-1 rounded-md text-sm font-semibold border w-max ${getPhaseStyle(data.currentPhase)}`}>
            {data.currentPhase.replace(/_/g, ' ')}
          </span>
        </div>
        <div className="bg-surface-raised rounded-xl p-5 border border-edge flex-1 flex flex-col justify-center">
          <span className="text-ink-muted text-sm mb-2 block">Avg Trust Score</span>
          <span className="font-mono text-2xl text-accent">{(avgScore * 100).toFixed(1)}%</span>
        </div>
        <div className="bg-surface-raised rounded-xl p-5 border border-edge flex-1 flex flex-col justify-center">
          <span className="text-ink-muted text-sm mb-2 block">Tokens Monitored</span>
          <span className="font-mono text-2xl text-ink">{data.count}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
        {data.tokens.map((token) => (
          <div
            key={token.symbol}
            className="bg-surface-raised rounded-xl p-6 border border-edge hover:border-edge-glow transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-mono font-semibold text-ink text-lg">{token.symbol}</h3>
                <span className="text-ink-muted text-sm">{token.underlying}</span>
              </div>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-lg ${
                  gradeBg[token.trustEvaluation.grade] || 'bg-surface-hover'
                }`}
              >
                {token.trustEvaluation.grade}
              </div>
            </div>

            <div className="mb-4">
              <div className="font-mono text-2xl text-ink">{formatCurrency(token.price)}</div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-1">
                <span className="text-ink-secondary text-sm">Trust Score</span>
                <span className="font-mono text-sm text-ink-secondary">
                  {(token.trustEvaluation.score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-surface overflow-hidden">
                <div
                  className={`h-full rounded-full ${gradeBg[token.trustEvaluation.grade] || 'bg-accent'}`}
                  style={{ width: `${token.trustEvaluation.score * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {Object.entries(token.trustEvaluation.components).map(([key, value]) => {
                const v = value as number;
                const color = v > 0.7 ? 'bg-trust-a' : v > 0.4 ? 'bg-trust-c' : 'bg-trust-f';
                return (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-xs text-ink-muted w-20 capitalize">{key.replace('Score', '')}</span>
                    <div className="h-1.5 rounded-full bg-surface overflow-hidden flex-1">
                      <div className={`h-full ${color}`} style={{ width: `${v * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-edge">
              <span className="text-ink-muted text-xs">
                Phase: {token.trustEvaluation.phase.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BattleSimulator = () => {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [dataset, setDataset] = useState<'extended' | 'benchmark'>('extended');
  const [running, setRunning] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<RefusalReceiptDetail | null>(null);

  const runSimulation = async () => {
    setRunning(true);
    try {
      const res = await api.simulate({ dataset });
      setResult(res);
    } catch (e) {
      console.error(e);
    }
    setRunning(false);
  };

  return (
    <div className="space-y-6 animate-count-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-ink mb-1">Battle Simulator</h2>
          <p className="text-ink-secondary text-sm">
            Head-to-head deterministic execution on identical weekend market windows
          </p>
        </div>

        {/* Dataset Toggle */}
        <div className="flex items-center gap-2 bg-surface-raised p-1 rounded-xl border border-edge text-xs font-mono">
          <button
            onClick={() => setDataset('extended')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dataset === 'extended'
                ? 'bg-accent text-surface font-bold'
                : 'text-ink-secondary hover:text-ink'
            }`}
          >
            18 Weekend Scenarios
          </button>
          <button
            onClick={() => setDataset('benchmark')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              dataset === 'benchmark'
                ? 'bg-accent text-surface font-bold'
                : 'text-ink-secondary hover:text-ink'
            }`}
          >
            4 Core Benchmark
          </button>
        </div>
      </div>

      <button
        onClick={runSimulation}
        disabled={running}
        className="bg-accent text-surface font-bold px-6 py-3 rounded-xl hover:shadow-[0_0_24px_rgba(232,162,58,0.3)] transition-all flex items-center gap-2 disabled:opacity-70 disabled:hover:shadow-none"
      >
        {running ? <Loader2 className="w-5 h-5 animate-spin" /> : <Swords className="w-5 h-5" />}
        {running ? 'Running Deterministic Simulation...' : `Run ${dataset === 'extended' ? '18-Scenario' : '4-Scenario'} Simulation`}
      </button>

      {result && (
        <div className="space-y-6 mt-8">
          <div className="flex gap-6 flex-col lg:flex-row">
            <div className="flex-1 border border-trust-a/30 bg-surface-raised rounded-xl p-6 shadow-lg shadow-trust-a/5">
              <h3 className="text-trust-a font-bold text-lg mb-4 flex items-center gap-2">
                <ShieldIcon className="w-5 h-5" /> DAYBREAK AGENT
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-ink-muted text-sm">Net PnL</span>
                  <div className="text-trust-a font-mono text-3xl font-bold">
                    {formatCurrency(result.daybreakSummary.totalPnlUsd)}
                  </div>
                </div>
                <div>
                  <span className="text-ink-muted text-sm">Sharpe Ratio</span>
                  <div className="text-ink font-mono text-xl">{formatNumber(result.daybreakSummary.sharpeRatio)}</div>
                </div>
                <div>
                  <span className="text-ink-muted text-sm">Max Drawdown</span>
                  <div className="text-trust-a font-mono text-xl">{formatNumber(result.daybreakSummary.maxDrawdownPct)}%</div>
                </div>
                <div>
                  <span className="text-ink-muted text-sm">Exec / Refused</span>
                  <div className="text-ink font-mono text-xl">
                    {result.daybreakSummary.tradesExecuted} / {result.daybreakSummary.tradesRefused}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 border border-trust-f/30 bg-surface-raised rounded-xl p-6 shadow-lg shadow-trust-f/5">
              <h3 className="text-trust-f font-bold text-lg mb-4 flex items-center gap-2">
                <TargetIcon className="w-5 h-5" /> NAIVE MEDIAN BOT
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-ink-muted text-sm">Net PnL</span>
                  <div className="text-trust-f font-mono text-3xl font-bold">
                    {formatCurrency(result.naiveSummary.totalPnlUsd)}
                  </div>
                </div>
                <div>
                  <span className="text-ink-muted text-sm">Sharpe Ratio</span>
                  <div className="text-ink font-mono text-xl">{formatNumber(result.naiveSummary.sharpeRatio)}</div>
                </div>
                <div>
                  <span className="text-ink-muted text-sm">Max Drawdown</span>
                  <div className="text-trust-f font-mono text-xl">{formatNumber(result.naiveSummary.maxDrawdownPct)}%</div>
                </div>
                <div>
                  <span className="text-ink-muted text-sm">Exec / Refused</span>
                  <div className="text-ink font-mono text-xl">
                    {result.naiveSummary.tradesExecuted} / {result.naiveSummary.tradesRefused}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full bg-accent/10 border border-accent/30 rounded-xl p-4 text-center mt-4">
            <span className="text-accent font-mono text-2xl font-bold">
              Alpha Advantage: +{formatCurrency(result.alphaAdvantageUsd)}
            </span>
            <div className="text-xs text-ink-muted font-mono mt-1">
              Basis points saved from adverse dark spreads: {result.totalBasisPointsSaved} bps
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold text-ink mb-4">
              Event Breakdown ({result.comparisons.length} trades evaluated)
            </h3>
            <div className="space-y-4">
              {result.comparisons.map((comp, idx) => (
                <div key={idx} className="bg-surface-raised rounded-xl p-5 border border-edge flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-4">
                    <span className="font-semibold text-ink text-base">{comp.headline}</span>
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-surface border border-edge text-accent shrink-0">
                      {comp.symbol}
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 p-4 rounded-lg bg-surface border border-edge flex flex-col justify-between">
                      <div>
                        <div className="text-ink-muted text-xs font-bold mb-2 uppercase">Daybreak Decision</div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              comp.daybreak.decision.action === 'REFUSE'
                                ? 'bg-trust-f/20 text-trust-f'
                                : 'bg-trust-a/20 text-trust-a'
                            }`}
                          >
                            {comp.daybreak.decision.action}
                          </span>
                          {comp.daybreak.decision.trustGrade && (
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                gradeBg[comp.daybreak.decision.trustGrade]
                              } text-white`}
                            >
                              Grade {comp.daybreak.decision.trustGrade}
                            </span>
                          )}
                          <span className="font-mono text-sm text-ink">
                            ${comp.daybreak.decision.sizeUsd.toLocaleString()}
                          </span>
                        </div>

                        {comp.daybreak.decision.action === 'REFUSE' && comp.daybreak.decision.refusalReceipt && (
                          <button
                            onClick={() => setSelectedReceipt(comp.daybreak.decision.refusalReceipt || null)}
                            className="w-full text-left bg-trust-f/10 border border-trust-f/20 rounded-lg p-2.5 text-xs text-trust-f mt-2 flex items-center justify-between hover:bg-trust-f/20 transition-all font-mono"
                          >
                            <span className="truncate pr-2">
                              🛡️ Refusal Receipt: +${comp.daybreak.capitalPreservedUsd.toFixed(2)} Preserved
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </button>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-edge text-right">
                        <span
                          className={`font-mono font-bold ${
                            comp.daybreak.pnlUsd > 0
                              ? 'text-trust-a'
                              : comp.daybreak.pnlUsd < 0
                              ? 'text-trust-f'
                              : 'text-ink-muted'
                          }`}
                        >
                          {comp.daybreak.pnlUsd > 0 ? '+' : ''}
                          {formatCurrency(comp.daybreak.pnlUsd)}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 p-4 rounded-lg bg-surface border border-edge flex flex-col justify-between">
                      <div>
                        <div className="text-ink-muted text-xs font-bold mb-2 uppercase">Naive Decision</div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 rounded text-xs font-bold bg-trust-f/20 text-trust-f">
                            {comp.naive.decision.action}
                          </span>
                          <span className="font-mono text-sm text-ink">
                            ${comp.naive.decision.sizeUsd.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-ink-muted">
                          Blind market execution with {comp.naive.slippageBps.toFixed(0)} bps slippage penalty.
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-edge text-right">
                        <span
                          className={`font-mono font-bold ${
                            comp.naive.pnlUsd > 0
                              ? 'text-trust-a'
                              : comp.naive.pnlUsd < 0
                              ? 'text-trust-f'
                              : 'text-ink-muted'
                          }`}
                        >
                          {comp.naive.pnlUsd > 0 ? '+' : ''}
                          {formatCurrency(comp.naive.pnlUsd)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <RefusalModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};

const PaperLogs = () => {
  const [data, setData] = useState<{ count: number; logs: PaperLogEntry[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentFilter, setAgentFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    api.paperLog()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const exportLogs = () => {
    if (!data?.logs) return;
    const blob = new Blob([JSON.stringify(data.logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daybreak-paper-trading-log-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || !data) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const filteredLogs = data.logs.filter((log) => {
    if (agentFilter !== 'All' && log.agent !== agentFilter.toUpperCase()) return false;
    if (typeFilter !== 'All' && log.eventType !== typeFilter.toUpperCase().replace(' ', '_'))
      return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-count-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-ink">Deliberation Audit Log</h2>
          <span className="bg-surface-raised border border-edge px-3 py-1 rounded-full text-sm font-mono text-ink-muted">
            {filteredLogs.length} entries
          </span>
        </div>

        <button
          onClick={exportLogs}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-raised border border-edge hover:border-accent text-xs font-mono text-ink-secondary hover:text-accent transition-all"
        >
          <Download className="w-3.5 h-3.5 text-accent" />
          Export Bitget Paper Log (JSON)
        </button>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex gap-2">
          {['All', 'Daybreak', 'Naive'].map((f) => (
            <button
              key={f}
              onClick={() => setAgentFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                agentFilter === f
                  ? 'bg-accent text-surface'
                  : 'bg-surface-raised text-ink-secondary border border-edge hover:text-ink'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="w-px bg-edge" />
        <div className="flex gap-2">
          {['All', 'Trade Executed', 'Trade Refused'].map((f) => (
            <button
              key={f}
              onClick={() =>
                setTypeFilter(
                  f === 'Trade Executed' ? 'TRADE_EXECUTED' : f === 'Trade Refused' ? 'TRADE_REFUSED' : 'All'
                )
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                (typeFilter === 'All' && f === 'All') ||
                (typeFilter === 'TRADE_EXECUTED' && f === 'Trade Executed') ||
                (typeFilter === 'TRADE_REFUSED' && f === 'Trade Refused')
                  ? 'bg-accent text-surface'
                  : 'bg-surface-raised text-ink-secondary border border-edge hover:text-ink'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 text-ink-muted border border-edge border-dashed rounded-xl">
          No logs matching filters. Run a simulation or switch to Live Terminal to generate records.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const isExpanded = expandedLog === log.id;
            const isExecuted = log.eventType === 'TRADE_EXECUTED';
            return (
              <div
                key={log.id}
                className="bg-surface-raised rounded-xl p-4 border border-edge hover:border-edge-glow transition-all flex gap-4"
              >
                <div
                  className={`w-1.5 rounded-full shrink-0 ${
                    isExecuted ? 'bg-trust-a' : 'bg-trust-f'
                  }`}
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          log.agent === 'DAYBREAK' || log.agent === 'DAYBREAK_AGENT'
                            ? 'bg-accent/20 text-accent'
                            : 'bg-surface text-ink-muted'
                        }`}
                      >
                        {log.agent}
                      </span>
                      <span className="font-mono text-ink font-semibold">{log.symbol}</span>
                      <span className="text-ink-muted text-xs font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded border ${
                        isExecuted
                          ? 'border-trust-a/30 text-trust-a bg-trust-a/10'
                          : 'border-trust-f/30 text-trust-f bg-trust-f/10'
                      }`}
                    >
                      {log.eventType.replace('_', ' ')}
                    </span>
                  </div>

                  {log.metrics && (
                    <div className="flex items-center gap-4 mb-3 bg-surface p-2 rounded border border-edge w-max">
                      <div className="flex items-center gap-2">
                        <span className="text-ink-muted text-xs">Score:</span>
                        <span className="font-mono text-sm text-ink">
                          {(log.metrics.trustScore! * 100).toFixed(1)}%
                        </span>
                      </div>
                      {log.metrics.grade && (
                        <div className="flex items-center gap-2">
                          <span className="text-ink-muted text-xs">Grade:</span>
                          <span className={`font-bold text-sm ${gradeColor[log.metrics.grade]}`}>
                            {log.metrics.grade}
                          </span>
                        </div>
                      )}
                      {log.metrics.pnlDeltaUsd !== undefined && (
                        <div className="flex items-center gap-2 border-l border-edge pl-4">
                          <span className="text-ink-muted text-xs">PnL:</span>
                          <span
                            className={`font-mono text-sm ${
                              log.metrics.pnlDeltaUsd >= 0 ? 'text-trust-a' : 'text-trust-f'
                            }`}
                          >
                            {formatCurrency(log.metrics.pnlDeltaUsd)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                    className="flex items-center gap-1 text-xs text-ink-muted hover:text-accent transition-colors mt-2"
                  >
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {isExpanded ? 'Hide Payload' : 'View Payload'}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-3"
                      >
                        <pre className="bg-surface border border-edge rounded-lg p-4 text-xs font-mono text-ink-secondary overflow-x-auto">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const TrustCurveExplorer = () => {
  const symbols = ['NVDA-rToken', 'TSLA-rToken', 'AAPL-rToken', 'AMC-rToken', 'MSTR-rToken'];
  const [activeSymbol, setActiveSymbol] = useState(symbols[0]);
  const [data, setData] = useState<TrustCurveResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.trustCurve(activeSymbol)
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(console.error);
  }, [activeSymbol]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const pt = payload[0].payload;
      return (
        <div className="bg-surface-raised border border-edge rounded-xl p-4 shadow-xl">
          <div className="font-mono text-accent font-bold mb-1">{pt.deltaHours}h from Close</div>
          <div className="text-ink-muted text-xs mb-3">{pt.phase.replace(/_/g, ' ')}</div>
          <div className="space-y-1">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-ink-secondary">Trust Score:</span>
              <span className="font-mono text-ink">{(pt.compositeTrustScore * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-ink-secondary">Grade:</span>
              <span className={`font-bold ${gradeColor[pt.trustGrade]}`}>{pt.trustGrade}</span>
            </div>
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-ink-secondary">CME Status:</span>
              <span className={`text-xs ${pt.cmeFuturesActive ? 'text-trust-a' : 'text-trust-f'}`}>
                {pt.cmeFuturesActive ? 'OPEN' : 'CLOSED'}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-count-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-ink">Trust Curve Explorer</h2>
        <div className="flex gap-2 bg-surface-raised p-1 rounded-lg border border-edge">
          {symbols.map((sym) => (
            <button
              key={sym}
              onClick={() => setActiveSymbol(sym)}
              className={`px-3 py-1.5 rounded-md text-sm font-mono transition-all ${
                activeSymbol === sym
                  ? 'bg-accent text-surface font-bold'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              {sym.split('-')[0]}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <Skeleton className="w-full h-[400px]" />
      ) : (
        <div className="bg-surface-raised rounded-xl p-6 border border-edge">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.points} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8A23A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#E8A23A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2118" vertical={false} />
                <XAxis
                  dataKey="deltaHours"
                  stroke="#6B5D50"
                  tick={{ fill: '#6B5D50', fontSize: 12 }}
                  tickFormatter={(val) => `${val}h`}
                />
                <YAxis
                  domain={[0, 1]}
                  stroke="#6B5D50"
                  tick={{ fill: '#6B5D50', fontSize: 12 }}
                  tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                />
                <RechartsTooltip content={<CustomTooltip />} />
                <ReferenceLine y={0.8} stroke="#34D399" strokeDasharray="3 3" />
                <ReferenceLine y={0.3} stroke="#EF4444" strokeDasharray="3 3" />
                <Area
                  type="monotone"
                  dataKey="compositeTrustScore"
                  stroke="#E8A23A"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-sm bg-trust-a/80"></div> <span className="text-ink-muted">A {'>'} 80%</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-sm bg-trust-b/80"></div> <span className="text-ink-muted">B {'>'} 70%</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-sm bg-trust-c/80"></div> <span className="text-ink-muted">C {'>'} 50%</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-sm bg-trust-d/80"></div> <span className="text-ink-muted">D {'>'} 30%</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-sm bg-trust-f/80"></div> <span className="text-ink-muted">F {'<'} 30%</span>
            </div>
          </div>
        </div>
      )}

      {data && (
        <div className="bg-surface-raised rounded-xl p-6 border border-edge mt-4 flex items-center justify-between">
          <div>
            <h3 className="font-mono text-xl font-bold text-ink">{data.symbol}</h3>
            <p className="text-ink-muted text-sm">{data.underlying}</p>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl text-ink mb-1">{formatCurrency(data.currentPrice)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN CONSOLE LAYOUT ---

export default function Console() {
  const [activeView, setActiveView] = useState<'terminal' | 'radar' | 'battle' | 'logs' | 'curve'>('terminal');
  const [health, setHealth] = useState<{ status: string; version: string } | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);

  useEffect(() => {
    api.health().then(setHealth).catch(console.error);
    api.systemStatus().then(setSystemStatus).catch(console.error);
  }, []);

  const isHealthy = health?.status === 'healthy' || health?.status === 'ok';

  const SidebarItem = ({ id, icon: Icon, label }: { id: typeof activeView; icon: any; label: string }) => (
    <button
      onClick={() => setActiveView(id)}
      className={`py-3 px-4 rounded-lg w-full text-left flex items-center gap-3 transition-all duration-200 ${
        activeView === id
          ? 'bg-surface-hover border-l-2 border-accent text-accent'
          : 'text-ink-secondary hover:text-ink hover:bg-surface-hover/50 border-l-2 border-transparent'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-64 fixed left-0 top-0 h-screen bg-surface-raised border-r border-edge flex flex-col z-10">
        <div className="p-6">
          <div className="flex items-center gap-2 text-accent font-bold text-lg">
            <Sun className="w-6 h-6" /> DAYBREAK
          </div>
          <div className="text-ink-muted text-xs tracking-[0.2em] uppercase mt-1">Console</div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <SidebarItem id="terminal" icon={Activity} label="Live Terminal" />
          <SidebarItem id="radar" icon={Radio} label="Radar" />
          <SidebarItem id="battle" icon={Swords} label="Battle Simulator" />
          <SidebarItem id="logs" icon={ScrollText} label="Paper Logs" />
          <SidebarItem id="curve" icon={TrendingUp} label="Trust Curve" />
        </nav>

        <div className="mt-auto border-t border-edge p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Circle className={`w-2.5 h-2.5 fill-current ${isHealthy ? 'text-trust-a' : 'text-trust-f'}`} />
            <span className={isHealthy ? 'text-trust-a text-sm font-medium' : 'text-trust-f text-sm font-medium'}>
              {isHealthy ? 'Engine Online' : 'Engine Offline'}
            </span>
          </div>
          <div className="text-xs font-mono text-ink-muted">
            Mode: <span className="text-accent">{systemStatus?.testnetStatus?.mode?.replace(/_/g, ' ') || 'SANDBOX'}</span>
          </div>
          <div className="text-ink-muted text-xs font-mono">v{health?.version || '1.2.0'}</div>

          <Link
            to="/"
            className="text-ink-muted hover:text-accent text-sm flex items-center gap-2 transition-colors pt-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="ml-64 flex-1 h-screen overflow-y-auto p-8 relative">
        {/* LIVE TELEMETRY BANNER */}
        <div className="mb-6 p-4 rounded-xl bg-surface-raised border border-edge flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-trust-a animate-pulse" />
            <span className="text-xs font-mono font-semibold text-trust-a tracking-wider uppercase">
              Live Telemetry & SEC Verification
            </span>
            <span className="text-ink-muted text-xs">•</span>
            <span className="text-xs text-ink-secondary">
              EDGAR: <span className="text-trust-a font-mono">data.sec.gov (Live)</span>
            </span>
            <span className="text-ink-muted text-xs">•</span>
            <span className="text-xs text-ink-secondary">
              Receipts: <span className="text-accent font-mono">Ed25519 Signed</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-ink-secondary">
              BTC: <span className="text-accent font-bold">${systemStatus?.liveBenchmarks?.btcUsd?.toLocaleString() || '82,959'}</span>
            </span>
            <span className="text-ink-muted">|</span>
            <span className="text-ink-secondary">
              Phase: <span className="text-trust-d font-bold">{systemStatus?.currentPhase?.replace(/_/g, ' ') || 'SATURDAY DARK'}</span>
            </span>
            <span className="text-ink-muted">|</span>
            <span className="text-trust-a">
              {systemStatus?.testnetStatus?.endpoint || 'https://api.bitget.com'}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            {activeView === 'terminal' && <LiveTerminal />}
            {activeView === 'radar' && <TrustRadar />}
            {activeView === 'battle' && <BattleSimulator />}
            {activeView === 'logs' && <PaperLogs />}
            {activeView === 'curve' && <TrustCurveExplorer />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Icons
function ShieldIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function TargetIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
