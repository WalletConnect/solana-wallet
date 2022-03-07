import Wallet, { serialiseTransaction } from '../src';
import {
  TEST_SOLANA_KEYPAIR_1,
  TEST_SOLANA_SIGNATURE,
  TEST_SOLANA_TRANSACTION,
} from './shared/';

describe('Wallet', () => {
  let wallet: Wallet;
  beforeAll(async () => {
    wallet = new Wallet(TEST_SOLANA_KEYPAIR_1.privateKey);
  });
  it('getAccounts', async () => {
    const result = await wallet.getAccounts();
    expect(result).toBeTruthy();
    expect(result[0].pubkey).toEqual(TEST_SOLANA_KEYPAIR_1.publicKey);
  });
  it('signTransaction', async () => {
    const [account] = await wallet.getAccounts();

    const result = await wallet.signTransaction(
      account.pubkey,
      serialiseTransaction(TEST_SOLANA_TRANSACTION)
    );

    expect(result).toBeTruthy();
    expect(result.signature).toEqual(TEST_SOLANA_SIGNATURE);
  });
});
