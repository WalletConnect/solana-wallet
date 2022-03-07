import { Secp256k1, Sha256 } from '@cosmjs/crypto';
import { fromHex } from '@cosmjs/encoding';
import {
  encodeSecp256k1Signature,
  serializeSignDoc,
  StdSignDoc,
  AminoSignResponse,
  AccountData,
} from '@cosmjs/amino';
import {
  DirectSecp256k1Wallet,
  DirectSignResponse,
} from '@cosmjs/proto-signing';
import {
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  getAddressFromPublicKey,
  getPublicKey,
  ISolanaWallet,
  SolanaSignTransaction,
  deserialiseTransaction,
} from './helpers';
import bs58 from 'bs58';

export class SolanaWallet implements ISolanaWallet {
  private keyPair: Keypair;

  constructor(privateKey: string) {
    this.keyPair = Keypair.fromSecretKey(Buffer.from(privateKey), {
      skipValidation: true,
    });
  }

  public async getAccounts(): Promise<{ pubkey: string }[]> {
    return [{ pubkey: await this.keyPair.publicKey.toBase58() }];
  }

  public async signTransaction(
    address: string,
    serialisedTransaction: SolanaSignTransaction
  ): Promise<{ signature: string }> {
    const accounts = await this.getAccounts();
    if (!accounts.find(x => x.pubkey === address)) {
      throw new Error(`Address ${address} not found in wallet`);
    }

    const transaction = deserialiseTransaction(serialisedTransaction);
    await transaction.sign(this.keyPair);

    const result = transaction.signatures[transaction.signatures.length - 1];

    if (!result?.signature) {
      throw new Error('Missing signature');
    }

    return {
      signature: bs58.encode(result.signature),
    };
  }
}

export default SolanaWallet;
