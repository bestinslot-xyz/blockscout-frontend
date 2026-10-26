import React from 'react';

import * as DetailedInfo from 'ui/shared/DetailedInfo/DetailedInfo';
import AddressEntity from 'ui/shared/entities/address/AddressEntity';

import { useBrc20AddressIdentity } from './useBrc20Address';

interface Props {
  addressHash: string;
}

// The page title shows the Bitcoin identity of the address, so the details list the EVM address it maps to.
const Brc20AddressEvmItem = ({ addressHash }: Props) => {
  const { btcIdentity, isPlaceholderData } = useBrc20AddressIdentity({ hash: addressHash });

  if (!btcIdentity || isPlaceholderData) {
    return null;
  }

  return (
    <>
      <DetailedInfo.ItemLabel hint="EVM address that this Bitcoin address or inscription maps to in BRC2.0">
        EVM address
      </DetailedInfo.ItemLabel>
      <DetailedInfo.ItemValue flexWrap="nowrap">
        <AddressEntity
          address={{ hash: addressHash }}
          noIcon
          noLink
          noAltHash
        />
      </DetailedInfo.ItemValue>
    </>
  );
};

export default React.memo(Brc20AddressEvmItem);
