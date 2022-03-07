import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

export const TEST_SOLANA_KEYPAIR_1 = {
  publicKey: '4aihuFhJy8FXz5VTYL6dczkGeKU8Tc9iQyYGDRXUbJEZ',
  privateKey:
    '366cd8d38f760f970bdc70b18d19f40756b92beeebc84074ceea8e092d406666',
};

export const TEST_SOLANA_KEYPAIR_2 = {
  publicKey: '4aihuFhJy8FXz5VTYL6dczkGeKU8Tc9iQyYGDRXUbJEZ',
  privateKey:
    '366cd8d38f760f970bdc70b18d19f40756b92beeebc84074ceea8e092d406660',
};

export const TEST_SOLANA_SIGNATURE =
  'RRzQeBvHEBfULMUVch9UP51KcZnHBwLW7GPKafymgzNeFFfgJikmFdWBDC6oBVG2dkyetWC3jYK9tZFA78q14Q7';

export const TEST_RECENT_BLOCK_HASH =
  'F1bSUud8754dv3D4wB8LQb2m2snxiuPnLdNFCWfDPZDJ';

export const TEST_SOLANA_TRANSACTION = new Transaction({
  recentBlockhash: TEST_RECENT_BLOCK_HASH,
  feePayer: new PublicKey(TEST_SOLANA_KEYPAIR_1.publicKey),
}).add(
  SystemProgram.transfer({
    fromPubkey: new PublicKey(TEST_SOLANA_KEYPAIR_1.publicKey),
    toPubkey: new PublicKey(TEST_SOLANA_KEYPAIR_2.publicKey),
    lamports: 123,
  })
);

export const TEST_SOLANA_SIGN_TRANSACTION = '';
