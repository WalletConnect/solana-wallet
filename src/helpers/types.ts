export abstract class ISolanaWallet {
  public abstract getAccounts(): Promise<{ pubkey: string }[]>;
  public abstract signTransaction(
    address: string,
    serialisedTransaction: SolanaSignTransaction
  ): Promise<{ signature: string }>;
  public abstract signMessage(
    pubkey: string,
    message: string
  ): Promise<{ signature: string }>;
}

export interface SolanaSignTransaction {
  feePayer: string;
  instructions: {
    programId: string;
    data?: string | Buffer;
    keys: { isSigner: boolean; isWritable: boolean; pubkey: string }[];
  }[];
  recentBlockhash: string;
  partialSignatures: { pubkey: string; signature: string }[];
}
