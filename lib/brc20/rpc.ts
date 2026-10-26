// Inscription lookups served by brc20-prog's JSON-RPC on the network RPC URL.
// cspell:ignore inscr
import { useQuery } from '@tanstack/react-query';

import type { SearchResultItem } from 'types/api/search';

import config from 'configs/app';
import type { ResourceError } from 'lib/api/resources';

// Read on use, so importing this module does not touch the app config.
function getRpcUrl(): string | undefined {
  return config.chain.rpcUrls[0];
}

interface RpcResponse<T> {
  result?: T | null;
  error?: { message: string };
}

interface Brc20TxReceipt {
  transactionHash: string | null;
  contractAddress: string | null;
  blockNumber: string;
}

interface Brc20Block {
  timestamp: string;
}

async function call<T>(method: string, params: Array<unknown>): Promise<T | null> {
  const rpcUrl = getRpcUrl();
  if (!rpcUrl) {
    throw new Error(`${ method }: no network RPC URL configured`);
  }
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  if (!response.ok) {
    throw new Error(`${ method }: HTTP ${ response.status }`);
  }

  const payload = await response.json() as RpcResponse<T>;
  if (payload.error) {
    throw new Error(`${ method }: ${ payload.error.message }`);
  }
  return payload.result ?? null;
}

interface Params {
  hash: string;
  isEnabled?: boolean;
}

// The inscription that triggered a BRC2.0 transaction.
export function useBrc20TxInscriptionId({ hash, isEnabled = true }: Params) {
  return useQuery({
    queryKey: [ 'brc20_rpc:tx_inscription_id', hash ],
    queryFn: () => call<string>('brc20_getInscriptionIdByTxHash', [ hash ]),
    enabled: isEnabled && Boolean(getRpcUrl()) && Boolean(hash),
    refetchOnMount: false,
  });
}

// The deploy inscription of a contract, confirmed by its receipt having created this address.
export function useBrc20ContractInscriptionId({ hash, isEnabled = true }: Params) {
  return useQuery({
    queryKey: [ 'brc20_rpc:contract_inscription_id', hash ],
    queryFn: async() => {
      const inscriptionId = await call<string>('brc20_getInscriptionIdByContractAddress', [ hash ]);
      if (!inscriptionId) {
        return null;
      }
      const receipt = await call<Brc20TxReceipt>('brc20_getTxReceiptByInscriptionId', [ inscriptionId ]);
      return receipt?.contractAddress?.toLowerCase() === hash.toLowerCase() ? inscriptionId : null;
    },
    enabled: isEnabled && Boolean(getRpcUrl()) && Boolean(hash),
    placeholderData: null,
    refetchOnMount: false,
  });
}

// Search results for an inscription id: the transaction it triggered and the contract it deployed.
export function useBrc20InscriptionSearch({ inscriptionId, isEnabled = true }: { inscriptionId: string; isEnabled?: boolean }) {
  return useQuery<Array<SearchResultItem>, ResourceError<unknown>>({
    queryKey: [ 'brc20_rpc:inscription_search', inscriptionId ],
    queryFn: async() => {
      const receipt = await call<Brc20TxReceipt>('brc20_getTxReceiptByInscriptionId', [ inscriptionId ]);
      const items: Array<SearchResultItem> = [];
      if (receipt?.transactionHash) {
        const block = await call<Brc20Block>('eth_getBlockByNumber', [ receipt.blockNumber, false ]);
        items.push({
          type: 'transaction',
          transaction_hash: receipt.transactionHash,
          timestamp: block ? new Date(Number(block.timestamp) * 1000).toISOString() : '',
        });
      }
      if (receipt?.contractAddress) {
        items.push({
          type: 'contract',
          name: null,
          address_hash: receipt.contractAddress,
          is_smart_contract_address: true,
          is_smart_contract_verified: false,
        });
      }
      return items;
    },
    enabled: isEnabled && Boolean(getRpcUrl()) && Boolean(inscriptionId),
  });
}
