import React from 'react';
import ReactDOM from 'react-dom/client';
import AskDevtoolsPanel from './AskDevtoolsPanel';
import { getStyles } from '../../utils/chatStyles';

// Inject styles globally since we are not in shadow DOM
const style = document.createElement('style');
// Replace :host pseudo-class with body for global styling
style.textContent = getStyles().replace(/:host/g, 'body');
document.head.appendChild(style);

// Add base styles for the full screen standalone tab
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.width = '100vw';
document.body.style.height = '100vh';
document.body.style.overflow = 'hidden';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AskDevtoolsPanel />
  </React.StrictMode>
);
