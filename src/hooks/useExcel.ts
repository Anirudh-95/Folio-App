import { useCallback } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { parseWorkbook } from '../utils/excelParser';
import { downloadWorkbook } from '../utils/excelWriter';

export function useExcel() {
  const { state, dispatch } = usePortfolio();

  const loadFile = useCallback(
    async (file: File): Promise<string[]> => {
      const buffer = await file.arrayBuffer();
      const { holdings, transactions, warnings, cash } = parseWorkbook(buffer);
      dispatch({
        type: 'LOAD_FILE',
        payload: { holdings, transactions, fileName: file.name, cash },
      });
      return warnings;
    },
    [dispatch]
  );

  const saveFile = useCallback(() => {
    downloadWorkbook(
      state.holdings,
      state.transactions,
      state.fileName ?? 'folio_portfolio.xlsx',
      state.cash
    );
  }, [state.holdings, state.transactions, state.fileName, state.cash]);

  return { loadFile, saveFile };
}
