// Base BRC-20 data from the OPI brc20 API's explorer routes, served next to the core API
// under /brc20_api. Inscription lookups go to the BRC2.0 RPC instead (lib/brc20/rpc.ts).
import type { ApiResource } from '../../types';
import type { AddressTabsCounters } from 'types/api/address';
import type { TokensResponse, TokensSorting } from 'types/api/tokens';

export interface Brc20BtcAddress {
  btc_address: string | null;
}

export interface Brc20Balance {
  external_token_name: string | null;
  external_value: string;
  external_decimals: string | null;
}

export interface Brc20BalancesResponse {
  items: Array<Brc20Balance>;
}

export const GENERAL_API_BRC20_RESOURCES = {
  brc20_btc_address: {
    path: '/brc20_api/v1/brc20/explorer/btc_address/:hash',
    pathParams: [ 'hash' as const ],
  },
  brc20_address_balances: {
    path: '/brc20_api/v1/brc20/explorer/balances/:hash',
    pathParams: [ 'hash' as const ],
  },
  brc20_address_tabs_counters: {
    path: '/brc20_api/v1/brc20/explorer/address_tabs_counters/:hash',
    pathParams: [ 'hash' as const ],
  },
  brc20_tokens: {
    path: '/brc20_api/v1/brc20/explorer/tokens',
    filterFields: [ 'q' as const ],
    paginated: true,
  },
} satisfies Record<string, ApiResource>;

export type GeneralApiBrc20ResourceName = `general:${ keyof typeof GENERAL_API_BRC20_RESOURCES }`;

/* eslint-disable @stylistic/indent */
export type GeneralApiBrc20ResourcePayload<R extends GeneralApiBrc20ResourceName> =
R extends 'general:brc20_btc_address' ? Brc20BtcAddress :
R extends 'general:brc20_address_balances' ? Brc20BalancesResponse :
R extends 'general:brc20_address_tabs_counters' ? AddressTabsCounters :
R extends 'general:brc20_tokens' ? TokensResponse :
never;
/* eslint-enable @stylistic/indent */

/* eslint-disable @stylistic/indent */
export type GeneralApiBrc20PaginationFilters<R extends GeneralApiBrc20ResourceName> =
R extends 'general:brc20_tokens' ? { q?: string } :
never;
/* eslint-enable @stylistic/indent */

/* eslint-disable @stylistic/indent */
export type GeneralApiBrc20PaginationSorting<R extends GeneralApiBrc20ResourceName> =
R extends 'general:brc20_tokens' ? TokensSorting :
never;
/* eslint-enable @stylistic/indent */
