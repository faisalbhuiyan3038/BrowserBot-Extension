// ─── BrowserBot 2.0 Handcrafted Sketchbook Design System ──────────────────────────

export function getFontFaces(): string {
  try {
    const caveatUrl = browser.runtime.getURL('/fonts/Caveat/Caveat-VariableFont_wght.ttf');
    const nunitoUrl = browser.runtime.getURL('/fonts/Nunito/Nunito-VariableFont_wght.ttf');
    const nunitoItalicUrl = browser.runtime.getURL('/fonts/Nunito/Nunito-Italic-VariableFont_wght.ttf');
    return `
      @font-face {
        font-family: 'Caveat';
        src: url('${caveatUrl}') format('truetype');
        font-weight: 100 900;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Nunito';
        src: url('${nunitoUrl}') format('truetype');
        font-weight: 100 900;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Nunito';
        src: url('${nunitoItalicUrl}') format('truetype');
        font-weight: 100 900;
        font-style: italic;
        font-display: swap;
      }
    `;
  } catch (_) {
    return '';
  }
}

export function getRoughFilterSVG(): string {
  return `<svg style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;" aria-hidden="true">
    <defs>
      <filter id="rough" x="-3%" y="-6%" width="106%" height="112%">
        <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2"/>
      </filter>
    </defs>
  </svg>`;
}

export function getBrandLogoSVG(className = "logo"): string {
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="none">
    <rect width="24" height="24" rx="7" fill="currentColor"/>
    <path d="M6.5 9.5A2.5 2.5 0 0 1 9 7h6a2.5 2.5 0 0 1 2.5 2.5v3A2.5 2.5 0 0 1 15 15h-3l-3 2.5V15a2.5 2.5 0 0 1-2.5-2.5z" fill="#fff"/>
    <circle cx="10" cy="11" r="1.1" fill="currentColor"/>
    <circle cx="14" cy="11" r="1.1" fill="currentColor"/>
  </svg>`;
}

export function getStyles(): string {
  const fonts = getFontFaces();

  return `
${fonts}

* { box-sizing: border-box; margin: 0; padding: 0; }

:host, :root {
  /* Default: Light Warm Paper Theme */
  --hb: #fff;
  --hfg: #1c1c20;
  --hm: #62626b;
  --hcode: #f5f5f7;
  --hbd: #e2e2e6;
  --hl: #fff1a8;
  --hlb: #e8b800;
  --er: #c8372d;
  --rx: 999px;

  --pbg: #fffbf0;
  --blur: none;
  --fg: #2a2622;
  --mute: #645c52;
  --bd: #2a2622;
  --sub: #fff3d6;
  --ac: #e0482c;
  --acfg: #fff;
  --acs: #ffe3d8;
  --act: #b02f17;
  --ub: #ffd45e;
  --ubf: #2a2622;
  --ab: #fffbf0;
  --abd: #2a2622;
  --code: #f4ead2;
  --cb: #fffbf0;
  --r: 22px;
  --rb: 16px;
  --rc: 14px;
  --rs: 12px;
  --sh: 6px 6px 0 #2a2622;
  --sh-sm: 2px 2px 0 #2a2622;
  --font: 'Nunito', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  --hfont: 'Caveat', cursive, sans-serif;
  --ln: rgba(70, 110, 190, 0.17);

  all: initial;
  font-family: var(--font);
  color: var(--fg);
}

[data-theme="dark"], :host([data-theme="dark"]) {
  --hb: #18181b;
  --hfg: #e6e6ea;
  --hm: #9d9da6;
  --hcode: #222226;
  --hbd: #34343a;
  --hl: #5a4a00;
  --er: #ff7a70;

  --pbg: #2a2723;
  --fg: #f4eee3;
  --mute: #bdb4a5;
  --bd: #d8cfbf;
  --sub: #37332d;
  --ac: #ff7f61;
  --acfg: #2a1208;
  --acs: #4a2c22;
  --act: #ffa68f;
  --ub: #e6b93c;
  --ubf: #241c05;
  --ab: #2a2723;
  --abd: #d8cfbf;
  --code: #37332d;
  --cb: #2a2723;
  --sh: 6px 6px 0 #0008;
  --sh-sm: 2px 2px 0 #0008;
  --ln: rgba(200, 220, 255, 0.07);
}

::selection {
  background: var(--hlb);
  color: #2a2622;
}

:focus-visible {
  outline: 2px dashed var(--ac);
  outline-offset: 2px;
}

#browserbot-ask-page-root {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2147483646;
  font-family: var(--font);
  -webkit-font-smoothing: antialiased;
}

/* ─── Panel Container ──────────────────────────────── */

.askpage-panel {
  position: fixed;
  top: 16px;
  right: 16px;
  bottom: 16px;
  max-height: calc(100vh - 32px);
  display: flex;
  flex-direction: column;
  background: var(--pbg);
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 .4 0 0 0 0 .3 0 0 0 0 .2 0 0 0 .07 0'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>");
  color: var(--fg);
  border: 2px solid var(--bd);
  border-radius: 22px 28px 18px 26px / 26px 18px 28px 20px;
  box-shadow: var(--sh);
  font: 14px/1.55 var(--font);
  animation: rise 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  overflow: hidden;
  transition: background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s;
  z-index: 2147483646;
}

.askpage-panel.fullscreen {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  max-height: 100vh;
  border-radius: 0;
  border: none;
  box-shadow: none;
}

.askpage-panel.minimized {
  animation: slideOutPanel 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes rise {
  from { opacity: 0; transform: translateY(14px) rotate(0.6deg); }
  to   { opacity: 1; transform: translateY(0) rotate(0deg); }
}

@keyframes slideOutPanel {
  from { transform: translateX(0); opacity: 1; }
  to   { transform: translateX(100%); opacity: 0; }
}

/* ─── Resize Handle ────────────────────────────────── */

.askpage-resize-handle {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  background: transparent;
  z-index: 10;
  transition: background 0.15s;
}

.askpage-resize-handle:hover,
.askpage-resize-handle.dragging {
  background: var(--ac);
  opacity: 0.6;
}

/* ─── Header ───────────────────────────────────────── */

.askpage-header {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1.5px solid var(--bd);
  background: var(--pbg);
  flex-shrink: 0;
}

.askpage-header::before {
  content: "";
  position: absolute;
  top: 4px;
  left: 50%;
  width: 34px;
  height: 6px;
  transform: translateX(-50%);
  background: radial-gradient(circle, var(--mute) 1.2px, transparent 1.7px) 0 0/8px 6px;
  opacity: 0.55;
  pointer-events: none;
}

.askpage-header-icon {
  width: 24px;
  height: 24px;
  color: var(--ac);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transform: rotate(-8deg);
  transition: transform 0.2s;
}

.askpage-header-icon svg {
  width: 22px;
  height: 22px;
}

.askpage-header-title {
  font: 700 26px/1 var(--hfont);
  color: var(--fg);
  flex: 1;
  letter-spacing: -0.01em;
}

.askpage-header-title b {
  font-weight: 700;
  text-decoration: underline wavy var(--ac) 1.5px;
  text-underline-offset: 5px;
}

.askpage-header-btn {
  background: var(--sub);
  border: 1.5px solid var(--bd);
  border-radius: var(--rs);
  color: var(--mute);
  cursor: pointer;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 1.5px 1.5px 0 var(--bd);
  transition: all 0.15s;
}

.askpage-header-btn:hover {
  background: var(--acs);
  color: var(--act);
  transform: rotate(-6deg) scale(1.05);
  box-shadow: 2px 2px 0 var(--bd);
}

.askpage-header-btn:active {
  transform: translate(1px, 1px);
  box-shadow: none;
}

/* ─── Provider & Prompt Controls Row ───────────────── */

.askpage-controls {
  display: flex;
  gap: 8px;
  padding: 8px 14px;
  border-bottom: 1.5px dashed var(--bd);
  background: var(--sub);
  flex-shrink: 0;
}

.askpage-select {
  flex: 1;
  padding: 6px 10px;
  background: var(--pbg);
  border: 1.5px solid var(--bd);
  border-radius: var(--rs);
  color: var(--fg);
  font-family: var(--font);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 1.5px 1.5px 0 var(--bd);
  appearance: auto;
  transition: all 0.15s;
}

.askpage-select:focus {
  outline: none;
  border-color: var(--ac);
  box-shadow: 0 0 0 2px var(--acs), 1.5px 1.5px 0 var(--bd);
}

.askpage-quick-prompt-select {
  max-width: 140px;
  min-width: 110px;
  flex: 0 0 auto !important;
}

/* ─── Chat Messages (Lined Paper Area) ─────────────── */

.askpage-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: repeating-linear-gradient(transparent 0 27px, var(--ln) 27px 28px);
  scrollbar-width: thin;
  scrollbar-color: var(--mute) transparent;
}

.askpage-messages::-webkit-scrollbar {
  width: 5px;
}

.askpage-messages::-webkit-scrollbar-track {
  background: transparent;
}

.askpage-messages::-webkit-scrollbar-thumb {
  background: var(--mute);
  border-radius: 4px;
}

.askpage-msg-wrapper {
  display: flex;
  flex-direction: column;
  animation: pop 0.3s cubic-bezier(0.2, 0.9, 0.3, 1.2) both;
}

.askpage-msg-wrapper.user {
  align-items: flex-end;
}

.askpage-msg-wrapper.assistant,
.askpage-msg-wrapper.error {
  align-items: flex-start;
}

@keyframes pop {
  from { opacity: 0; transform: translateY(8px) rotate(-1deg); }
  to   { opacity: 1; transform: translateY(0) rotate(0deg); }
}

.askpage-msg {
  max-width: 86%;
  padding: 9px 12px;
  font-size: 13.5px;
  line-height: 1.55;
  word-break: break-word;
  position: relative;
}

.askpage-msg.user {
  align-self: flex-end;
  background: var(--ub);
  color: var(--ubf);
  border: 1.5px solid var(--bd);
  border-radius: 14px 18px 12px 18px / 18px 12px 18px 14px;
  border-bottom-right-radius: 3px;
  transform: rotate(0.5deg);
  box-shadow: 2px 2px 0 var(--bd);
}

.askpage-msg.assistant {
  align-self: flex-start;
  background: var(--ab);
  color: var(--fg);
  border: 1.5px solid var(--abd);
  border-radius: 14px 18px 12px 18px / 18px 12px 18px 14px;
  border-bottom-left-radius: 3px;
  box-shadow: 3px 3px 0 color-mix(in srgb, var(--bd) 20%, transparent);
}

.askpage-msg.error {
  align-self: flex-start;
  background: var(--pbg);
  color: var(--fg);
  border: 2px solid var(--er);
  border-radius: 14px 18px 12px 16px;
  box-shadow: 2px 2px 0 var(--er);
}

/* ─── Markdown Content Formatting ──────────────────── */

.askpage-msg.assistant h1,
.askpage-msg.assistant h2,
.askpage-msg.assistant h3,
.askpage-msg.assistant h4 {
  margin: 10px 0 4px;
  font-family: var(--hfont);
  font-weight: 700;
  line-height: 1.2;
}

.askpage-msg.assistant h1 { font-size: 24px; }
.askpage-msg.assistant h2 { font-size: 20px; }
.askpage-msg.assistant h3 { font-size: 18px; }
.askpage-msg.assistant h4 { font-size: 16px; }

.askpage-msg.assistant h1:first-child,
.askpage-msg.assistant h2:first-child,
.askpage-msg.assistant h3:first-child {
  margin-top: 0;
}

.askpage-msg.assistant p {
  margin: 6px 0;
}

.askpage-msg.assistant p:first-child { margin-top: 0; }
.askpage-msg.assistant p:last-child { margin-bottom: 0; }

.askpage-msg.assistant ul {
  list-style: none;
  padding-left: 2px;
  margin: 6px 0;
}

.askpage-msg.assistant ul li {
  position: relative;
  padding-left: 18px;
  margin: 3px 0;
}

.askpage-msg.assistant ul li::before {
  content: "";
  position: absolute;
  left: 3px;
  top: 0.6em;
  width: 7px;
  height: 7px;
  background: var(--ac);
  border-radius: 50% 40% 55% 45%;
}

.askpage-msg.assistant ol {
  margin: 6px 0;
  padding-left: 20px;
}

.askpage-msg.assistant ol li::marker {
  font: 700 19px var(--hfont);
  color: var(--act);
}

.askpage-msg.assistant code {
  font: 12px ui-monospace, Menlo, Consolas, monospace;
  background: var(--code);
  padding: 1px 4px;
  border-radius: 4px;
  border: 1px solid color-mix(in srgb, var(--bd) 20%, transparent);
}

.askpage-msg.assistant pre {
  background: var(--code);
  border: 1.5px dashed var(--bd);
  border-radius: 8px;
  padding: 10px 12px;
  margin: 8px 0;
  overflow-x: auto;
  position: relative;
}

.askpage-msg.assistant pre code {
  background: none;
  border: none;
  padding: 0;
  font-size: 12px;
  line-height: 1.5;
}

.askpage-msg.assistant blockquote {
  border: none;
  font: 600 20px/1.2 var(--hfont);
  font-style: normal;
  color: var(--fg);
  padding: 2px 8px 2px 24px;
  margin: 8px 0;
  position: relative;
}

.askpage-msg.assistant blockquote::before {
  content: "\\201C";
  position: absolute;
  left: 2px;
  top: -8px;
  font: 700 46px/1 var(--hfont);
  color: var(--ac);
}

.askpage-msg.assistant table {
  border-collapse: collapse;
  width: 100%;
  font-size: 12.5px;
  margin: 8px 0;
}

.askpage-msg.assistant th,
.askpage-msg.assistant td {
  padding: 5px 8px;
  border-bottom: 1.5px dashed var(--bd);
  text-align: left;
}

.askpage-msg.assistant th {
  font: 700 18px/1 var(--hfont);
  color: var(--act);
}

.askpage-msg.assistant a {
  color: var(--act);
  text-decoration: underline;
}

.askpage-msg.assistant hr {
  border: none;
  border-top: 1.5px dashed var(--bd);
  margin: 10px 0;
}

/* Citation Badge */
.askpage-msg .c {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  margin: 0 2px;
  border: 1.5px solid var(--act);
  border-radius: 50%;
  background: var(--acs);
  color: var(--act);
  font: 700 14px var(--hfont);
  vertical-align: 1px;
  text-decoration: none;
  transition: 0.15s;
}

.askpage-msg .c:hover {
  background: var(--ac);
  color: var(--acfg);
}

/* ─── Animated Thinking Indicator (Squiggly wave) ─── */

.askpage-typing {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  align-self: flex-start;
  color: var(--mute);
  font: 600 19px/1 var(--hfont);
}

.askpage-typing-wave {
  width: 56px;
  height: 16px;
  stroke: var(--ac);
  stroke-width: 2.2;
  fill: none;
}

.askpage-typing-wave path {
  stroke-dasharray: 1;
  animation: waveDr 1.4s ease-in-out infinite;
}

@keyframes waveDr {
  0%   { stroke-dashoffset: 1; }
  50%  { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -1; }
}

/* ─── Thinking Block ─────────────────────────── */

.askpage-thinking-block {
  align-self: flex-start;
  max-width: 90%;
  margin-bottom: 4px;
  border-radius: var(--rs);
  background: var(--sub);
  border: 1.5px dashed var(--bd);
  overflow: hidden;
  box-shadow: 1.5px 1.5px 0 var(--bd);
}

.askpage-thinking-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font: 700 18px/1 var(--hfont);
  color: var(--act);
  cursor: pointer;
  list-style: none;
  user-select: none;
}

.askpage-thinking-summary::-webkit-details-marker { display: none; }

.askpage-thinking-summary::before {
  content: '▶';
  font-size: 9px;
  transition: transform 0.15s;
}

details[open] > .askpage-thinking-summary::before {
  transform: rotate(90deg);
}

.askpage-thinking-content {
  padding: 8px 12px;
  font-size: 12.5px;
  color: var(--mute);
  line-height: 1.5;
  border-top: 1.5px dashed var(--bd);
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
}

/* ─── Tab Context Bar ──────────────────────────────── */

.askpage-tabs-bar {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-top: 1.5px solid var(--bd);
  background: var(--sub);
  flex-wrap: wrap;
  flex-shrink: 0;
}

/* Tape strip on context bar */
.askpage-tabs-bar::after {
  content: "";
  position: absolute;
  top: -8px;
  right: 18px;
  width: 44px;
  height: 14px;
  background: color-mix(in srgb, var(--hlb) 55%, transparent);
  transform: rotate(-4deg);
  pointer-events: none;
}

.askpage-tabs-label {
  font: 700 17px/1 var(--hfont);
  color: var(--mute);
  margin-right: 4px;
}

.askpage-tab-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  background: var(--pbg);
  border: 1.5px dashed var(--bd);
  border-radius: var(--rx);
  font-size: 11.5px;
  font-weight: 600;
  color: var(--fg);
  max-width: 160px;
}

.askpage-tab-chip-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.askpage-tab-chip-close {
  background: none;
  border: none;
  color: var(--mute);
  cursor: pointer;
  padding: 0 2px;
  font-size: 14px;
  line-height: 1;
  font-weight: 700;
  transition: color 0.15s;
}

.askpage-tab-chip-close:hover {
  color: var(--er);
}

.askpage-current-tab-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: var(--pbg);
  border: 1.5px dashed var(--bd);
  border-radius: var(--rx);
  color: var(--fg);
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
}

.askpage-current-tab-chip:hover {
  background: var(--acs);
  border-color: var(--ac);
  color: var(--act);
}

.askpage-current-tab-chip.active {
  background: var(--acs);
  border: 1.5px solid var(--ac);
  color: var(--act);
}

.askpage-tab-chip-check {
  font-weight: 700;
  color: var(--act);
}

.askpage-add-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--pbg);
  border: 1.5px dashed var(--bd);
  border-radius: var(--rx);
  color: var(--mute);
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.askpage-add-tab-btn:hover {
  background: var(--acs);
  border-color: var(--ac);
  color: var(--act);
}

/* ─── Input Area ───────────────────────────────────── */

.askpage-input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 10px 14px 14px;
  background: var(--pbg);
  flex-shrink: 0;
}

.askpage-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--cb);
  border: 1.5px solid var(--bd);
  border-radius: 14px 18px 12px 18px / 18px 12px 18px 14px;
  padding: 8px 10px;
  box-shadow: 2px 2px 0 var(--bd);
  transition: all 0.15s;
}

.askpage-input-wrapper:focus-within {
  border-color: var(--ac);
  box-shadow: 0 0 0 3px var(--acs), 2px 2px 0 var(--bd);
}

.askpage-input {
  width: 100%;
  border: none;
  background: none;
  resize: none;
  outline: none;
  font: inherit;
  font-size: 13.5px;
  color: var(--fg);
  line-height: 1.45;
  max-height: 110px;
  scrollbar-width: thin;
}

.askpage-input::placeholder {
  font: 600 19px var(--hfont);
  color: var(--mute);
}

.askpage-send-btn {
  width: 34px;
  height: 34px;
  background: var(--ac);
  border: 1.5px solid var(--bd);
  border-radius: 12px 9px 12px 9px;
  color: var(--acfg);
  cursor: pointer;
  display: grid;
  place-items: center;
  box-shadow: 2px 2px 0 var(--bd);
  flex-shrink: 0;
  transition: all 0.15s;
}

.askpage-send-btn:hover:not(:disabled) {
  filter: brightness(1.1);
  transform: translateY(-1px);
  box-shadow: 3px 3px 0 var(--bd);
}

.askpage-send-btn:active:not(:disabled) {
  transform: translate(2px, 2px);
  box-shadow: none;
}

.askpage-send-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

/* ─── Welcome Message ──────────────────────────────── */

.askpage-welcome {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px 8px;
  gap: 10px;
}

.askpage-welcome-icon {
  width: 38px;
  height: 38px;
  color: var(--ac);
  transform: rotate(-8deg);
}

.askpage-welcome-icon svg {
  width: 36px;
  height: 36px;
}

.askpage-welcome h3 {
  font: 700 34px/1 var(--hfont);
  color: var(--fg);
  transform: rotate(-1deg);
}

.askpage-welcome h3::after {
  content: "\\2726";
  color: var(--ac);
  font-size: 0.55em;
  margin-left: 6px;
  vertical-align: top;
}

.askpage-welcome p {
  color: var(--mute);
  font-size: 13.5px;
  line-height: 1.5;
}

.askpage-welcome-pick {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  font: 700 22px/1 var(--hfont);
  color: var(--act);
  transform: rotate(-3deg);
  margin: 10px 0 2px 4px;
}

.askpage-welcome-pick svg {
  width: 34px;
  height: 26px;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
}

.askpage-welcome-prompts {
  display: flex;
  flex-direction: column;
  gap: 7px;
  width: 100%;
}

.askpage-welcome-prompt-btn {
  text-align: left;
  padding: 9px 12px;
  border: 1.5px solid var(--bd);
  border-radius: 14px 10px 16px 10px / 10px 16px 10px 14px;
  background: var(--pbg);
  box-shadow: 2px 2px 0 var(--bd);
  font: 700 20px/1.1 var(--hfont);
  color: var(--fg);
  cursor: pointer;
  transition: all 0.15s;
  width: 100%;
}

.askpage-welcome-prompt-btn:nth-child(odd) {
  transform: rotate(-0.8deg);
}

.askpage-welcome-prompt-btn:nth-child(even) {
  transform: rotate(0.8deg);
}

.askpage-welcome-prompt-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0 var(--bd);
  background: var(--acs);
  color: var(--act);
  border-color: var(--ac);
}

.askpage-welcome-prompt-btn:active {
  transform: translate(2px, 2px);
  box-shadow: none;
}

/* ─── Code Copy Button ─────────────────────────────── */

.askpage-code-wrapper {
  position: relative;
  margin: 8px 0;
}

.askpage-copy-btn {
  position: absolute;
  top: 4px;
  right: 6px;
  font: 700 17px/1 var(--hfont);
  color: var(--act);
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--bd);
  background: var(--sub);
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s;
  z-index: 2;
}

.askpage-code-wrapper:hover .askpage-copy-btn,
.askpage-copy-btn:focus-visible {
  opacity: 1;
}

.askpage-copy-btn:hover {
  background: var(--acs);
}

/* ─── History Sidebar ────────────────────────── */

.askpage-history-sidebar {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 270px;
  background: var(--sub);
  border-right: 2px solid var(--bd);
  box-shadow: 4px 0 0 var(--bd);
  z-index: 25;
  display: flex;
  flex-direction: column;
  animation: slideInHistory 0.2s ease;
}

@keyframes slideInHistory {
  from { transform: translateX(-100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}

.askpage-history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px 8px;
  border-bottom: 1.5px solid var(--bd);
}

.askpage-history-header h4 {
  font: 700 22px/1 var(--hfont);
  color: var(--fg);
}

.askpage-history-new {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--ac);
  border: 1.5px solid var(--bd);
  border-radius: var(--rs);
  color: var(--acfg);
  font: 700 17px/1 var(--hfont);
  cursor: pointer;
  box-shadow: 1.5px 1.5px 0 var(--bd);
  transition: all 0.15s;
}

.askpage-history-new:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

.askpage-history-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--rs);
  background: var(--pbg);
  border: 1.5px solid var(--bd);
  color: var(--mute);
  cursor: pointer;
  box-shadow: 1.5px 1.5px 0 var(--bd);
  transition: all 0.15s;
}

.askpage-history-close:hover {
  background: var(--acs);
  color: var(--er);
}

.askpage-history-search {
  margin: 8px 12px;
  padding: 6px 10px;
  background: var(--pbg);
  border: 1.5px solid var(--bd);
  border-radius: var(--rs);
  color: var(--fg);
  font-family: var(--font);
  font-size: 12px;
}

.askpage-history-search:focus {
  outline: none;
  border-color: var(--ac);
}

.askpage-history-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 8px;
  scrollbar-width: thin;
}

.askpage-history-item {
  display: flex;
  align-items: stretch;
  border: 1.5px solid var(--bd);
  border-radius: var(--rs);
  background: var(--pbg);
  margin-bottom: 6px;
  box-shadow: 1.5px 1.5px 0 var(--bd);
  transition: all 0.12s;
}

.askpage-history-item:hover {
  background: var(--acs);
  border-color: var(--ac);
}

.askpage-history-item.active {
  background: var(--ub);
  border-color: var(--bd);
}

.askpage-history-item-main {
  flex: 1;
  padding: 8px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  color: var(--fg);
  min-width: 0;
}

.askpage-history-item-title {
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.askpage-history-item-meta {
  font-size: 10px;
  color: var(--mute);
  margin-top: 2px;
}

.askpage-history-item-delete {
  background: none;
  border: none;
  color: var(--mute);
  cursor: pointer;
  padding: 4px 8px;
  font-size: 16px;
  opacity: 0.4;
  transition: all 0.12s;
}

.askpage-history-item:hover .askpage-history-item-delete {
  opacity: 0.9;
}

.askpage-history-item-delete:hover {
  color: var(--er) !important;
}

.askpage-history-empty {
  padding: 24px 16px;
  text-align: center;
  color: var(--mute);
  font: 600 18px var(--hfont);
}

/* ─── Tab Picker Modal ─────────────────────────────── */

.askpage-tab-picker-overlay {
  position: absolute;
  inset: 0;
  background: rgba(42, 38, 34, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.askpage-tab-picker {
  background: var(--pbg);
  border: 2px solid var(--bd);
  border-radius: var(--r);
  box-shadow: var(--sh);
  padding: 16px;
  width: calc(100% - 32px);
  max-width: 360px;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.askpage-tab-picker h4 {
  font: 700 24px/1 var(--hfont);
  color: var(--fg);
}

.askpage-tab-picker-search {
  padding: 7px 10px;
  background: var(--sub);
  border: 1.5px solid var(--bd);
  border-radius: var(--rs);
  color: var(--fg);
  font-family: var(--font);
  font-size: 13px;
  width: 100%;
}

.askpage-tab-picker-search:focus {
  outline: none;
  border-color: var(--ac);
}

.askpage-tab-picker-list {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-height: 240px;
  scrollbar-width: thin;
}

.askpage-tab-picker-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background: var(--pbg);
  border: 1.5px solid var(--bd);
  border-radius: var(--rs);
  cursor: pointer;
  font-family: inherit;
  color: var(--fg);
  text-align: left;
  width: 100%;
  box-shadow: 1.5px 1.5px 0 var(--bd);
  transition: all 0.12s;
}

.askpage-tab-picker-item:hover {
  background: var(--acs);
  border-color: var(--ac);
  transform: translateY(-1px);
}

.askpage-tab-picker-item.selected {
  background: var(--ub);
  border-color: var(--bd);
}

.askpage-tab-picker-favicon {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
}

.askpage-tab-picker-info {
  flex: 1;
  overflow: hidden;
}

.askpage-tab-picker-title {
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.askpage-tab-picker-url {
  font-size: 10px;
  color: var(--mute);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.askpage-tab-picker-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.askpage-tab-picker-btn {
  padding: 6px 14px;
  border-radius: var(--rs);
  font: 700 18px/1 var(--hfont);
  cursor: pointer;
  border: 1.5px solid var(--bd);
  box-shadow: 2px 2px 0 var(--bd);
  transition: all 0.15s;
}

.askpage-tab-picker-btn.cancel {
  background: var(--sub);
  color: var(--mute);
}

.askpage-tab-picker-btn.confirm {
  background: var(--ac);
  color: var(--acfg);
}

.askpage-tab-picker-btn.confirm:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

/* ─── Floating Button ──────────────────────────────── */

#browserbot-floating-btn {
  position: fixed;
  right: 14px;
  bottom: 80px;
  width: 40px;
  height: 40px;
  border-radius: 14px 10px 14px 10px / 10px 14px 10px 14px;
  background: var(--ac);
  border: 2px solid var(--bd);
  box-shadow: 3px 3px 0 var(--bd);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2147483645;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, filter 0.15s;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

#browserbot-floating-btn:hover {
  transform: scale(1.08) rotate(-4deg);
  box-shadow: 4px 4px 0 var(--bd);
  filter: brightness(1.08);
}

#browserbot-floating-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0 var(--bd);
}

#browserbot-floating-btn.dragging {
  transition: none;
  transform: scale(1.15);
  box-shadow: 5px 5px 0 var(--bd);
}

#browserbot-floating-btn.hidden {
  opacity: 0;
  transform: scale(0.7);
  pointer-events: none;
}

#browserbot-floating-btn svg {
  width: 20px;
  height: 20px;
  color: var(--acfg);
  pointer-events: none;
}

/* Minimized Side Tab */
.askpage-minimized-tab {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 42px;
  height: 48px;
  background: var(--ac);
  border: 2px solid var(--bd);
  border-right: none;
  border-radius: 14px 0 0 14px;
  color: var(--acfg);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -3px 3px 0 var(--bd);
  z-index: 2147483646;
  transition: all 0.15s;
}

.askpage-minimized-tab:hover {
  width: 48px;
  background: var(--acs);
  color: var(--act);
}
`;
}
