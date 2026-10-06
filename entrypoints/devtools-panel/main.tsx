import React from 'react';
import ReactDOM from 'react-dom/client';
import AskDevtoolsPanel from './AskDevtoolsPanel';
import { getStyles, ensurePanelFonts, getRoughFilterSVG } from '../../utils/chatStyles';

// Register fonts
void ensurePanelFonts();

// Inject styles globally since we are not in shadow DOM
const style = document.createElement('style');
style.textContent = getStyles().replace(/:host/g, ':root, body');
document.head.appendChild(style);

// Inject rough filter SVG if not already present
if (!document.getElementById('rough')) {
  const filterContainer = document.createElement('div');
  filterContainer.innerHTML = getRoughFilterSVG();
  document.body.appendChild(filterContainer);
}

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
