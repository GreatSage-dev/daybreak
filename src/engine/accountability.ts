import { OpeningCrossAudit, TrustEvaluation } from '../types/index.js';

export interface AuditRecordInput {
  symbol: string;
  weekendPrice: number;
  mondayOpenPrice: number;
  evaluation: TrustEvaluation;
  attemptedSizeUsd?: number;
}

/**
 * Monday Opening Cross Accountability Engine:
 * Compares weekend dark-hours pricing to actual Monday 9:30 AM NYSE Opening Cross prints.
 * Audits whether low trust ratings correctly anticipated violent price reversions,
 * and quantifies exact capital preserved for the fund.
 */
export function auditOpeningCross(input: AuditRecordInput): OpeningCrossAudit {
  const { symbol, weekendPrice, mondayOpenPrice, evaluation, attemptedSizeUsd = 10000 } = input;

  // Reversion error in basis points: |P_weekend - P_open| / P_open * 10,000
  const priceDiff = Math.abs(weekendPrice - mondayOpenPrice);
  const reversionErrorBps = Number(((priceDiff / mondayOpenPrice) * 10000).toFixed(2));

  // Determine accuracy score:
  // If trust score was LOW (< 0.45) and reversion was HIGH (> 200 bps) -> Highly accurate protection!
  // If trust score was HIGH (> 0.65) and reversion was LOW (< 100 bps) -> Highly accurate validation!
  // If trust score was HIGH and reversion was HIGH -> Trust failure (penalized).
  let accuracyScore = 0.5;

  const isLowTrust = evaluation.score < 0.45;
  const isHighTrust = evaluation.score >= 0.65;
  const isHighReversion = reversionErrorBps >= 200;
  const isLowReversion = reversionErrorBps <= 100;

  if (isLowTrust && isHighReversion) {
    // Successfully detected dark-hours distortion
    accuracyScore = Math.min(1.0, 0.80 + (reversionErrorBps / 2000) * 0.20);
  } else if (isHighTrust && isLowReversion) {
    // Successfully validated true price discovery
    accuracyScore = Math.min(1.0, 0.85 + (1.0 - reversionErrorBps / 100) * 0.15);
  } else if (isHighTrust && isHighReversion) {
    // False positive trust
    accuracyScore = Math.max(0.05, 0.50 - (reversionErrorBps / 1000) * 0.30);
  } else {
    // Moderate regime
    accuracyScore = 0.70;
  }

  // Capital preserved: If trade was avoided/scaled during distorted pricing,
  // capital preserved = attemptedSizeUsd * (priceDiff / weekendPrice)
  const capitalPreservedUsd = isLowTrust
    ? Number((attemptedSizeUsd * (priceDiff / weekendPrice)).toFixed(2))
    : 0.0;

  let status: OpeningCrossAudit['status'] = 'VERIFIED_ACCURATE';
  if (reversionErrorBps > 500) {
    status = 'ANOMALOUS_GAP';
  } else if (reversionErrorBps > 150) {
    status = 'MODERATE_DIVERGENCE';
  } else {
    status = 'VERIFIED_ACCURATE';
  }

  return {
    symbol,
    weekendPricePredicted: weekendPrice,
    mondayOpeningPrice: mondayOpenPrice,
    reversionErrorBps,
    predictedTrustGrade: evaluation.grade,
    predictedTrustScore: evaluation.score,
    accuracyScore: Number(accuracyScore.toFixed(4)),
    capitalPreservedUsd,
    status,
  };
}
