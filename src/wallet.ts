import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import {
  deserialiseTransaction,
  deserializeAllTransactions,
  ISolanaWallet,
  serialiseTransaction,
  serializeAllTransactions,
  SolanaSignAllTransactions,
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
    return [{ pubkey: this.keyPair.publicKey.toBase58() }];
  }

  public async signAllTransactions(
    address: string,
    serialisedTransactions: SolanaSignAllTransactions
  ): Promise<SolanaSignAllTransactions> {
    await this.verifyAddressInWallet(address);

    const transactions = deserializeAllTransactions(serialisedTransactions);
    transactions.forEach(tx => tx.sign(this.keyPair));

    return serializeAllTransactions(transactions);
  }

  public async signTransaction(
    address: string,
    serialisedTransaction: SolanaSignTransaction
  ): Promise<SolanaSignTransaction> {
    await this.verifyAddressInWallet(address);

    const transaction = deserialiseTransaction(serialisedTransaction);
    transaction.sign(this.keyPair);

    return serialiseTransaction(transaction);
  }

  public async signMessage(
    address: string,
    message: string
  ): Promise<{ signature: string }> {
    await this.verifyAddressInWallet(address);

    const signature = nacl.sign.detached(
      bs58.decode(message),
      this.keyPair.secretKey
    );
    return {
      signature: bs58.encode(signature),
    };
  }

  async verifyAddressInWallet(address: string) {
    const accounts = await this.getAccounts();
    if (!accounts.find(x => x.pubkey === address)) {
      throw new Error(`Address ${address} not found in wallet`);
    }
  }
}

export default SolanaWallet;
