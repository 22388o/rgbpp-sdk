import { bitcoin } from '../bitcoin';
import { NetworkType } from '../network';
import { DataSource } from '../query/source';
import { TxBuilder, InitOutput } from '../transaction/build';

export async function sendBtc(props: {
  from: string;
  tos: InitOutput[];
  source: DataSource;
  networkType: NetworkType;
  minUtxoSatoshi?: number;
  changeAddress?: string;
  fromPubkey?: string;
  feeRate?: number;
}): Promise<bitcoin.Psbt> {
  const tx = new TxBuilder({
    source: props.source,
    networkType: props.networkType,
    minUtxoSatoshi: props.minUtxoSatoshi,
    feeRate: props.feeRate,
  });

  props.tos.forEach((to) => {
    tx.addOutput({
      fixed: true,
      ...to,
    });
  });

  await tx.payFee({
    address: props.from,
    publicKey: props.fromPubkey,
    changeAddress: props.changeAddress,
  });

  return tx.toPsbt();
}
