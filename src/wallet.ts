import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import {
  deserialiseTransaction,
  ISolanaWallet,
  SolanaSignTransaction,
} from './helpers';
import nacl from 'tweetnacl';

export class SolanaWallet implements ISolanaWallet {
  private keyPair: Keypair;

  constructor(privateKey: Buffer) {
    this.keyPair = Keypair.fromSecretKey(privateKey, {
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

    transaction.sign(this.keyPair);

    // From `Transaction.sign` documentation:
    // The first signature is considered "primary" and is used identify and confirm transactions.
    const primarySigPubkeyPair = transaction.signatures[0];

    if (!primarySigPubkeyPair?.signature) {
      throw new Error('Missing signature');
    }

    return {
      signature: bs58.encode(primarySigPubkeyPair.signature),
    };
  }

  public async signMessage(
    address: string,
    message: string
  ): Promise<{ signature: string }> {
    const accounts = await this.getAccounts();
    if (!accounts.find(x => x.pubkey === address)) {
      throw new Error(`Address ${address} not found in wallet`);
    }

    const signature = nacl.sign.detached(
      bs58.decode(message),
      this.keyPair.secretKey
    );
    return {
      signature: bs58.encode(signature),
    };
  }
}

export default SolanaWallet;
