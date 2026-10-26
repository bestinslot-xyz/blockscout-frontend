import React from 'react';

import type { AddressTokenBalance } from 'types/api/address';

import useApiQuery from 'lib/api/useApiQuery';
import { brc20BalanceToTokenInfo } from 'lib/brc20/tokens';

interface Params {
  hash: string;
  items: Array<AddressTokenBalance> | undefined;
  isLastPage: boolean;
  isEnabled: boolean;
}

// Appends the base BRC-20 balances of the address after the last page of its ERC-20 balances.
export default function useBrc20TokenBalances({ hash, items, isLastPage, isEnabled }: Params) {
  const query = useApiQuery('general:brc20_address_balances', {
    pathParams: { hash },
    queryOptions: {
      enabled: isEnabled && Boolean(hash),
      refetchOnMount: false,
    },
  });

  return React.useMemo(() => {
    if (!items || !isLastPage || !query.data?.items.length) {
      return items;
    }

    const brc20Items: Array<AddressTokenBalance> = query.data.items.map((item) => ({
      token: brc20BalanceToTokenInfo(item.external_token_name, item.external_decimals),
      value: item.external_value,
      token_id: null,
      token_instance: null,
    }));

    return [ ...items, ...brc20Items ];
  }, [ items, isLastPage, query.data ]);
}
