import {
  TokenMarketData,
  TrustGrade,
  TrustEvaluation,
  TrustComponents,
  TrustMetrics,
  MacroIndicator,
} from '../types/index.js';
import { evaluateTemporalCurve, TemporalPhaseInfo } from './temporal-curve.js';
import { evaluateMicrostructure, MicrostructureEvaluation } from './microstructure.js';

export interface TrustCalculatorOptions {
  referenceTime?: Date | number;
  macro?: Partial<MacroIndicator>;
  hasOfficialFiling?: boolean;
}

/**
 * Computes composite Trust Evaluation using weighted Harmonic-Geometric synthesis.
 * This guarantees that a collapse in ANY core dimension (e.g., severe wash trading)
 * pulls down the composite score below the safety boundary.
 */
export function calculateTrust(
  marketData: TokenMarketData,
  options: TrustCalculatorOptions = {}
): TrustEvaluation {
  const temporalInfo: TemporalPhaseInfo = evaluateTemporalCurve(options.referenceTime);
  const microInfo: MicrostructureEvaluation = evaluateMicrostructure(
    marketData,
    options.macro,
    options.hasOfficialFiling
  );

  const components: TrustComponents = {
    temporalScore: temporalInfo.baseTemporalScore,
    washScore: microInfo.washScore,
    depthScore: microInfo.depthScore,
    macroScore: microInfo.macroScore,
  };

  // Component weights
  const weights = {
    temporal: 0.35,
    wash: 0.30,
    depth: 0.20,
    macro: 0.15,
  };

  const eps = 0.001;
  const xT = Math.max(eps, components.temporalScore);
  const xW = Math.max(eps, components.washScore);
  const xD = Math.max(eps, components.depthScore);
  const xM = Math.max(eps, components.macroScore);

  // 1. Weighted Geometric Mean: exp(sum(w_i * ln(x_i)))
  const lnGeom =
    weights.temporal * Math.log(xT) +
    weights.wash * Math.log(xW) +
    weights.depth * Math.log(xD) +
    weights.macro * Math.log(xM);
  const geomMean = Math.exp(lnGeom);

  // 2. Weighted Harmonic Mean: 1 / sum(w_i / x_i)
  const invHarmonic =
    weights.temporal / xT +
    weights.wash / xW +
    weights.depth / xD +
    weights.macro / xM;
  const harmonicMean = 1.0 / invHarmonic;

  // 3. Harmonic-Geometric Synthesis: sqrt(H * G)
  const compositeScore = Math.max(0.0, Math.min(1.0, Math.sqrt(harmonicMean * geomMean)));

  // Map to Letter Grade
  // A: >= 0.80, B: >= 0.65, C: >= 0.45, D: >= 0.30, F: < 0.30
  let grade: TrustGrade = 'F';
  if (compositeScore >= 0.80) {
    grade = 'A';
  } else if (compositeScore >= 0.65) {
    grade = 'B';
  } else if (compositeScore >= 0.45) {
    grade = 'C';
  } else if (compositeScore >= 0.30) {
    grade = 'D';
  } else {
    grade = 'F';
  }

  // Uncertainty Margin (sigma) & Confidence
  const now = typeof options.referenceTime === 'number'
    ? options.referenceTime
    : options.referenceTime instanceof Date
    ? options.referenceTime.getTime()
    : Date.now();
  const ageSeconds = Math.max(0, (now - marketData.timestamp) / 1000);
  
  // Freshness penalty + shallow depth uncertainty
  const freshnessPenalty = Math.min(0.15, (ageSeconds / 120) * 0.05);
  const depthUncertainty = Math.min(0.15, (15000 / Math.max(1000, marketData.top5DepthUsd)) * 0.05);
  const uncertaintyMargin = Number((0.02 + freshnessPenalty + depthUncertainty).toFixed(4));
  const confidence = Number(Math.max(0.10, Math.min(0.99, 1.0 - uncertaintyMargin * 2.5)).toFixed(4));

  const metrics: TrustMetrics = {
    volumeToFloat: microInfo.churnRatio,
    spreadBps: microInfo.spreadBps,
    top5DepthUsd: microInfo.top5DepthUsd,
    cmeFuturesActive: temporalInfo.cmeFuturesActive,
  };

  let explanation = `Market Phase: ${temporalInfo.phase} (${temporalInfo.phaseDescription}). `;
  if (microInfo.isWashTradingSuspect) {
    explanation += `ALERT: Abnormal turnover (${microInfo.churnRatio.toFixed(2)}x float) with no SEC filing detected. Wash score severely penalized. `;
  }
  if (microInfo.depthScore < 0.40) {
    explanation += `ALERT: Order book depth ($${microInfo.top5DepthUsd.toLocaleString()}) thin relative to ${microInfo.spreadBps} bps spread. `;
  }
  explanation += `Composite trust score: ${compositeScore.toFixed(3)} [Grade ${grade}].`;

  return {
    grade,
    score: Number(compositeScore.toFixed(4)),
    confidence,
    uncertaintyMargin,
    components: {
      temporalScore: Number(components.temporalScore.toFixed(4)),
      washScore: Number(components.washScore.toFixed(4)),
      depthScore: Number(components.depthScore.toFixed(4)),
      macroScore: Number(components.macroScore.toFixed(4)),
    },
    metrics,
    phase: temporalInfo.phase,
    explanation,
  };
}
