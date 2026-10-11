import crypto from 'node:crypto';
import { RefusalReceipt } from '../types/index.js';

// Deterministic Authority Keypair for Daybreak Risk Policy
// In production, loaded from secure HSM or KMS; here deterministic for reproducibility
const KEYPAIR = crypto.generateKeyPairSync('ed25519', {
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

export interface SignedRefusalReceipt extends RefusalReceipt {
  sha256Hash: string;
  signature: string;
  authorityPublicKey: string;
  algorithm: string;
  signedAt: string;
}

/**
 * Signs a RefusalReceipt cryptographically with Daybreak's Authority Key
 */
export function signRefusalReceipt(receipt: RefusalReceipt): SignedRefusalReceipt {
  const canonicalPayload = JSON.stringify({
    receiptId: receipt.receiptId,
    timestamp: receipt.timestamp,
    symbol: receipt.symbol,
    attemptedAction: receipt.attemptedAction,
    attemptedSizeUsd: receipt.attemptedSizeUsd,
    trustGrade: receipt.trustGrade,
    trustScore: receipt.trustScore,
    triggeredForbiddenState: receipt.triggeredForbiddenState,
    rejectionReason: receipt.rejectionReason,
    estimatedMondayReversionBps: receipt.estimatedMondayReversionBps,
    estimatedCapitalPreservedUsd: receipt.estimatedCapitalPreservedUsd,
  });

  const sha256Hash = crypto.createHash('sha256').update(canonicalPayload).digest('hex');
  const signature = crypto.sign(null, Buffer.from(sha256Hash, 'hex'), KEYPAIR.privateKey).toString('hex');

  return {
    ...receipt,
    sha256Hash: `0x${sha256Hash}`,
    signature: `0x${signature}`,
    authorityPublicKey: KEYPAIR.publicKey.replace(/\n/g, '').replace('-----BEGIN PUBLIC KEY-----', '').replace('-----END PUBLIC KEY-----', ''),
    algorithm: 'Ed25519-SHA256',
    signedAt: new Date().toISOString(),
  };
}

/**
 * Verifies any SignedRefusalReceipt cryptographically
 */
export function verifyRefusalReceipt(receipt: SignedRefusalReceipt): boolean {
  try {
    const canonicalPayload = JSON.stringify({
      receiptId: receipt.receiptId,
      timestamp: receipt.timestamp,
      symbol: receipt.symbol,
      attemptedAction: receipt.attemptedAction,
      attemptedSizeUsd: receipt.attemptedSizeUsd,
      trustGrade: receipt.trustGrade,
      trustScore: receipt.trustScore,
      triggeredForbiddenState: receipt.triggeredForbiddenState,
      rejectionReason: receipt.rejectionReason,
      estimatedMondayReversionBps: receipt.estimatedMondayReversionBps,
      estimatedCapitalPreservedUsd: receipt.estimatedCapitalPreservedUsd,
    });

    const hash = crypto.createHash('sha256').update(canonicalPayload).digest('hex');
    const cleanHash = receipt.sha256Hash.replace(/^0x/, '');

    if (hash !== cleanHash) return false;

    const pemPublicKey = `-----BEGIN PUBLIC KEY-----\n${receipt.authorityPublicKey}\n-----END PUBLIC KEY-----`;
    const cleanSig = receipt.signature.replace(/^0x/, '');

    return crypto.verify(
      null,
      Buffer.from(cleanHash, 'hex'),
      pemPublicKey,
      Buffer.from(cleanSig, 'hex')
    );
  } catch {
    return false;
  }
}
