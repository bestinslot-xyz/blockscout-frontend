import type { StackProps } from '@chakra-ui/react';
import { HStack } from '@chakra-ui/react';
import React from 'react';

import type { TokenInfo } from 'types/api/token';

import { getBrc20TokenTypeHint, getBrc20TokenTypeName } from 'lib/brc20/tokens';
import { Tag } from 'toolkit/chakra/tag';
import { Hint } from 'toolkit/components/Hint/Hint';

type Props = Omit<StackProps, 'children'> & {
  token: Pick<TokenInfo, 'address_hash' | 'type' | 'icon_url'>;
  loading?: boolean;
};

const Brc20TokenTypeTag = ({ token, loading, ...rest }: Props) => {
  const hint = getBrc20TokenTypeHint(token);

  return (
    <HStack gap={ 1 } { ...rest }>
      <Tag loading={ loading }>{ getBrc20TokenTypeName(token) }</Tag>
      { hint && <Hint label={ hint } isLoading={ loading } boxSize={ 4 }/> }
    </HStack>
  );
};

export default React.memo(Brc20TokenTypeTag);
