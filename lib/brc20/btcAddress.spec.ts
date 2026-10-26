// cspell:disable
import { expect, test } from 'vitest';

import { btcAddressToEvmAddress, isBtcAddress, isInscriptionId, toBrc20SearchTerm } from './btcAddress';

// pairs taken from the signet BRC2.0 API (/btc_api/v2/btc_address/:evm_address)
const PAIRS = [
  [ 'tb1qvhl8k0xu0stk956tjqx6q5ujp6tdyh24xcz0qq', '0x428b43990286B260ABA25573aBbF7CA7770b0a3A' ],
  [ 'tb1pk2j9dx4ypmsf2c9shhufsv5lchv6zah6yja29xxyhfglyyzmr3zswp922x', '0x2119cDe50108DdD8f5f9fc2c2E8D49c48a25fe9e' ],
  [ 'tb1pptsr3s5n0msdtahd2a97enstpwuk8g23qztfpz2wwc7d7efx39zs9aaugd', '0x0164d338d5a96c8d38927db1030E87F97Acb0A16' ],
];

test.each(PAIRS)('maps %s to its EVM address', (btcAddress, evmAddress) => {
  expect(isBtcAddress(btcAddress)).toBe(true);
  expect(btcAddressToEvmAddress(btcAddress)).toBe(evmAddress.toLowerCase());
});

test('accepts upper-case bech32 addresses', () => {
  expect(btcAddressToEvmAddress(PAIRS[0][0].toUpperCase())).toBe(PAIRS[0][1].toLowerCase());
});

test('accepts base58 addresses', () => {
  expect(isBtcAddress('mipcBbFg9gMiCh81Kj8tqqdgoZub1ZJRfn')).toBe(true);
  expect(isBtcAddress('2MzQwSSnBHWHqSAqtTVQ6v47XtaisrJa1Vc')).toBe(true);
  expect(isBtcAddress('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toBe(true);
});

test('rejects anything that is not a Bitcoin address', () => {
  expect(isBtcAddress('0x428b43990286B260ABA25573aBbF7CA7770b0a3A')).toBe(false);
  expect(isBtcAddress('tb1qvhl8k0xu0stk956tjqx6q5ujp6tdyh24xcz0qr')).toBe(false);
  expect(isBtcAddress('ordi')).toBe(false);
  expect(btcAddressToEvmAddress('ordi')).toBe('ordi');
});

test('converts only Bitcoin addresses into search terms', () => {
  expect(toBrc20SearchTerm(PAIRS[0][0])).toBe(PAIRS[0][1].toLowerCase());
  expect(toBrc20SearchTerm('ordi')).toBe('ordi');
});

test('recognizes inscription ids', () => {
  expect(isInscriptionId('07d8b2a0b9d4de85450745bf6d16087e52e46ea68b18c48d13ce1e0e26633439i0')).toBe(true);
  expect(isInscriptionId('07d8b2a0b9d4de85450745bf6d16087e52e46ea68b18c48d13ce1e0e26633439')).toBe(false);
  expect(isInscriptionId('0x64539e925e9b8b227d1df2bb86e796617c1f427b9034d4d9c13af48daee40489')).toBe(false);
});
