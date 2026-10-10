import { TokenMarketData, MacroIndicator } from '../types/index.js';

export interface MicrostructureEvaluation {
  churnRatio: number;
  washScore: number;
  spreadDepthRatio: number;
  depthScore: number;
  macroScore: number;
  isWashTradingSuspect: boolean;
  spreadBps: number;
  top5DepthUsd: number;
}

/**
 * Evaluates microstructure health:
 * 1. Churn-to-Float Ratio (V_24h / Cap_float): Detects synthetic wash volume traps (e.g. AMC weekend pump).
 * 2. Spread-to-Depth Penalty (S_bps / sqrt(D_top5)): Penalizes wide spreads on shallow books.
 * 3. Macro Alignment Vector: Validates moves against CME Globex index futures or BTC weekend proxy.
 */
export function evaluateMicrostructure(
  marketData: TokenMarketData,
  macro?: Partial<MacroIndicator>,
  hasOfficialFiling?: boolean
): MicrostructureEvaluation {
  // 1. Churn-to-Float ratio
  // Float value in USD = onChainFloat * price
  const floatUsd = marketData.onChainFloat * marketData.price;
  const churnRatio = floatUsd > 0 ? marketData.volume24h / floatUsd : 999.0;

  let washScore = 1.0;
  let isWashTradingSuspect = false;

  const officialFiling = hasOfficialFiling ?? marketData.official8KFiled ?? false;

  if (churnRatio > 5.0) {
    if (officialFiling) {
      // High churn justified by genuine SEC 8-K disclosure / M&A announcement
      washScore = Math.max(0.40, 0.70 - (churnRatio - 5.0) * 0.03);
    } else {
      // The classic AMC dark-hours wash trap: turnover exceeds 5x float without SEC filing
      isWashTradingSuspect = true;
      washScore = Math.max(0.02, 0.05 / (1.0 + 0.2 * (churnRatio - 5.0)));
    }
  } else if (churnRatio > 2.0) {
    // Moderate churn: progressive decay if no 8-K
    washScore = officialFiling ? 0.85 : Math.max(0.35, 1.0 - (churnRatio - 2.0) * 0.20);
  } else {
    // Normal healthy turnover
    washScore = Math.min(1.0, Math.max(0.70, 1.0 - churnRatio * 0.15));
  }

  // 2. Spread-to-Depth Ratio: S_bps / sqrt(D_top5)
  const spreadBps = Math.max(1, marketData.bidAskSpreadBps);
  const depthUsd = Math.max(100, marketData.top5DepthUsd);
  const sqrtDepth = Math.sqrt(depthUsd);
  const spreadDepthRatio = spreadBps / sqrtDepth;

  // depthScore: 1 / (1 + 0.35 * spreadDepthRatio)
  // For tight, deep book (spread=5bps, depth=$250k): ratio = 5 / 500 = 0.01 -> depthScore ~ 0.996
  // For thin, wide book (spread=180bps, depth=$5k): ratio = 180 / 70.7 = 2.54 -> depthScore ~ 0.52
  // For extreme illiquid book (spread=400bps, depth=$1k): ratio = 400 / 31.6 = 12.6 -> depthScore ~ 0.18
  let depthScore = 1.0 / (1.0 + 0.35 * spreadDepthRatio);

  // Severe depth floor penalty if total book depth is dangerously thin (< $10,000)
  if (depthUsd < 10000) {
    const penaltyFactor = Math.max(0.1, depthUsd / 10000);
    depthScore *= penaltyFactor;
  }
  depthScore = Math.max(0.02, Math.min(1.0, depthScore));

  // 3. Macro Alignment Vector
  let macroScore = 0.70; // baseline neutral
  if (macro) {
    const cmeOpen = macro.cmeGlobexOpen ?? false;
    const priceChangePct = ((marketData.price - marketData.lastClose) / marketData.lastClose) * 100;

    if (cmeOpen && macro.esFuturesPrice && macro.nqFuturesPrice) {
      // When CME Globex is open, evaluate whether the token direction matches index futures
      // Assume baseline ES flat reference = 5800, NQ = 20500 or direction signal
      const esMovePct = (macro.esFuturesPrice - 5800) / 5800 * 100;
      const moveCorrelation = Math.sign(priceChangePct) === Math.sign(esMovePct);

      if (Math.abs(priceChangePct) > 3.0 && !moveCorrelation) {
        // Token is surging or crashing contrary to macro futures anchor without 8-K
        macroScore = officialFiling ? 0.60 : 0.25;
      } else {
        macroScore = 0.85;
      }
    } else {
      // CME is closed (Saturday dark / Sunday pre-futures)
      // If token makes a violent move (>4%) during dark hours without an 8-K, macroScore is degraded
      if (Math.abs(priceChangePct) > 4.0 && !officialFiling) {
        macroScore = 0.30;
      } else {
        macroScore = 0.65;
      }
    }
  }

  return {
    churnRatio: Number(churnRatio.toFixed(3)),
    washScore: Number(washScore.toFixed(4)),
    spreadDepthRatio: Number(spreadDepthRatio.toFixed(4)),
    depthScore: Number(depthScore.toFixed(4)),
    macroScore: Number(macroScore.toFixed(4)),
    isWashTradingSuspect,
    spreadBps,
    top5DepthUsd: depthUsd,
  };
}
