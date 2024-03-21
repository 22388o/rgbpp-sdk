import { expect } from 'vitest';
import { bitcoin, FEE_RATE } from '../../src';

/**
 * Estimate a network fee of a PSBT.
 */
export function calculatePsbtFee(psbt: bitcoin.Psbt, feeRate?: number) {
  if (!feeRate) {
    feeRate = FEE_RATE;
  }

  const tx = psbt.extractTransaction(false);
  const virtualSize = tx.virtualSize();
  return Math.ceil(virtualSize * feeRate);
}

/**
 * Expect the paid fee of the PSBT to be in ±1 range of the estimated fee.
 */
export function expectPsbtFeeInRange(psbt: bitcoin.Psbt, feeRate?: number) {
  const estimated = calculatePsbtFee(psbt, feeRate);
  const paid = psbt.getFee();

  const inputs = psbt.data.inputs.length;
  const diff = paid - estimated;

  expect(diff).toBeGreaterThanOrEqual(0);
  expect(diff).toBeLessThanOrEqual(diff + inputs);
}
