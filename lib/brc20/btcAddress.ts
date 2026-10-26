// BRC2.0 maps a Bitcoin address to an EVM address: the last 20 bytes of keccak256(scriptPubKey).
// Mainnet, testnet/signet and regtest addresses are all accepted, since the scriptPubKey does not depend on the network.
// cspell:ignore segwit bcrt hrps
import { base58check, bech32, bech32m } from '@scure/base';
import { keccak256, sha256 } from 'viem';

const SEGWIT_HRPS = [ 'bc', 'tb', 'bcrt' ];
const P2PKH_VERSIONS = [ 0x00, 0x6f ];
const P2SH_VERSIONS = [ 0x05, 0xc4 ];
const INSCRIPTION_ID_REGEXP = /^[\da-f]{64}i\d+$/i;

const base58 = base58check((data: Uint8Array) => sha256(data, 'bytes'));

function segwitScript(address: string): Uint8Array | undefined {
  const lower = address.toLowerCase();
  const hrp = lower.slice(0, lower.lastIndexOf('1'));
  if (!SEGWIT_HRPS.includes(hrp)) {
    return;
  }

  for (const codec of [ bech32, bech32m ]) {
    try {
      const { words } = codec.decode(lower as `${ string }1${ string }`);
      const version = words[0];
      const program = codec.fromWords(words.slice(1));
      const isValid = version === 0 ?
        codec === bech32 && (program.length === 20 || program.length === 32) :
        codec === bech32m && version <= 16 && program.length >= 2 && program.length <= 40;
      if (isValid) {
        return Uint8Array.from([ version === 0 ? 0 : 0x50 + version, program.length, ...program ]);
      }
    } catch (error) {}
  }
}

function base58Script(address: string): Uint8Array | undefined {
  try {
    const payload = base58.decode(address);
    if (payload.length !== 21) {
      return;
    }
    const [ version, ...hash ] = payload;
    if (P2PKH_VERSIONS.includes(version)) {
      return Uint8Array.from([ 0x76, 0xa9, 20, ...hash, 0x88, 0xac ]);
    }
    if (P2SH_VERSIONS.includes(version)) {
      return Uint8Array.from([ 0xa9, 20, ...hash, 0x87 ]);
    }
  } catch (error) {}
}

function toScript(address: string) {
  return segwitScript(address) ?? base58Script(address);
}

export function isBtcAddress(address: string) {
  return Boolean(toScript(address.trim()));
}

export function btcAddressToEvmAddress(address: string) {
  const script = toScript(address.trim());
  return script ? `0x${ keccak256(script).slice(-40) }` : address;
}

export function isInscriptionId(value: string) {
  return INSCRIPTION_ID_REGEXP.test(value.trim());
}

// Search finds BRC2.0 accounts by their EVM address, so a Bitcoin address is converted first.
export function toBrc20SearchTerm(value: string) {
  return isBtcAddress(value) ? btcAddressToEvmAddress(value) : value;
}
