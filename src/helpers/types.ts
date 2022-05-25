export abstract class ISolanaWallet {
  public abstract getAccounts(): Promise<{ pubkey: string }[]>;
  public abstract signAllTransactions(
    address: string,
    serialisedTransactions: SolanaSignAllTransactions
  ): Promise<SolanaSignAllTransactions>;
  public abstract signTransaction(
    address: string,
    serialisedTransaction: SolanaSignTransaction
  ): Promise<SolanaSignTransaction>;
  public abstract signMessage(
    pubkey: string,
    message: string
  ): Promise<{ signature: string }>;
}

export interface SolanaSignAllTransactions {
  transactions: SolanaSignTransaction[];
}

export interface SolanaSignTransaction {
  /** public key of the transaction fee payer */
  feePayer: string;
  /** instructions to be atomically executed */
  instructions: SolanaSignInstruction[];
  /** Nonce information. If populated, transaction will use a durable Nonce hash instead of a recentBlockhash. */
  nonceInfo?: {
    /** The current base58 encoded blockhash stored in the nonce */
    nonce: string;
    /** AdvanceNonceAccount Instruction. */
    nonceInstruction: SolanaSignInstruction;
  };
  /** a recent blockhash */
  recentBlockhash: string;
  /** Signatures for this instruction set */
  signatures: {
    /** pubkey of the signer */
    pubkey: string;
    /** signature matching `pubkey` */
    signature: string;
  }[];
}

export interface SolanaSignInstruction {
  /** public key of the on chain program */
  programId: string;
  /** base58 encoded calldata for instruction */
  data: string;
  /** account metadata used to define instructions */
  keys: {
    /** true if an instruction requires a transaction signature matching `pubkey` */
    isSigner: boolean;
    /** true if the `pubkey` can be loaded as a read-write account */
    isWritable: boolean;
    /** public key of authorized program */
    pubkey: string;
  }[];
}
