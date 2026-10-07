import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './style.css';
import { initTheme, onThemeChange, applyTheme } from '../../utils/theme';

void initTheme();
onThemeChange(applyTheme);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
