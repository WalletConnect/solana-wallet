import {
  PublicKey,
  SignaturePubkeyPair,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import bs58 from 'bs58';
import {
  SolanaSignAllTransactions,
  SolanaSignInstruction,
  SolanaSignTransaction,
} from './types';
import nacl from 'tweetnacl';

export function deserializeAllTransactions(
  serialized: SolanaSignAllTransactions
): Transaction[] {
  return serialized.transactions.map(deserialiseTransaction);
}

export function deserialiseTransaction(
  serialised: SolanaSignTransaction
): Transaction {
  const tx = new Transaction({
    feePayer: new PublicKey(serialised.feePayer),
    recentBlockhash: serialised.recentBlockhash,
  });

  tx.add(...serialised.instructions.map(deserializeInstruction));

  if (serialised.nonceInfo) {
    tx.nonceInfo = {
      nonce: serialised.nonceInfo.nonce,
      nonceInstruction: deserializeInstruction(
        serialised.nonceInfo.nonceInstruction
      ),
    };
  }

  tx.signatures = serialised.signatures.map<SignaturePubkeyPair>(signature => {
    return {
      publicKey: new PublicKey(signature.pubkey),
      signature: signature.signature
        ? Buffer.from(bs58.decode(signature.signature))
        : null,
    };
  });

  return tx;
}

function deserializeInstruction(
  instruction: SolanaSignInstruction
): TransactionInstruction {
  return {
    programId: new PublicKey(instruction.programId),
    data: Buffer.from(bs58.decode(instruction.data ?? '')),
    keys: instruction.keys.map(key => ({
      isSigner: key.isSigner,
      isWritable: key.isWritable,
      pubkey: new PublicKey(key.pubkey),
    })),
  };
}

export function serializeAllTransactions(
  tx: Transaction[]
): SolanaSignAllTransactions {
  return {
    transactions: tx.map(serialiseTransaction),
  };
}

export function serialiseTransaction(tx: Transaction): SolanaSignTransaction {
  return {
    feePayer: tx.feePayer!.toBase58(),
    recentBlockhash: tx.recentBlockhash!,
    instructions: tx.instructions.map(serializeInstruction),
    nonceInfo: tx.nonceInfo
      ? {
          nonce: tx.nonceInfo.nonce,
          nonceInstruction: serializeInstruction(tx.nonceInfo.nonceInstruction),
        }
      : undefined,
    signatures: tx.signatures.map(sign => ({
      pubkey: sign.publicKey.toBase58(),
      signature: sign.signature
        ? bs58.encode(new Uint8Array(sign.signature))
        : undefined,
    })),
  };
}

function serializeInstruction(
  instruction: TransactionInstruction
): SolanaSignInstruction {
  return {
    programId: instruction.programId.toBase58(),
    data: bs58.encode(new Uint8Array(instruction.data)),
    keys: instruction.keys.map(key => ({
      isSigner: key.isSigner,
      isWritable: key.isWritable,
      pubkey: key.pubkey.toBase58(),
    })),
  };
}

export function verifyTransactionSignature(
  address: string,
  signature: string,
  tx: Transaction
) {
  return nacl.sign.detached.verify(
    tx.serializeMessage(),
    bs58.decode(signature),
    bs58.decode(address)
  );
}

export function verifyMessageSignature(
  address: string,
  signature: string,
  message: string
) {
  return nacl.sign.detached.verify(
    bs58.decode(message),
    bs58.decode(signature),
    bs58.decode(address)
  );
}
