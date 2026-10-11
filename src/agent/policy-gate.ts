import {
  ForbiddenState,
  PolicyGateResult,
  RefusalReceipt,
  TokenMarketData,
  TrustEvaluation,
} from '../types/index.js';
import { signRefusalReceipt } from '../engine/crypto-receipt.js';

export interface PolicyGateParams {
  symbol: string;
  side: 'BUY' | 'SELL';
  baseSizeUsd: number;
  orderType: 'MARKET' | 'LIMIT' | 'PASSIVE_PEG';
  marketData: TokenMarketData;
  evaluation: TrustEvaluation;
  hasOfficialFiling?: boolean;
  deltaHours?: number;
}

export class DaybreakPolicyGate {
  /**
   * Enforces the 10 Forbidden States and deterministic quadratic sizing rule.
   */
  public evaluate(params: PolicyGateParams): PolicyGateResult {
    const { symbol, side, baseSizeUsd, orderType, marketData, evaluation, hasOfficialFiling, deltaHours = 0 } = params;

    // Check each of the 10 Forbidden States in deterministic hierarchy

    // 1. FORBIDDEN_ZERO_TRUST_SIZING: Any allocation attempted when TrustScore < 0.30 (Grade F)
    if (evaluation.grade === 'F' || evaluation.score < 0.30) {
      return this.createRefusal(
        params,
        ForbiddenState.FORBIDDEN_ZERO_TRUST_SIZING,
        `Composite trust score (${evaluation.score.toFixed(3)}) is Grade F (< 0.30). Zero-trust sizing policy strictly prohibits execution.`
      );
    }

    // 2. FORBIDDEN_EXCESSIVE_CHURN_BUY: Churn > 5.0x without official 8-K
    if (side === 'BUY' && evaluation.metrics.volumeToFloat > 5.0 && !hasOfficialFiling && !marketData.official8KFiled) {
      return this.createRefusal(
        params,
        ForbiddenState.FORBIDDEN_EXCESSIVE_CHURN_BUY,
        `Volume-to-float churn is ${evaluation.metrics.volumeToFloat.toFixed(2)}x (> 5.0x limit) without official SEC 8-K disclosure. Classic dark-hours wash trap.`
      );
    }

    // 3. FORBIDDEN_DARK_MARKET_ORDER: Market order during dark hours with Grade D
    if (
      orderType === 'MARKET' &&
      (evaluation.phase === 'SATURDAY_DARK' || evaluation.phase === 'SUNDAY_PRE_FUTURES') &&
      evaluation.grade === 'D'
    ) {
      return this.createRefusal(
        params,
        ForbiddenState.FORBIDDEN_DARK_MARKET_ORDER,
        `Aggressive market order rejected during ${evaluation.phase} under Grade D trust. Only passive limit pegs permitted.`
      );
    }

    // 4. FORBIDDEN_NEGATIVE_DEPTH_EXECUTION: Order size > 50% of top-5 book depth
    if (baseSizeUsd > evaluation.metrics.top5DepthUsd * 0.50) {
      return this.createRefusal(
        params,
        ForbiddenState.FORBIDDEN_NEGATIVE_DEPTH_EXECUTION,
        `Order size ($${baseSizeUsd.toLocaleString()}) exceeds 50% of cumulative top-5 book depth ($${evaluation.metrics.top5DepthUsd.toLocaleString()}). Severe market impact guaranteed.`
      );
    }

    // 5. FORBIDDEN_WIDE_SPREAD_CROSS: Crossing spread when spread > 100 bps
    if (orderType === 'MARKET' && evaluation.metrics.spreadBps > 100) {
      return this.createRefusal(
        params,
        ForbiddenState.FORBIDDEN_WIDE_SPREAD_CROSS,
        `Bid-ask spread (${evaluation.metrics.spreadBps} bps) exceeds 100 bps threshold. Crossing spread is prohibited.`
      );
    }

    // 6. FORBIDDEN_ORACLE_DESYNC_ARBITRAGE: Price deviates > 8% from lastClose without filing
    const priceDeviationPct = Math.abs((marketData.price - marketData.lastClose) / marketData.lastClose) * 100;
    if (priceDeviationPct > 8.0 && !hasOfficialFiling && !marketData.official8KFiled) {
      return this.createRefusal(
        params,
        ForbiddenState.FORBIDDEN_ORACLE_DESYNC_ARBITRAGE,
        `Synthetic token price deviates by ${priceDeviationPct.toFixed(2)}% (> 8.0%) from last official close without SEC 8-K filing or macro confirmation.`
      );
    }

    // 7. FORBIDDEN_PRE_FUTURES_SPECULATION: Speculation in Sunday pre-futures with macroScore < 0.40
    if (evaluation.phase === 'SUNDAY_PRE_FUTURES' && evaluation.components.macroScore < 0.40) {
      return this.createRefusal(
        params,
        ForbiddenState.FORBIDDEN_PRE_FUTURES_SPECULATION,
        `Speculative directional order prohibited during Sunday Pre-Futures phase while CME Globex is closed and macro confirmation is missing.`
      );
    }

    // 8. FORBIDDEN_UNHEDGED_WEEKEND_OVERNIGHT: Holding large unhedged position in Saturday dark (> $25k)
    if (evaluation.phase === 'SATURDAY_DARK' && baseSizeUsd > 25000) {
      return this.createRefusal(
        params,
        ForbiddenState.FORBIDDEN_UNHEDGED_WEEKEND_OVERNIGHT,
        `Single trade size ($${baseSizeUsd.toLocaleString()}) exceeds Saturday Dark overnight risk cap ($25,000).`
      );
    }

    // 9. FORBIDDEN_POST_CLOSE_MOMENTUM_CHASE: Chasing momentum in late Friday post-close (> 3h)
    if (evaluation.phase === 'FRIDAY_POST_CLOSE' && deltaHours > 3.0 && !hasOfficialFiling) {
      return this.createRefusal(
        params,
        ForbiddenState.FORBIDDEN_POST_CLOSE_MOMENTUM_CHASE,
        `Post-close momentum chasing prohibited after deltaHours > 3.0h (post 7:00 PM EDT) without confirmed earnings/SEC 8-K disclosure.`
      );
    }

    // 10. FORBIDDEN_MONDAY_OPEN_FRONT_RUN: Retail market order within 15 min of Monday 9:30 AM open
    if (evaluation.phase === 'MONDAY_PRE_MARKET' && deltaHours >= 65.25 && orderType === 'MARKET') {
      return this.createRefusal(
        params,
        ForbiddenState.FORBIDDEN_MONDAY_OPEN_FRONT_RUN,
        `Aggressive market order rejected within 15 minutes of Monday 9:30 AM EDT cash opening cross. Orders must participate via official auction mechanisms.`
      );
    }

    // --- SIZING RULE ---
    // Position Size = BaseSize * (TrustScore)^2
    const sizingMultiplier = Math.pow(evaluation.score, 2);
    const adjustedSizeUsd = Number((baseSizeUsd * sizingMultiplier).toFixed(2));

    // If Grade is D, convert market order to PASSIVE_PEG
    let action: PolicyGateResult['action'] = 'EXECUTE';
    if (evaluation.grade === 'D' && orderType === 'MARKET') {
      action = 'PASSIVE_PEG';
    }

    // Calculate basis points saved & risk protection
    const basisPointsSaved = Number((marketData.bidAskSpreadBps * 0.5 + (1 - evaluation.score) * 40).toFixed(1));
    const mondayRiskProtectionUsd = Number((baseSizeUsd * (1 - sizingMultiplier) * 0.05).toFixed(2));

    return {
      allowed: true,
      action,
      adjustedSizeUsd,
      basisPointsSaved,
      mondayRiskProtectionUsd,
      reason: `Order approved under Grade ${evaluation.grade} trust (Score: ${evaluation.score.toFixed(3)}). Position scaled by ${(sizingMultiplier * 100).toFixed(1)}%.`,
    };
  }

  private createRefusal(
    params: PolicyGateParams,
    forbiddenState: ForbiddenState,
    rejectionReason: string
  ): PolicyGateResult {
    const { symbol, side, baseSizeUsd, marketData, evaluation } = params;

    const distortionBps = Math.abs((marketData.price - marketData.lastClose) / marketData.lastClose) * 10000;
    const estimatedMondayReversionBps = Number(Math.max(120, distortionBps * (1 - evaluation.score)).toFixed(1));
    const estimatedCapitalPreservedUsd = Number(
      (baseSizeUsd * (estimatedMondayReversionBps / 10000)).toFixed(2)
    );
    const basisPointsSaved = Number((marketData.bidAskSpreadBps + 50).toFixed(1));

    const receipt: RefusalReceipt = {
      receiptId: `refusal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      symbol,
      attemptedAction: side,
      attemptedSizeUsd: baseSizeUsd,
      trustGrade: evaluation.grade,
      trustScore: evaluation.score,
      triggeredForbiddenState: forbiddenState,
      rejectionReason,
      estimatedMondayReversionBps,
      estimatedCapitalPreservedUsd,
    };

    const signedReceipt = signRefusalReceipt(receipt);

    return {
      allowed: false,
      action: 'REFUSE',
      adjustedSizeUsd: 0,
      basisPointsSaved,
      mondayRiskProtectionUsd: estimatedCapitalPreservedUsd,
      triggeredForbiddenState: forbiddenState,
      reason: rejectionReason,
      refusalReceipt: signedReceipt,
    };
  }
}
