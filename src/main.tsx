import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { useStore } from './store/useStore';
import { readHashConfig } from './store/share';

// A shared link (URL hash) wins over locally persisted state.
const hashConfig = readHashConfig();
if (hashConfig) useStore.getState().loadConfig(hashConfig);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
