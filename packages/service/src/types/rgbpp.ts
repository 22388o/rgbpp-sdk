import { Cell } from '@ckb-lumos/lumos';

export interface RgbppApis {
  getRgbppPaymasterInfo(): Promise<RgbppApiPaymasterInfo>;
  getRgbppTransactionHash(btcTxId: string): Promise<RgbppApiCkbTransactionHash>;
  getRgbppTransactionState(btcTxId: string): Promise<RgbppApiTransactionState>;
  getRgbppAssetsByBtcTxId(btcTxId: string): Promise<Cell[]>;
  getRgbppAssetsByBtcUtxo(btcTxId: string, vout: number): Promise<Cell[]>;
  getRgbppAssetsByBtcAddress(btcAddress: string, params?: RgbppApiAssetsByAddressParams): Promise<Cell[]>;
  getRgbppSpvProof(btcTxId: string, confirmations: number): Promise<RgbppApiSpvProof>;
  sendRgbppCkbTransaction(payload: RgbppApiSendCkbTransactionPayload): Promise<RgbppApiTransactionState>;
  retryRgbppCkbTransaction(payload: RgbppApiRetryCkbTransactionPayload): Promise<RgbppApiTransactionRetry>;
}

export type RgbppTransactionState = 'completed' | 'failed' | 'delayed' | 'active' | 'waiting';

export interface RgbppApiPaymasterInfo {
  btc_address: string;
  fee: number;
}

export interface RgbppApiCkbTransactionHash {
  txhash: string;
}

export interface RgbppApiTransactionState {
  state: RgbppTransactionState;
  failedReason: string;
}

export interface RgbppApiAssetsByAddressParams {
  type_script?: string;
}

export interface RgbppApiSpvProof {
  proof: string;
  spv_client: {
    tx_hash: string;
    index: string;
  };
}

export interface RgbppApiSendCkbTransactionPayload {
  btc_txid: string;
  ckb_virtual_result: {
    ckbRawTx: CKBComponents.RawTransaction;
    needPaymasterCell: boolean;
    sumInputsCapacity: string;
    commitment: string;
  };
}

export interface RgbppApiRetryCkbTransactionPayload {
  btc_txid: string;
}

export interface RgbppApiTransactionRetry {
  success: boolean;
  state: RgbppTransactionState;
}
