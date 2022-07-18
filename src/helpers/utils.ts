import { PublicKey, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { SolanaSignTransaction } from './types';
import nacl from 'tweetnacl';

export function deserialiseTransaction(
  seralised: SolanaSignTransaction
): Transaction {
  const tx = new Transaction({
    recentBlockhash: seralised.recentBlockhash,
    feePayer: new PublicKey(bs58.decode(seralised.feePayer)),
  });

  tx.add(
    ...seralised.instructions.map(x => {
      let data: Buffer;
      if (x.data) {
        if ('string' === typeof x.data) {
          data = Buffer.from(bs58.decode(x.data));
        } else {
          data = Buffer.from(x.data);
        }
      } else {
        data = Buffer.from([]);
      }

      return {
        programId: new PublicKey(bs58.decode(x.programId)),
        data,
        keys: x.keys.map(y => ({
          ...y,
          pubkey: new PublicKey(bs58.decode(y.pubkey)),
        })),
      };
    })
  );

  seralised.partialSignatures.forEach(partial => {
    tx.addSignature(
      new PublicKey(bs58.decode(partial.pubkey)),
      Buffer.from(bs58.decode(partial.pubkey))
    );
  });

  return tx;
}

export function serialiseTransaction(tx: Transaction): SolanaSignTransaction {
  return {
    feePayer: tx.feePayer!.toBase58(),
    recentBlockhash: tx.recentBlockhash!,
    instructions: tx.instructions.map(instruction => ({
      programId: instruction.programId.toBase58(),
      keys: instruction.keys.map(key => ({
        ...key,
        pubkey: key.pubkey.toBase58(),
      })),
      data: bs58.encode(instruction.data),
    })),
    partialSignatures: tx.signatures.map(sign => ({
      pubkey: sign.publicKey.toBase58(),
      signature: bs58.encode(sign.signature!),
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
