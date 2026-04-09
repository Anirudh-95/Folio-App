import { useEffect, useRef } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { fetchStockPrices, fetchCryptoPrices } from '../utils/priceApi';

export function usePrices() {
  const { state, dispatch } = usePortfolio();
  const { holdings } = state;

  // Stable dep string — only re-fetch when the ticker set changes
  const tickerKey = holdings.map((h) => h.ticker).sort().join(',');
  const prevKey = useRef('');

  useEffect(() => {
    if (!holdings.length || tickerKey === prevKey.current) return;
    prevKey.current = tickerKey;

    const stockTickers = holdings.filter((h) => h.asset_type === 'stock').map((h) => h.ticker);
    const cryptoTickers = holdings.filter((h) => h.asset_type === 'crypto').map((h) => h.ticker);

    dispatch({ type: 'SET_PRICES_LOADING', payload: true });
    dispatch({ type: 'SET_PRICES_ERROR', payload: null });

    Promise.allSettled([
      fetchStockPrices(stockTickers),
      fetchCryptoPrices(cryptoTickers),
    ]).then(([stocksRes, cryptoRes]) => {
      const prices: Record<string, number> = {};
      const prevPrices: Record<string, number> = {};

      if (stocksRes.status === 'fulfilled') {
        Object.assign(prices, stocksRes.value.prices);
        Object.assign(prevPrices, stocksRes.value.prevPrices);
      }
      if (cryptoRes.status === 'fulfilled') {
        Object.assign(prices, cryptoRes.value.prices);
        Object.assign(prevPrices, cryptoRes.value.prevPrices);
      }

      if (Object.keys(prices).length > 0) {
        dispatch({ type: 'SET_PRICES', payload: { prices, prevPrices } });
      }

      const anyFailed =
        stocksRes.status === 'rejected' || cryptoRes.status === 'rejected';
      if (anyFailed) {
        dispatch({ type: 'SET_PRICES_ERROR', payload: 'Some prices could not be fetched — showing last known values.' });
      }
    }).finally(() => {
      dispatch({ type: 'SET_PRICES_LOADING', payload: false });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickerKey]);
}
