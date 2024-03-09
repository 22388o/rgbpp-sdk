import { BtcTransferCkbVirtualTxParams, BtcTransferCkbVirtualResult, BtcTransferCkbVirtualTx } from '../types/rgbpp';
import { blockchain } from '@ckb-lumos/base';
import { NoRgbppLiveCellError } from '../error';
import { append0x, calculateRgbppCellCapacity, u128ToLe, u32ToLe } from '../utils';
import { calculateCommitment, genRgbppLockScript } from '../utils/rgbpp';
import { IndexerCell } from '../types';
import { getRgbppLockDep, getSecp256k1CellDep, getXudtDep } from '../constants';

export const genBtcTransferCkbVirtualTx = async ({
  collector,
  xudtTypeBytes,
  rgbppLockArgsList,
  transferAmount,
  isMainnet,
}: BtcTransferCkbVirtualTxParams): Promise<BtcTransferCkbVirtualResult> => {
  const xudtType = blockchain.Script.unpack(xudtTypeBytes) as CKBComponents.Script;

  const rgbppLocks = rgbppLockArgsList.map((args) => genRgbppLockScript(args, isMainnet));
  let rgbppCells: IndexerCell[] = [];
  for await (const rgbppLock of rgbppLocks) {
    const cells = await collector.getCells({ lock: rgbppLock, type: xudtType });
    if (!cells || cells.length === 0) {
      throw new NoRgbppLiveCellError('No rgb++ cells found with the xudt type script and the rgbpp lock args');
    }
    rgbppCells = [...rgbppCells, ...cells];
  }

  const { inputs, sumInputsCapacity, sumAmount } = collector.collectUdtInputs(rgbppCells, transferAmount);

  const rpbppCellCapacity = calculateRgbppCellCapacity(xudtType);
  const outputsData = [append0x(u128ToLe(transferAmount))];
  const outputs: CKBComponents.CellOutput[] = [
    {
      lock: genRgbppLockScript(u32ToLe(1)),
      type: xudtType,
      capacity: append0x(rpbppCellCapacity.toString(16)),
    },
  ];

  if (sumAmount > transferAmount) {
    outputs.push({
      lock: genRgbppLockScript(u32ToLe(2)),
      type: xudtType,
      capacity: append0x(rpbppCellCapacity.toString(16)),
    });
    outputsData.push(append0x(u128ToLe(sumAmount - transferAmount)));
  }

  const cellDeps = [getRgbppLockDep(isMainnet), getXudtDep(isMainnet)];
  const needPaymasterCell = inputs.length < outputs.length;
  if (needPaymasterCell) {
    cellDeps.push(getSecp256k1CellDep(isMainnet));
  }
  const witnesses = inputs.map((_) => '0x');

  const ckbRawTx: CKBComponents.RawTransaction = {
    version: '0x0',
    cellDeps,
    headerDeps: [],
    inputs,
    outputs,
    outputsData,
    witnesses,
  };

  const virtualTx: BtcTransferCkbVirtualTx = {
    inputs,
    outputs,
    outputsData,
  };
  const commitment = calculateCommitment(virtualTx);

  return {
    ckbRawTx,
    commitment,
    needPaymasterCell,
    sumInputsCapacity,
  };
};