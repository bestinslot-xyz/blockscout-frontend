// BRC2.0 has three kinds of fungible tokens:
// - base BRC-20 tokens live on Bitcoin and come from the BRC2.0 API without a contract address;
//   the UI gives them a `brc20:<ticker>` pseudo-address so list keys stay unique;
// - wrapped BRC-20 tokens are ERC-20 contracts minted by the BRC2.0 controller (the core API returns a non-null icon_url for them);
// - pBRC-20 tokens are ordinary ERC-20 contracts that exist only inside the programmable module.
import type { TokenInfo } from 'types/api/token';
import type { TokensResponse } from 'types/api/tokens';
import type { TokenTransfer } from 'types/api/tokenTransfer';

import { getTokenTypeName } from 'lib/token/tokenTypes';

type TokenKindFields = Pick<TokenInfo, 'address_hash' | 'type' | 'icon_url'>;

// the BRC2.0 API still uses the field names of the older core API
type LegacyTokenFields = { address?: string; holders?: string | null };

const BASE_TOKEN_PREFIX = 'brc20:';

export function isBrc20BaseToken(token: Pick<TokenInfo, 'address_hash'>) {
  return token.address_hash.startsWith(BASE_TOKEN_PREFIX);
}

function isWrappedBrc20Token(token: TokenKindFields) {
  return token.type === 'ERC-20' && token.icon_url !== null && !isBrc20BaseToken(token);
}

export function getBrc20TokenTypeName(token: TokenKindFields, chainConfig?: Parameters<typeof getTokenTypeName>[1]) {
  if (isBrc20BaseToken(token)) {
    return 'BRC-20';
  }
  if (isWrappedBrc20Token(token)) {
    return 'Wrapped BRC-20';
  }
  return getTokenTypeName(token.type, chainConfig);
}

export function getBrc20TokenTypeHint(token: TokenKindFields) {
  if (isBrc20BaseToken(token)) {
    return 'Base BRC-20 tokens: ticker names are unique identifiers.';
  }
  if (isWrappedBrc20Token(token)) {
    return 'Wrapped BRC-20 tokens: ticker names are unique identifiers. They represent base BRC-20 tokens inside the programmable module.';
  }
  if (token.type === 'ERC-20') {
    return 'pBRC-20 tokens: exist only within the programmable module. Contract addresses are unique, ticker names are not.';
  }
}

export function getBrc20TransferTypeText(type: TokenTransfer['type'], token: TokenKindFields | null) {
  if (!token || !isWrappedBrc20Token(token)) {
    return;
  }
  switch (type) {
    case 'token_minting':
      return 'Depositing';
    case 'token_burning':
      return 'Withdrawing';
  }
}

// The ticker is the token's only identifier, so it goes into the name and the symbol stays empty.
export function normalizeBrc20Token(token: TokenInfo & LegacyTokenFields): TokenInfo {
  const address = token.address_hash || token.address;
  return {
    ...token,
    address_hash: address || `${ BASE_TOKEN_PREFIX }${ token.name }`,
    symbol: address ? token.symbol : null,
    holders_count: token.holders_count ?? token.holders ?? null,
    reputation: token.reputation ?? null,
  };
}

export function normalizeBrc20TokensResponse(response: TokensResponse): TokensResponse {
  return { ...response, items: response.items.map(normalizeBrc20Token) };
}

export function brc20BalanceToTokenInfo(name: string | null, decimals: string | null): TokenInfo {
  return {
    address_hash: `${ BASE_TOKEN_PREFIX }${ name }`,
    type: 'ERC-20',
    symbol: null,
    name,
    decimals,
    holders_count: null,
    exchange_rate: null,
    total_supply: null,
    icon_url: null,
    circulating_market_cap: null,
    reputation: null,
  };
}
