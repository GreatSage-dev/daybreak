import { describe, it, expect } from 'vitest';
import { SimulationRunner, BENCHMARK_SIMULATION_EVENTS } from '../src/agent/simulation-runner.js';
import { BitgetMcpAdapter } from '../src/adapters/bitget-mcp.js';
import { BitgetSignalAdapter } from '../src/adapters/bitget-signal.js';
import { BitgetAgentHubClient } from '../src/adapters/agent-hub.js';
import { DaybreakAgent } from '../src/agent/daybreak-agent.js';
import { NaiveAgent } from '../src/agent/naive-agent.js';

describe('Daybreak Agent vs Naive Agent Simulation Benchmark', () => {
  it('proves Daybreak achieves superior net alpha and 0% wash drawdown vs Naive agent', async () => {
    const runner = new SimulationRunner();
    const result = await runner.runSimulation(BENCHMARK_SIMULATION_EVENTS);

    const { daybreakSummary, naiveSummary, alphaAdvantageUsd, totalBasisPointsSaved } = result;

    // 1. Daybreak Agent must refuse AMC wash trading trap
    const amcComparison = result.comparisons.find((c) => c.symbol === 'AMC-rToken');
    expect(amcComparison).toBeDefined();
    expect(amcComparison?.daybreak.decision.action).toBe('REFUSE');
    expect(amcComparison?.daybreak.capitalPreservedUsd).toBeGreaterThan(0);
    expect(amcComparison?.daybreak.pnlUsd).toBe(0); // 0 drawdown on wash trap!

    // 2. Naive Agent must have executed the AMC wash and suffered large loss
    expect(amcComparison?.naive.decision.action).toBe('BUY');
    expect(amcComparison?.naive.pnlUsd).toBeLessThan(0);

    // 3. Daybreak Net PnL must be strictly greater than Naive Agent PnL
    expect(daybreakSummary.totalPnlUsd).toBeGreaterThan(naiveSummary.totalPnlUsd);
    expect(alphaAdvantageUsd).toBeGreaterThan(0);

    // 4. Daybreak total slippage paid must be significantly lower than Naive Agent
    expect(daybreakSummary.totalSlippageBps).toBeLessThan(naiveSummary.totalSlippageBps);

    // 5. Daybreak must have zero wash drawdown, while Naive suffers significant drawdown
    expect(naiveSummary.maxDrawdownPct).toBeGreaterThan(daybreakSummary.maxDrawdownPct);

    // 6. Daybreak Sharpe Ratio must be superior
    expect(daybreakSummary.sharpeRatio).toBeGreaterThan(naiveSummary.sharpeRatio);

    // 7. Basis points saved must be positive
    expect(totalBasisPointsSaved).toBeGreaterThan(0);
  });

  it('records full Bitget S2 compliant paper logs for both agents', async () => {
    const mcp = new BitgetMcpAdapter({ forceOfflineFixtures: true });
    const signal = new BitgetSignalAdapter();
    const hub = new BitgetAgentHubClient({ paperTrading: true });

    const dbAgent = new DaybreakAgent(mcp, signal, hub);
    const nvAgent = new NaiveAgent(mcp, hub);

    const amcEvent = BENCHMARK_SIMULATION_EVENTS[0]!.event;
    await dbAgent.processEvent(amcEvent, 10_000, BENCHMARK_SIMULATION_EVENTS[0]!.referenceTime);
    await nvAgent.processEvent(amcEvent, 10_000, BENCHMARK_SIMULATION_EVENTS[0]!.referenceTime);

    const dbLogs = dbAgent.getPaperLogs();
    const nvLogs = nvAgent.getPaperLogs();

    expect(dbLogs.length).toBeGreaterThanOrEqual(3); // INTENT, POLICY_GATE_CHECK, TRADE_REFUSED
    const gateLog = dbLogs.find((l) => l.eventType === 'POLICY_GATE_CHECK');
    expect(gateLog?.voteOutcome).toBe('REJECTED');

    expect(nvLogs.length).toBe(1);
    expect(nvLogs[0]?.eventType).toBe('TRADE_EXECUTED');
  });
});
