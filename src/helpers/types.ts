export abstract class ISolanaWallet {
  public abstract getAccounts(): Promise<{ pubkey: string }[]>;
}

export interface SolanaSignTransaction {
  feePayer: string;
  instructions: {
    programId: string;
    data?: string;
    keys: { isSigner: boolean; isWritable: boolean; pubkey: string }[];
  }[];
  recentBlockhash: string;
  partialSignatures: { pubkey: string; signature: string }[];
}
