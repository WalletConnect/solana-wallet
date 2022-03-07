import Long from 'long';
import { Secp256k1 } from '@cosmjs/crypto';
import { pubkeyToAddress, pubkeyType, Coin } from '@cosmjs/amino';
import { toBase64, toHex, fromHex } from '@cosmjs/encoding';
import {
  AccountData,
  makeSignDoc,
  makeAuthInfoBytes,
} from '@cosmjs/proto-signing';

import { COSMOS_ADDRESS_PREFIX } from '../constants';
import { PublicKey, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { SolanaSignTransaction } from '.';

export function getCosmosAddressPrefix(chainId?: string) {
  let prefix = 'cosmos';
  if (typeof chainId !== 'undefined') {
    const [namespace, reference] = chainId.split(':');
    if (namespace !== 'cosmos') {
      throw new Error(
        `Cannot get address with incompatible namespace for chainId: ${chainId}`
      );
    }
    const [name] = reference.split('-');
    if (typeof name !== 'undefined') {
      const match = COSMOS_ADDRESS_PREFIX[name];
      if (typeof match !== 'undefined') {
        prefix = match;
      }
    }
  }
  return prefix;
}

export function getCosmosAddress(publicKey: Uint8Array, chainId?: string) {
  const prefix = getCosmosAddressPrefix(chainId);
  return getAddressFromPublicKey(publicKey, prefix);
}

export function getAddressFromPublicKey(
  publicKey: Uint8Array,
  prefix = 'cosmos'
) {
  // assume for now only secp256k1
  const pubKey = { type: pubkeyType.secp256k1, value: toBase64(publicKey) };
  return pubkeyToAddress(pubKey, prefix);
}

export async function getPublicKey(privkey: Uint8Array) {
  const uncompressed = (await Secp256k1.makeKeypair(privkey)).pubkey;
  return Secp256k1.compressPubkey(uncompressed);
}

export function stringifySignDocValues(signDoc: any) {
  return {
    ...signDoc,
    bodyBytes: toHex(signDoc.bodyBytes),
    authInfoBytes: toHex(signDoc.authInfoBytes),
    accountNumber: signDoc.accountNumber.toString(16),
  };
}

export function parseSignDocValues(signDoc: any) {
  return {
    ...signDoc,
    bodyBytes: fromHex(signDoc.bodyBytes),
    authInfoBytes: fromHex(signDoc.authInfoBytes),
    accountNumber: new Long(signDoc.accountNumber),
  };
}

export function formatDirectSignDoc(
  fee: Coin[],
  pubkey: string,
  gasLimit: number,
  accountNumber: number,
  sequence: number,
  bodyBytes: string,
  chainId: string
) {
  const authInfoBytes = makeAuthInfoBytes(
    [pubkey as any],
    fee,
    gasLimit,
    sequence
  );
  const signDoc = makeSignDoc(
    fromHex(bodyBytes),
    authInfoBytes,
    chainId,
    accountNumber
  );
  return signDoc;
}

export function stringifyAccountDataValues(account: AccountData) {
  return { ...account, pubkey: toHex(account.pubkey) };
}

export function parseAccountDataValues(account: any) {
  return { ...account, pubkey: fromHex(account.pubkey) };
}

export function deserialiseTransaction(
  seralised: SolanaSignTransaction
): Transaction {
  const tx = new Transaction({
    recentBlockhash: seralised.recentBlockhash,
    feePayer: new PublicKey(bs58.decode(seralised.feePayer)),
  });

  tx.add(
    ...seralised.instructions.map(x => ({
      programId: new PublicKey(bs58.decode(x.programId)),
      data: x.data ? Buffer.from(bs58.decode(x.data)) : Buffer.from([]),
      keys: x.keys.map(y => ({
        ...y,
        pubkey: new PublicKey(bs58.decode(y.pubkey)),
      })),
    }))
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
      data: bs58.encode(Buffer.from([])), //  tx.daa,
    })),
    partialSignatures: tx.signatures.map(sign => ({
      pubkey: sign.publicKey.toBase58(),
      signature: bs58.encode(sign.signature!),
    })),
  };
}
