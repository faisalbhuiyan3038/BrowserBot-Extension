import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import AskPagePanel from '../ask-page.content/AskPagePanel';
import { getStyles } from '../../utils/chatStyles';

// Inject styles globally since we are not in shadow DOM
const style = document.createElement('style');
// Replace :host pseudo-class with body for global styling
style.textContent = getStyles().replace(/:host/g, 'body');
document.head.appendChild(style);

const wrapper = document.getElementById('root');
if (wrapper) {
  // Add base styles for the full screen standalone tab
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.width = '100vw';
  document.body.style.height = '100vh';
  document.body.style.overflow = 'hidden';
  document.body.style.background = '#13141a';

  const panelRoot = createRoot(wrapper);
  panelRoot.render(
    createElement(AskPagePanel, {
      pageTitle: document.title,
      pageUrl: location.href,
      onClose: () => { window.close() },
      isFullScreen: true
    })
  );
}
