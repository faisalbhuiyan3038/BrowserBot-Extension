import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import AskPagePanel from '../ask-page.content/AskPagePanel';
import { getStyles } from '../../utils/chatStyles';
import { initTheme, onThemeChange, applyTheme } from '../../utils/theme';

// Initialize and sync theme
void initTheme();
onThemeChange(applyTheme);

// Inject styles globally
const style = document.createElement('style');
style.textContent = getStyles();
document.head.appendChild(style);

const wrapper = document.getElementById('root');
if (wrapper) {
  // Add base styles for the full screen standalone tab
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.width = '100vw';
  document.body.style.height = '100vh';
  document.body.style.overflow = 'hidden';
  document.body.style.background = 'var(--pbg)';

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
