import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PortfolioProvider } from './context/PortfolioContext';
import { App } from './App';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

createRoot(rootEl).render(
  <StrictMode>
    <PortfolioProvider>
      <App />
    </PortfolioProvider>
  </StrictMode>
);
