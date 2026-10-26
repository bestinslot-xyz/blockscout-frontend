import React from 'react';

import type { AddressTabsCounters } from 'types/api/address';

import useApiQuery from 'lib/api/useApiQuery';
import { useBrc20ContractInscriptionId } from 'lib/brc20/rpc';
import { ADDRESS_TABS_COUNTERS } from 'stubs/address';

interface Params {
  hash: string;
  isEnabled?: boolean;
}

// Bitcoin identity of an EVM address: the BTC address of an EOA, or the deploy inscription id of a contract.
export function useBrc20AddressIdentity({ hash, isEnabled = true }: Params) {
  const btcAddressQuery = useApiQuery('general:brc20_btc_address', {
    pathParams: { hash },
    queryOptions: {
      enabled: isEnabled && Boolean(hash),
      placeholderData: { btc_address: null },
      refetchOnMount: false,
    },
  });

  const inscriptionIdQuery = useBrc20ContractInscriptionId({ hash, isEnabled });

  return {
    btcIdentity: btcAddressQuery.data?.btc_address ?? inscriptionIdQuery.data ?? undefined,
    isPlaceholderData: btcAddressQuery.isPlaceholderData || inscriptionIdQuery.isPlaceholderData,
  };
}

function sumCounter(core: number | null | undefined, brc20: number | null | undefined) {
  return typeof core === 'number' && typeof brc20 === 'number' ? core + brc20 : core;
}

// Adds base BRC-20 balances and transfers to the core API tab counters.
export function useBrc20AddressTabsCounters({ hash, isEnabled = true }: Params, coreCounters: AddressTabsCounters | undefined) {
  const query = useApiQuery('general:brc20_address_tabs_counters', {
    pathParams: { hash },
    queryOptions: {
      enabled: isEnabled && Boolean(hash),
      placeholderData: ADDRESS_TABS_COUNTERS,
    },
  });

  const data = React.useMemo(() => {
    if (!coreCounters) {
      return coreCounters;
    }
    return {
      ...coreCounters,
      token_balances_count: sumCounter(coreCounters.token_balances_count, query.data?.token_balances_count),
      token_transfers_count: sumCounter(coreCounters.token_transfers_count, query.data?.token_transfers_count),
    };
  }, [ coreCounters, query.data ]);

  return { data, isPlaceholderData: query.isPlaceholderData };
}
