import base58 from 'bs58';
import Wallet, {
  serialiseTransaction,
  serializeAllTransactions,
  verifyMessageSignature,
  verifyTransactionSignature,
} from '../src';
import {
  TEST_MESSAGE,
  TEST_MESSAGE_SIGNATURE,
  TEST_SOLANA_KEYPAIR_1,
  TEST_TRANSACTION_SIGNATURE,
  TEST_TRANSACTION,
} from './shared';

describe('Wallet', () => {
  let wallet: Wallet;
  beforeAll(async () => {
    wallet = new Wallet(
      Buffer.from(base58.decode(TEST_SOLANA_KEYPAIR_1.privateKey))
    );
  });
  it('getAccounts', async () => {
    const result = await wallet.getAccounts();
    expect(result).toBeTruthy();
    expect(result[0].pubkey).toEqual(TEST_SOLANA_KEYPAIR_1.publicKey);
  });
  it('signAllTransactions', async () => {
    const [account] = await wallet.getAccounts();

    const result = await wallet.signAllTransactions(
      account.pubkey,
      serializeAllTransactions([TEST_TRANSACTION()])
    );

    expect(result).toBeTruthy();
    expect(result.transactions).toHaveLength(1);
    const transaction = result.transactions[0];
    expect(transaction.signatures).toHaveLength(1);
    const signature = transaction.signatures[0].signature;

    expect(
      verifyTransactionSignature(account.pubkey, signature, TEST_TRANSACTION())
    ).toBeTruthy();

    expect(signature).toEqual(TEST_TRANSACTION_SIGNATURE);
  });
  it('signTransaction', async () => {
    const [account] = await wallet.getAccounts();

    const result = await wallet.signTransaction(
      account.pubkey,
      serialiseTransaction(TEST_TRANSACTION())
    );

    expect(result).toBeTruthy();
    expect(result.signatures).toHaveLength(1);
    const signature = result.signatures[0].signature;

    expect(
      verifyTransactionSignature(account.pubkey, signature, TEST_TRANSACTION())
    ).toBeTruthy();

    expect(signature).toEqual(TEST_TRANSACTION_SIGNATURE);
  });
  it('signMessage', async () => {
    const [account] = await wallet.getAccounts();

    const result = await wallet.signMessage(account.pubkey, TEST_MESSAGE);
    expect(
      verifyMessageSignature(account.pubkey, result.signature, TEST_MESSAGE)
    ).toBeTruthy();
    expect(result).toBeTruthy();
    expect(result.signature).toEqual(TEST_MESSAGE_SIGNATURE);
  });
});
