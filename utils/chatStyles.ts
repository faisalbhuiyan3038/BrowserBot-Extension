// ─── BrowserBot 2.0 Handcrafted Sketchbook Design System ──────────────────────────
// Faithful to browserbot-2-sketch.html prototype.

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

// ─── Document-level font registration ─────────────────────────────
// @font-face rules inside a ShadowRoot <style> are unreliable (Chromium
// issue 41085401; plus host-page font-src CSP can block chrome-extension://
// loads). The popup (an extension page) works while the content-script panel
// falls back to sans-serif. So we register the binaries directly on
// document.fonts via the FontFace API — fonts defined outside the shadow
// root ARE usable inside it — and also inject a page-level @font-face
// fallback <style> into document.head for permissive pages.
let panelFontsPromise: Promise<void> | null = null;
let panelFontsHeadInjected = false;

function fontExtUrl(p: any): string {
  try { return browser.runtime.getURL(p); }
  catch { return String(p); }
}

// Page-level @font-face fallback (helps when the page has no restrictive
// font-src CSP but shadow-scoped @font-face fails to register).
function injectFontFacesIntoHead(): void {
  try {
    if (panelFontsHeadInjected) return;
    panelFontsHeadInjected = true;
    const doc = document;
    if (!doc || !doc.head || doc.head.querySelector('style[data-browserbot-fonts]')) return;
    const style = doc.createElement('style');
    style.setAttribute('data-browserbot-fonts', 'true');
    style.textContent = `
      @font-face { font-family: 'Caveat'; src: url('${fontExtUrl('/fonts/Caveat/Caveat-VariableFont_wght.ttf')}') format('truetype'); font-weight: 100 900; font-style: normal; font-display: swap; }
      @font-face { font-family: 'Nunito'; src: url('${fontExtUrl('/fonts/Nunito/Nunito-VariableFont_wght.ttf')}') format('truetype'); font-weight: 100 900; font-style: normal; font-display: swap; }
      @font-face { font-family: 'Nunito'; src: url('${fontExtUrl('/fonts/Nunito/Nunito-Italic-VariableFont_wght.ttf')}') format('truetype'); font-weight: 100 900; font-style: italic; font-display: swap; }
    `;
    doc.head.appendChild(style);
  } catch { /* non-fatal */ }
}

export function ensurePanelFonts(): Promise<void> {
  if (panelFontsPromise) return panelFontsPromise;
  panelFontsPromise = (async () => {
    const log = (...a: any[]) => { try { console.info('[BrowserBot fonts]', ...a); } catch { /* noop */ } };
    try {
      injectFontFacesIntoHead();
      const fontsApi = (document as any).fonts;
      if (!fontsApi || typeof FontFace === 'undefined') {
        log('FontFace API unavailable, using CSS fallback only');
        return;
      }
      try {
        if (fontsApi.check('700 16px Caveat') && fontsApi.check('400 16px Nunito')) {
          log('already available, skipping load');
          return;
        }
      } catch { /* check may throw for unknown families — proceed to load */ }
      const specs: { family: string; path: string; weight: string; style: string }[] = [
        { family: 'Caveat', path: '/fonts/Caveat/Caveat-VariableFont_wght.ttf', weight: '100 900', style: 'normal' },
        { family: 'Nunito', path: '/fonts/Nunito/Nunito-VariableFont_wght.ttf', weight: '100 900', style: 'normal' },
        { family: 'Nunito', path: '/fonts/Nunito/Nunito-Italic-VariableFont_wght.ttf', weight: '100 900', style: 'italic' },
      ];
      const results = await Promise.allSettled(specs.map(async (s) => {
        const url = fontExtUrl(s.path);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`fetch ${res.status} ${url}`);
        const buf = await res.arrayBuffer();
        log(`fetched ${s.family} (${s.style})`, `${buf.byteLength} bytes`);
        const face = new FontFace(s.family, buf, { weight: s.weight, style: s.style, display: 'swap' } as any);
        const loaded = await face.load();
        fontsApi.add(loaded);
        return `${s.family}/${s.style}`;
      }));
      for (const r of results) {
        if (r.status === 'rejected') log('FAILED:', r.reason?.message ?? r.reason);
        else log('registered:', r.value);
      }
      // Explicit verification: force load + check what the renderer sees.
      try {
        await Promise.allSettled([
          fontsApi.load('700 20px Caveat'),
          fontsApi.load('600 14px Nunito'),
          fontsApi.load('italic 600 14px Nunito'),
        ]);
        log(
          'verify check() Caveat:',
          (() => { try { return fontsApi.check('700 16px Caveat'); } catch (e) { return `check threw: ${e}`; } })(),
          'Nunito:',
          (() => { try { return fontsApi.check('400 16px Nunito'); } catch (e) { return `check threw: ${e}`; } })(),
        );
      } catch (e) {
        log('verify step failed:', e);
      }
    } catch (e) {
      log('unexpected failure:', e);
    }
  })();
  return panelFontsPromise;
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

:host {
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
  --font: Nunito, system-ui, -apple-system, sans-serif;
  --hfont: Caveat, cursive, sans-serif;
  --ln: rgba(70, 110, 190, .17);

  font-family: var(--font);
  color: var(--fg);
}

button { font: inherit; color: inherit; cursor: pointer; background: none; border: 0; }
input, textarea, select { font: inherit; color: inherit; }
:focus-visible { outline: 2px dashed var(--ac); outline-offset: 3px; }
textarea:focus-visible { outline: 0; }
::selection { background: var(--hlb); color: #2a2622; }

#browserbot-ask-page-root {
  position: fixed;
  inset: 0;
  z-index: 2147483646;
  pointer-events: none;
  font-family: var(--font);
  -webkit-font-smoothing: antialiased;
}
#browserbot-ask-page-root > * { pointer-events: auto; }

/* ─── Panel — matches prototype .bb ─── */
.askpage-panel {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 400px;
  max-width: calc(100vw - 32px);
  height: min(680px, calc(100vh - 48px));
  display: flex;
  flex-direction: column;
  background: var(--pbg);
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 .4 0 0 0 0 .3 0 0 0 0 .2 0 0 0 .07 0'/></filter><rect width='160' height='160' filter='url(%23n)'/></svg>");
  color: var(--fg);
  border: 2px solid var(--bd);
  border-radius: 22px 28px 18px 26px / 26px 18px 28px 20px;
  box-shadow: var(--sh);
  font: 14px/1.55 var(--font);
  overflow: hidden;
  animation: rise .35s cubic-bezier(.2,.8,.2,1) both;
  transition: background .2s, color .2s, border-color .2s;
  z-index: 2147483646;
}
.askpage-panel.fullscreen {
  right: 0; bottom: 0; top: 0; left: 0;
  width: 100%; max-width: none; height: 100%;
  border-radius: 0; border: none; box-shadow: none;
}
@keyframes rise { from { opacity: 0; transform: translateY(14px) rotate(.6deg); } }
.askpage-panel svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }

.askpage-resize-handle {
  position: absolute; top: 0; left: 0; bottom: 0; width: 8px;
  cursor: col-resize; z-index: 10;
}
.askpage-resize-handle:hover { background: var(--ac); opacity: .35; }

/* ─── Header — matches prototype header/.brand/.acts ─── */
.askpage-header {
  position: relative;
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 14px;
  flex-shrink: 0;
}
.askpage-header::before {
  content: ""; position: absolute; top: 5px; left: 50%;
  width: 34px; height: 6px; transform: translateX(-50%);
  background: radial-gradient(circle, var(--mute) 1.2px, transparent 1.7px) 0 0/8px 6px;
  opacity: .55; pointer-events: none;
}
.askpage-brand { display: flex; align-items: center; gap: 8px; font: 700 28px/1 var(--hfont); }
.askpage-brand b { font-weight: 700; text-decoration: underline wavy var(--ac) 1.5px; text-underline-offset: 6px; }
.askpage-logo { width: 22px; height: 22px; color: var(--ac); transform: rotate(-8deg); flex: none; }
.askpage-header-title { font: inherit; }
.askpage-acts { display: flex; gap: 2px; align-items: center; }
.askpage-header-btn {
  width: 28px; height: 28px; display: grid; place-items: center;
  border-radius: 8px; color: var(--mute); transition: .15s;
}
.askpage-header-btn svg { width: 16px; height: 16px; }
.askpage-header-btn:hover { background: var(--acs); color: var(--act); transform: rotate(-6deg); }
.askpage-header-btn.active { background: var(--acs); color: var(--act); }

/* ─── Context bar — matches prototype .ctx ─── */
.askpage-ctx {
  position: relative;
  display: flex; align-items: center; gap: 8px;
  margin: 0 14px 8px; padding: 6px 10px;
  border: 1.5px dashed var(--bd);
  border-radius: var(--rx);
  font-size: 12px; color: var(--mute); background: var(--sub);
  min-width: 0; flex-shrink: 0;
}
.askpage-ctx::after {
  content: ""; position: absolute; top: -7px; right: 18px;
  width: 44px; height: 14px;
  background: color-mix(in srgb, var(--hlb) 55%, transparent);
  transform: rotate(-4deg); pointer-events: none;
}
.askpage-ctx b { color: var(--fg); font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.askpage-ctx span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex-shrink: 0; max-width: 40%; }
.askpage-fav { width: 16px; height: 16px; flex: none; color: var(--ac); }

/* ─── Messages — matches prototype #v + .m + .b ─── */
.askpage-messages {
  flex: 1; min-height: 0; overflow-y: auto;
  padding: 8px 14px; display: flex; flex-direction: column; gap: 14px;
  background: repeating-linear-gradient(transparent 0 27px, var(--ln) 27px 28px);
  scrollbar-width: thin; scrollbar-color: var(--mute) transparent;
  transition: opacity .16s, transform .16s;
}
.askpage-m { display: flex; gap: 8px; align-items: flex-start; animation: pop .3s cubic-bezier(.2,.9,.3,1.2) both; }
.askpage-m.user { justify-content: flex-end; }
@keyframes pop { from { opacity: 0; transform: translateY(8px) rotate(-1deg); } }
.askpage-av { width: 24px; height: 24px; flex: none; color: var(--ac); margin-top: 2px; transform: rotate(-6deg); }
.askpage-ans { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px; }
.askpage-b { padding: 9px 12px; border-radius: var(--rb); overflow-wrap: anywhere; font-size: 14px; }
.askpage-m.user .askpage-b {
  background: var(--ub); color: var(--ubf); max-width: 85%;
  border: 1.5px solid var(--bd);
  border-radius: 14px 18px 12px 18px / 18px 12px 18px 14px;
  border-bottom-right-radius: 4px;
  transform: rotate(.5deg); box-shadow: 2px 2px 0 var(--bd);
}
.askpage-m.ai .askpage-b {
  background: var(--ab); border: 1.5px solid var(--abd);
  border-radius: 14px 18px 12px 18px / 18px 12px 18px 14px;
  box-shadow: 3px 3px 0 color-mix(in srgb, var(--bd) 20%, transparent);
}
.askpage-b > * + * { margin-top: 8px; }
.askpage-b ul, .askpage-b ol { padding-left: 18px; }
.askpage-b ul { list-style: none; padding-left: 2px; }
.askpage-b ul li { position: relative; padding-left: 18px; }
.askpage-b ul li::before {
  content: ""; position: absolute; left: 3px; top: .6em;
  width: 7px; height: 7px; background: var(--ac); border-radius: 50% 40% 55% 45%;
}
.askpage-b li + li { margin-top: 2px; }
.askpage-b ol li::marker { font: 700 19px var(--hfont); color: var(--act); }
.askpage-b blockquote {
  border: 0; font: 600 20px/1.2 var(--hfont); font-style: normal; color: var(--fg);
  padding: 2px 8px 2px 24px; position: relative;
}
.askpage-b blockquote::before {
  content: "\\201C"; position: absolute; left: 2px; top: -8px;
  font: 700 46px/1 var(--hfont); color: var(--ac);
}
.askpage-b table { border-collapse: collapse; width: 100%; font-size: 12.5px; }
.askpage-b th, .askpage-b td { padding: 5px 8px; border-bottom: 1.5px dashed var(--bd); text-align: left; }
.askpage-b th { font: 700 19px/1 var(--hfont); color: var(--act); }
.askpage-b pre { background: var(--code); padding: 9px 11px; border-radius: 8px; overflow-x: auto; position: relative; border: 1.5px dashed var(--bd); }
.askpage-b code { font: 12px ui-monospace, Menlo, Consolas, monospace; background: var(--code); padding: 1px 4px; border-radius: 4px; }
.askpage-b pre code { padding: 0; background: none; }
.askpage-b .c {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; padding: 0 4px; margin: 0 2px;
  border: 1.5px solid var(--act); border-radius: 50%;
  background: var(--acs); color: var(--act);
  font: 700 15px/1 var(--hfont); vertical-align: 1px; text-decoration: none; transition: .15s;
}
.askpage-b .c:hover { background: var(--ac); color: var(--acfg); }
.askpage-code-wrapper { position: relative; }
.askpage-copy-btn {
  position: absolute; top: 3px; right: 6px;
  font: 700 17px/1 var(--hfont); color: var(--act);
  padding: 2px 6px; border-radius: 6px; opacity: 0; transition: .15s;
}
.askpage-copy-btn:hover { background: var(--acs); }
pre:hover .askpage-copy-btn, .askpage-copy-btn:focus-visible { opacity: 1; }

/* Thinking dots — matches prototype .dots + .scr */
.askpage-b.askpage-dots { display: flex; align-items: center; gap: 5px; color: var(--mute); }
.askpage-scr { width: 56px; height: 16px; stroke: var(--ac); stroke-width: 2.2; fill: none; }
.askpage-scr path { stroke-dasharray: 1; animation: dr 1.4s ease-in-out infinite; }
@keyframes dr { 0% { stroke-dashoffset: 1; } 50% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -1; } }
.askpage-dots span { font: 600 19px/1 var(--hfont); margin: 0; }

.askpage-thinking-block {
  align-self: flex-start; max-width: 95%;
  border: 1.5px dashed var(--bd); border-radius: 12px 16px 10px 14px;
  background: var(--sub); font-size: 12px; color: var(--mute);
}
.askpage-thinking-summary { padding: 6px 10px; font: 700 18px/1 var(--hfont); color: var(--act); cursor: pointer; list-style: none; }
.askpage-thinking-summary::-webkit-details-marker { display: none; }
.askpage-thinking-content { padding: 6px 10px 8px; border-top: 1.5px dashed var(--bd); max-height: 180px; overflow-y: auto; }

/* Welcome — matches prototype .hello + .sug + .pick */
.askpage-welcome { padding: 18px 4px 4px; display: flex; flex-direction: column; align-items: flex-start; gap: 0; }
.askpage-welcome-logo { width: 36px; height: 36px; color: var(--ac); }
.askpage-welcome h2 { font: 700 36px/1 var(--hfont); margin: 10px 0 4px; transform: rotate(-1deg); }
.askpage-welcome h2::after { content: "\\2726"; color: var(--ac); font-size: .55em; margin-left: 6px; vertical-align: top; }
.askpage-welcome p { color: var(--mute); background: var(--pbg); display: inline; }
.askpage-welcome-pick {
  display: flex; align-items: flex-end; gap: 4px;
  font: 700 22px/1 var(--hfont); color: var(--act);
  transform: rotate(-3deg); margin: 12px 0 0 4px;
}
.askpage-welcome-pick svg { width: 34px; height: 26px; stroke-width: 2; }
.askpage-welcome-prompts { display: flex; flex-direction: column; gap: 6px; width: 100%; margin-top: 6px; }
.askpage-welcome-prompt-btn {
  text-align: left; padding: 9px 12px;
  border: 1.5px solid var(--bd);
  border-radius: 14px 10px 16px 10px / 10px 16px 10px 14px;
  background: var(--pbg); box-shadow: 2px 2px 0 var(--bd);
  font: 700 21px/1.1 var(--hfont); color: var(--fg);
  transition: .15s; width: 100%;
}
.askpage-welcome-prompt-btn:nth-child(odd) { transform: rotate(-.8deg); }
.askpage-welcome-prompt-btn:nth-child(even) { transform: rotate(.8deg); }
.askpage-welcome-prompt-btn:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 var(--bd); border-color: var(--ac); background: var(--acs); color: var(--act); }
.askpage-welcome-prompt-btn:active { transform: translate(2px,2px); box-shadow: none; }

/* Error — matches prototype .err + .rt */
.askpage-err {
  display: flex; gap: 10px; padding: 12px;
  border: 2px solid var(--er); border-radius: 14px 18px 12px 16px; background: var(--pbg);
}
.askpage-err svg { color: var(--er); flex: none; margin-top: 3px; width: 16px; height: 16px; }
.askpage-err b { display: block; font: 700 22px/1 var(--hfont); }
.askpage-err p { color: var(--mute); margin: 2px 0 10px; font-size: 13px; }
.askpage-retry {
  padding: 6px 16px; border-radius: var(--rs);
  background: var(--ac); color: var(--acfg); font: 700 20px/1.2 var(--hfont);
  border: 1.5px solid var(--bd); box-shadow: 2px 2px 0 var(--bd);
  border-radius: 12px 9px 12px 9px; transition: .15s;
}
.askpage-retry:hover { filter: brightness(1.1); }
.askpage-retry:active { transform: translate(2px,2px); box-shadow: none; }

/* ─── Footer composer — matches prototype footer/.cmp/.row/.att/.send ─── */
.askpage-footer { padding: 10px 14px 14px; flex-shrink: 0; }
.askpage-cmp {
  position: relative;
  border: 1.5px solid var(--bd);
  border-radius: 14px 18px 12px 18px / 18px 12px 18px 14px;
  background: var(--cb); padding: 8px 10px; transition: .15s;
}
.askpage-cmp:focus-within { border-color: var(--ac); box-shadow: 0 0 0 3px var(--acs); }
.askpage-input {
  width: 100%; border: 0; background: none; resize: none; outline: 0;
  font: 14px/1.55 var(--font); color: inherit;
  max-height: 90px; display: block;
}
.askpage-input::placeholder { color: var(--mute); font: 600 20px var(--hfont); }
.askpage-row { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
.askpage-att {
  display: flex; gap: 5px; align-items: center;
  font-size: 12px; color: var(--mute); padding: 3px 7px; border-radius: 7px; transition: .15s;
}
.askpage-att svg { width: 16px; height: 16px; }
.askpage-att:hover { background: var(--acs); color: var(--act); }
.askpage-att.active { background: var(--acs); color: var(--act); }
.askpage-send {
  width: 30px; height: 30px; border-radius: 12px 9px 12px 9px;
  background: var(--ac); color: var(--acfg);
  display: grid; place-items: center; transition: .15s;
  border: 1.5px solid var(--bd); box-shadow: 2px 2px 0 var(--bd);
  flex-shrink: 0;
}
.askpage-send svg { width: 16px; height: 16px; }
.askpage-send:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
.askpage-send:active:not(:disabled) { transform: translate(2px,2px); box-shadow: none; }
.askpage-send:disabled { opacity: .45; cursor: not-allowed; box-shadow: none; }

/* Context pills above input (only when context attached) */
.askpage-context-pills { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; }
.askpage-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 8px; background: var(--sub);
  border: 1.5px dashed var(--bd); border-radius: var(--rx);
  font-size: 11.5px; font-weight: 600; color: var(--fg);
  max-width: 200px; cursor: default;
}
.askpage-pill svg { width: 12px; height: 12px; }
.askpage-pill button { color: var(--mute); font-size: 14px; line-height: 1; padding: 0 2px; }
.askpage-pill button:hover { color: var(--er); }
.askpage-pill.active { background: var(--acs); border-style: solid; border-color: var(--ac); color: var(--act); }
.askpage-pill.model { cursor: pointer; background: var(--pbg); }
.askpage-pill.model:hover { background: var(--acs); color: var(--act); border-color: var(--ac); }

/* ─── Slash menu (/model /prompt /page /tab) ─── */
.askpage-slash {
  position: absolute; left: 0; right: 0; bottom: calc(100% + 8px);
  background: var(--pbg);
  border: 1.5px solid var(--bd);
  border-radius: 14px 10px 16px 10px / 10px 16px 10px 14px;
  box-shadow: 4px 4px 0 var(--bd);
  max-height: 280px; overflow-y: auto; z-index: 40;
  padding: 6px; scrollbar-width: thin;
  animation: pop .18s ease both;
}
.askpage-slash-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 4px 8px; font: 700 18px/1 var(--hfont); color: var(--act);
}
.askpage-slash-back { font: inherit; color: inherit; }
.askpage-slash-back:hover { text-decoration: underline; }
.askpage-slash-model {
  font: 600 11px var(--font); color: var(--mute);
  background: var(--sub); border: 1px solid var(--bd); border-radius: var(--rx);
  padding: 1px 8px;
}
.askpage-slash-empty { padding: 10px; font-size: 12px; color: var(--mute); text-align: center; }
.askpage-slash-item {
  display: flex; align-items: center; gap: 8px; width: 100%;
  text-align: left; padding: 7px 10px;
  border-radius: 10px 12px 9px 12px;
  border: 1.5px solid transparent;
  transition: .12s;
}
.askpage-slash-item:hover, .askpage-slash-item.active { background: var(--acs); border-color: var(--ac); }
.askpage-slash-title { font-weight: 700; font-size: 13px; white-space: nowrap; }
.askpage-slash-desc { flex: 1; font-size: 12px; color: var(--mute); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.askpage-slash-item.active .askpage-slash-desc { color: var(--act); }
.askpage-slash-hint {
  font-size: 10.5px; color: var(--mute);
  background: var(--sub); border: 1px solid var(--bd); border-radius: 6px; padding: 0 6px;
  flex-shrink: 0;
}
.askpage-slash-foot {
  padding: 6px 8px 2px; font-size: 10.5px; color: var(--mute); text-align: center;
  border-top: 1.5px dashed var(--bd); margin-top: 4px;
}

/* ─── History sidebar ─── */
.askpage-history-sidebar {
  position: absolute; top: 0; left: 0; bottom: 0; width: 270px;
  background: var(--sub); border-right: 2px solid var(--bd);
  box-shadow: 4px 0 0 var(--bd); z-index: 25;
  display: flex; flex-direction: column;
  animation: slideInHistory .2s ease;
  border-radius: 22px 0 0 20px;
  overflow: hidden;
}
@keyframes slideInHistory { from { transform: translateX(-100%); opacity: 0; } }
.askpage-history-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px 8px; border-bottom: 1.5px solid var(--bd);
}
.askpage-history-header h4 { font: 700 22px/1 var(--hfont); color: var(--fg); }
.askpage-history-new {
  display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px;
  background: var(--ac); border: 1.5px solid var(--bd); border-radius: var(--rs);
  color: var(--acfg); font: 700 17px/1 var(--hfont); cursor: pointer;
  box-shadow: 1.5px 1.5px 0 var(--bd); transition: .15s;
}
.askpage-history-new:hover { filter: brightness(1.1); }
.askpage-history-close {
  display: inline-flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; border-radius: var(--rs);
  background: var(--pbg); border: 1.5px solid var(--bd); color: var(--mute);
  cursor: pointer; box-shadow: 1.5px 1.5px 0 var(--bd);
}
.askpage-history-close:hover { background: var(--acs); color: var(--er); }
.askpage-history-search {
  margin: 8px 12px; padding: 6px 10px;
  background: var(--pbg); border: 1.5px solid var(--bd); border-radius: var(--rs);
  color: var(--fg); font-size: 12px; width: calc(100% - 24px);
}
.askpage-history-search:focus { outline: none; border-color: var(--ac); }
.askpage-history-search::placeholder { font: 600 16px var(--hfont); color: var(--mute); }
.askpage-history-list { flex: 1; overflow-y: auto; padding: 0 8px 8px; scrollbar-width: thin; }
.askpage-history-item {
  display: flex; align-items: stretch;
  border: 1.5px solid var(--bd); border-radius: var(--rs);
  background: var(--pbg); margin-bottom: 6px;
  box-shadow: 1.5px 1.5px 0 var(--bd); transition: .12s;
}
.askpage-history-item:hover { background: var(--acs); border-color: var(--ac); }
.askpage-history-item.active { background: var(--ub); }
.askpage-history-item-main { flex: 1; padding: 8px; text-align: left; min-width: 0; }
.askpage-history-item-title { font-size: 12px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.askpage-history-item-meta { font-size: 10px; color: var(--mute); margin-top: 2px; }
.askpage-history-item-delete { color: var(--mute); padding: 4px 8px; font-size: 16px; opacity: .4; }
.askpage-history-item:hover .askpage-history-item-delete { opacity: .9; }
.askpage-history-item-delete:hover { color: var(--er) !important; }
.askpage-history-empty { padding: 24px 16px; text-align: center; color: var(--mute); font: 600 18px var(--hfont); }

/* ─── Tab picker modal ─── */
.askpage-tab-picker-overlay {
  position: absolute; inset: 0; background: rgba(42,38,34,.45);
  display: flex; align-items: center; justify-content: center; z-index: 30;
}
.askpage-tab-picker {
  background: var(--pbg); border: 2px solid var(--bd); border-radius: var(--r);
  box-shadow: var(--sh); padding: 16px;
  width: calc(100% - 32px); max-width: 360px; max-height: 400px;
  display: flex; flex-direction: column; gap: 10px;
}
.askpage-tab-picker h4 { font: 700 24px/1 var(--hfont); }
.askpage-tab-picker-search {
  padding: 7px 10px; background: var(--sub);
  border: 1.5px solid var(--bd); border-radius: var(--rs); font-size: 13px; width: 100%;
}
.askpage-tab-picker-search:focus { outline: none; border-color: var(--ac); }
.askpage-tab-picker-list { overflow-y: auto; display: flex; flex-direction: column; gap: 5px; max-height: 240px; }
.askpage-tab-picker-item {
  display: flex; align-items: center; gap: 8px; padding: 7px 10px;
  background: var(--pbg); border: 1.5px solid var(--bd); border-radius: var(--rs);
  text-align: left; width: 100%; box-shadow: 1.5px 1.5px 0 var(--bd); transition: .12s;
}
.askpage-tab-picker-item:hover { background: var(--acs); border-color: var(--ac); }
.askpage-tab-picker-item.selected { background: var(--ub); }
.askpage-tab-picker-favicon { width: 16px; height: 16px; border-radius: 3px; flex-shrink: 0; }
.askpage-tab-picker-info { flex: 1; overflow: hidden; }
.askpage-tab-picker-title { font-size: 12px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.askpage-tab-picker-url { font-size: 10px; color: var(--mute); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.askpage-tab-picker-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
.askpage-tab-picker-btn {
  padding: 6px 14px; border-radius: var(--rs);
  font: 700 18px/1 var(--hfont); border: 1.5px solid var(--bd);
  box-shadow: 2px 2px 0 var(--bd); transition: .15s;
}
.askpage-tab-picker-btn.cancel { background: var(--sub); color: var(--mute); }
.askpage-tab-picker-btn.confirm { background: var(--ac); color: var(--acfg); }
.askpage-tab-picker-btn.confirm:hover { filter: brightness(1.1); }

/* Minimized tab */
.askpage-minimized-tab {
  position: fixed; top: 50%; right: 0; transform: translateY(-50%);
  width: 42px; height: 48px; background: var(--ac);
  border: 2px solid var(--bd); border-right: none; border-radius: 14px 0 0 14px;
  color: var(--acfg); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: -3px 3px 0 var(--bd); z-index: 2147483646; transition: .15s;
}
.askpage-minimized-tab:hover { width: 48px; }

/* Floating button */
#browserbot-floating-btn {
  position: fixed; right: 14px; bottom: 80px; width: 40px; height: 40px;
  border-radius: 14px 10px 14px 10px / 10px 14px 10px 14px;
  background: var(--ac); border: 2px solid var(--bd); box-shadow: 3px 3px 0 var(--bd);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 2147483645;
  transition: transform .2s, opacity .3s, filter .15s;
}
#browserbot-floating-btn:hover { transform: scale(1.08) rotate(-4deg); }
#browserbot-floating-btn svg { width: 20px; height: 20px; color: var(--acfg); }

@media (max-width: 480px) {
  .askpage-panel { left: 8px; right: 8px; bottom: 8px; width: auto; max-width: none; }
}
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
`;
}
