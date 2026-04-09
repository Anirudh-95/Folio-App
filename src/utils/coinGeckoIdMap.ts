const MAP: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  AVAX: 'avalanche-2',
  DOT: 'polkadot',
  MATIC: 'matic-network',
  POL: 'matic-network',
  LINK: 'chainlink',
  UNI: 'uniswap',
  LTC: 'litecoin',
  ATOM: 'cosmos',
  NEAR: 'near',
  APT: 'aptos',
  ARB: 'arbitrum',
  OP: 'optimism',
  SHIB: 'shiba-inu',
  PEPE: 'pepe',
  TON: 'the-open-network',
  SUI: 'sui',
  INJ: 'injective-protocol',
  TIA: 'celestia',
  SEI: 'sei-network',
  FIL: 'filecoin',
  ALGO: 'algorand',
  VET: 'vechain',
  ICP: 'internet-computer',
  HBAR: 'hedera-hashgraph',
  AAVE: 'aave',
  MKR: 'maker',
  SNX: 'synthetix-network-token',
  CRV: 'curve-dao-token',
  LDO: 'lido-dao',
  RUNE: 'thorchain',
  STX: 'blockstack',
  MANA: 'decentraland',
  SAND: 'the-sandbox',
  AXS: 'axie-infinity',
  FTM: 'fantom',
  EGLD: 'elrond-erd-2',
  THETA: 'theta-token',
  FLR: 'flare-networks',
  KAVA: 'kava',
  FLOW: 'flow',
  EOS: 'eos',
  XLM: 'stellar',
  TRX: 'tron',
  XMR: 'monero',
  ZEC: 'zcash',
  DASH: 'dash',
};

export function getCoinGeckoId(ticker: string): string | null {
  return MAP[ticker.toUpperCase()] ?? null;
}

export function getCoinGeckoIds(tickers: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const t of tickers) {
    const id = getCoinGeckoId(t);
    if (id) result[t.toUpperCase()] = id;
  }
  return result;
}
