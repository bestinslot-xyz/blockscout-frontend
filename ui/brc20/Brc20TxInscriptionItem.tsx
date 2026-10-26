import { Flex } from '@chakra-ui/react';
import React from 'react';

import { useBrc20TxInscriptionId } from 'lib/brc20/rpc';
import { Skeleton } from 'toolkit/chakra/skeleton';
import CopyToClipboard from 'ui/shared/CopyToClipboard';
import * as DetailedInfo from 'ui/shared/DetailedInfo/DetailedInfo';
import HashStringShortenDynamic from 'ui/shared/HashStringShortenDynamic';

interface Props {
  hash: string;
  isLoading?: boolean;
}

// Every BRC2.0 transaction is triggered by a Bitcoin inscription.
const Brc20TxInscriptionItem = ({ hash, isLoading }: Props) => {
  const query = useBrc20TxInscriptionId({ hash, isEnabled: !isLoading });

  const inscriptionId = query.data;

  if (!inscriptionId) {
    return null;
  }

  return (
    <>
      <DetailedInfo.ItemLabel hint="Bitcoin inscription that triggered the transaction">
        Inscription ID
      </DetailedInfo.ItemLabel>
      <DetailedInfo.ItemValue>
        <Flex flexWrap="nowrap" alignItems="center" overflow="hidden">
          <Skeleton loading={ isLoading } overflow="hidden">
            <HashStringShortenDynamic hash={ inscriptionId }/>
          </Skeleton>
          <CopyToClipboard text={ inscriptionId }/>
        </Flex>
      </DetailedInfo.ItemValue>
    </>
  );
};

export default React.memo(Brc20TxInscriptionItem);
