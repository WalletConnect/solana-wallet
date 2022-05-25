import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import base58 from 'bs58';

export const TEST_SOLANA_KEYPAIR_1 = {
  publicKey: 'A4aVtbwfHDX2RsGyoLMe7jQqeTuFmMhGTqHYNUZ9cpB5',
  privateKey:
    'G282j1ejo5LbL4DqBR4G5i9EQZk1FPZa2ZR4VE9x6JaHqfie3nrrgcGL6UXLfXrappiPnWSWK5F1kz3Xduoy57H',
};

export const TEST_SOLANA_KEYPAIR_2 = {
  publicKey: '3e5AWWJLP74qxdNedTpb6BMwKpxt7Te342fKGb7riQo2',
  privateKey:
    '4YqhFf2e2qzuvPHVoEbSnjrGZmzRUBdmiFoSZj4SbsvcpigWrXBc94c5JCzVuKnV5fGTQwGGyZL93XkB4gdVTYun',
};

export const TEST_TRANSACTION_SIGNATURE =
  'mQmf4iipWAAadWpbQSxV6Qsn92JcTsWZ4XPSPZpnjoHMpjyFNxoj8P168tL1aa799mN5D6CasbGZgFzX1tg51YC';

export const TEST_RECENT_BLOCK_HASH =
  'F1bSUud8754dv3D4wB8LQb2m2snxiuPnLdNFCWfDPZDJ';

// This needs to be a factory method because Transaction.compile() mutates the signature array
export const TEST_TRANSACTION = () =>
  new Transaction({
    recentBlockhash: TEST_RECENT_BLOCK_HASH,
    feePayer: new PublicKey(TEST_SOLANA_KEYPAIR_1.publicKey),
  }).add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(TEST_SOLANA_KEYPAIR_1.publicKey),
      toPubkey: new PublicKey(TEST_SOLANA_KEYPAIR_2.publicKey),
      lamports: 123,
    })
  );

export const TEST_MESSAGE = base58.encode(Buffer.from('hello world'));
export const TEST_MESSAGE_SIGNATURE =
  '2gK63KVgpUMjT612P2iyL1TCZx5zmwbXjNMQ9PqkVrLsUpNuPWUhJhGLp4puzXu87AoNtMASkzziUJmkKCv3wESR';
