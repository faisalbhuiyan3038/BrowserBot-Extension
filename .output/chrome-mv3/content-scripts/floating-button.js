var floatingButton=(function(){var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports),s=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},c=(n,r,a)=>(a=n==null?{}:e(i(n)),s(r||!n||!n.__esModule?t(a,`default`,{value:n,enumerable:!0}):a,n));function l(e){return e}var u=globalThis.browser?.runtime?.id?globalThis.browser:globalThis.chrome,d={debug:(...e)=>([...e],void 0),log:(...e)=>([...e],void 0),warn:(...e)=>([...e],void 0),error:(...e)=>([...e],void 0)},f=Symbol(`null`),p=0,m=class extends Map{constructor(){super(),this._objectHashes=new WeakMap,this._symbolHashes=new Map,this._publicKeys=new Map;let[e]=arguments;if(e!=null){if(typeof e[Symbol.iterator]!=`function`)throw TypeError(typeof e+` is not iterable (cannot read property Symbol(Symbol.iterator))`);for(let[t,n]of e)this.set(t,n)}}_getPublicKeys(e,t=!1){if(!Array.isArray(e))throw TypeError(`The keys parameter must be an array`);let n=this._getPrivateKey(e,t),r;return n&&this._publicKeys.has(n)?r=this._publicKeys.get(n):t&&(r=[...e],this._publicKeys.set(n,r)),{privateKey:n,publicKey:r}}_getPrivateKey(e,t=!1){let n=[];for(let r of e){r===null&&(r=f);let e=typeof r==`object`||typeof r==`function`?`_objectHashes`:typeof r==`symbol`?`_symbolHashes`:!1;if(!e)n.push(r);else if(this[e].has(r))n.push(this[e].get(r));else if(t){let t=`@@mkm-ref-${p++}@@`;this[e].set(r,t),n.push(t)}else return!1}return JSON.stringify(n)}set(e,t){let{publicKey:n}=this._getPublicKeys(e,!0);return super.set(n,t)}get(e){let{publicKey:t}=this._getPublicKeys(e);return super.get(t)}has(e){let{publicKey:t}=this._getPublicKeys(e);return super.has(t)}delete(e){let{publicKey:t,privateKey:n}=this._getPublicKeys(e);return!!(t&&super.delete(t)&&this._publicKeys.delete(n))}clear(){super.clear(),this._symbolHashes.clear(),this._publicKeys.clear()}get[Symbol.toStringTag](){return`ManyKeysMap`}get size(){return super.size}};function h(e){if(typeof e!=`object`||!e)return!1;let t=Object.getPrototypeOf(e);return t!==null&&t!==Object.prototype&&Object.getPrototypeOf(t)!==null||Symbol.iterator in e?!1:Symbol.toStringTag in e?Object.prototype.toString.call(e)===`[object Module]`:!0}function g(e,t,n=`.`,r){if(!h(t))return g(e,{},n,r);let i=Object.assign({},t);for(let t in e){if(t===`__proto__`||t===`constructor`)continue;let a=e[t];a!=null&&(r&&r(i,t,a,n)||(Array.isArray(a)&&Array.isArray(i[t])?i[t]=[...a,...i[t]]:h(a)&&h(i[t])?i[t]=g(a,i[t],(n?`${n}.`:``)+t.toString(),r):i[t]=a))}return i}function _(e){return(...t)=>t.reduce((t,n)=>g(t,n,``,e),{})}var v=_(),y=e=>e===null?{isDetected:!1}:{isDetected:!0,result:e},b=e=>e===null?{isDetected:!0,result:null}:{isDetected:!1},x=()=>({target:globalThis.document,unifyProcess:!0,detector:y,observeConfigs:{childList:!0,subtree:!0,attributes:!0},signal:void 0,customMatcher:void 0}),S=(e,t)=>v(e,t),C=new m;function w(e){let{defaultOptions:t}=e;return(e,n)=>{let{target:r,unifyProcess:i,observeConfigs:a,detector:o,signal:s,customMatcher:c}=S(n,t),l=[e,r,i,a,o,s,c],u=C.get(l);if(i&&u)return u;let d=new Promise(async(t,n)=>{if(s?.aborted)return n(s.reason);let i=new MutationObserver(async n=>{for(let a of n){if(s?.aborted){i.disconnect();break}let n=await T({selector:e,target:r,detector:o,customMatcher:c});if(n.isDetected){i.disconnect(),t(n.result);break}}});s?.addEventListener(`abort`,()=>(i.disconnect(),n(s.reason)),{once:!0});let l=await T({selector:e,target:r,detector:o,customMatcher:c});if(l.isDetected)return t(l.result);i.observe(r,a)}).finally(()=>{C.delete(l)});return C.set(l,d),d}}async function T({target:e,selector:t,detector:n,customMatcher:r}){return await n(r?r(t):e.querySelector(t))}var E=w({defaultOptions:x()});function D(e,t,n){n.position!==`inline`&&(n.zIndex!=null&&(e.style.zIndex=String(n.zIndex)),e.style.overflow=`visible`,e.style.position=`relative`,e.style.width=`0`,e.style.height=`0`,e.style.display=`block`,t&&(n.position===`overlay`?(t.style.position=`absolute`,n.alignment?.startsWith(`bottom-`)?t.style.bottom=`0`:t.style.top=`0`,n.alignment?.endsWith(`-right`)?t.style.right=`0`:t.style.left=`0`):(t.style.position=`fixed`,t.style.top=`0`,t.style.bottom=`0`,t.style.left=`0`,t.style.right=`0`)))}function O(e){if(e.anchor==null)return document.body;let t=typeof e.anchor==`function`?e.anchor():e.anchor;return typeof t==`string`?t.startsWith(`/`)?document.evaluate(t,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue??void 0:document.querySelector(t)??void 0:t??void 0}function k(e,t){let n=O(t);if(n==null)throw Error(`Failed to mount content script UI: could not find anchor element`);switch(t.append){case void 0:case`last`:n.append(e);break;case`first`:n.prepend(e);break;case`replace`:n.replaceWith(e);break;case`after`:n.parentElement?.insertBefore(e,n.nextElementSibling);break;case`before`:n.parentElement?.insertBefore(e,n);break;default:t.append(n,e)}}function A(e,t){let n,r=()=>{n?.stopAutoMount(),n=void 0},i=()=>{e.mount()},a=e.remove;return{mount:i,remove:()=>{r(),e.remove()},autoMount:e=>{n&&d.warn(`autoMount is already set.`),n=j({mount:i,unmount:a,stopAutoMount:r},{...t,...e})}}}function j(e,t){let n=new AbortController,r=`explicit_stop_auto_mount`,i=()=>{n.abort(r),t.onStop?.()},a=typeof t.anchor==`function`?t.anchor():t.anchor;if(a instanceof Element)throw Error("autoMount and Element anchor option cannot be combined. Avoid passing `Element` directly or `() => Element` to the anchor.");async function o(i){let a=!!O(t);for(a&&e.mount();!n.signal.aborted;)try{a=!!await E(i??`body`,{customMatcher:()=>O(t)??null,detector:a?b:y,signal:n.signal}),a?e.mount():(e.unmount(),t.once&&e.stopAutoMount())}catch(e){if(n.signal.aborted&&n.signal.reason===r)break;throw e}}return o(a),{stopAutoMount:i}}var M=/(\s*@(property|font-face)[\s\S]*?{[\s\S]*?})/gm;function N(e){return{documentCss:Array.from(e.matchAll(M),e=>e[0]).join(``).trim(),shadowCss:e.replace(M,``).trim()}}var P=c(o(((e,t)=>{var n=/^[a-z](?:[\.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*-(?:[\x2D\.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*$/;t.exports=function(e){return n.test(e)}}))(),1),F=(e,t,n)=>new Promise((r,i)=>{var a=e=>{try{s(n.next(e))}catch(e){i(e)}},o=e=>{try{s(n.throw(e))}catch(e){i(e)}},s=e=>e.done?r(e.value):Promise.resolve(e.value).then(a,o);s((n=n.apply(e,t)).next())}),I=[`article`,`aside`,`blockquote`,`body`,`div`,`footer`,`h1`,`h2`,`h3`,`h4`,`h5`,`h6`,`header`,`main`,`nav`,`p`,`section`,`span`];function L(e){return F(this,null,function*(){let{name:t,mode:n=`closed`,css:r,isolateEvents:i=!1}=e;if(!I.includes(t)&&!(0,P.default)(t))throw Error(`"${t}" cannot have a shadow root attached to it. It must be two words and kebab-case, with a few exceptions. See https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#elements_you_can_attach_a_shadow_to`);let a=document.createElement(t),o=a.attachShadow({mode:n}),s=document.createElement(`html`),c=document.createElement(`body`),l=document.createElement(`head`);if(r){let e=document.createElement(`style`);`url`in r?e.textContent=yield fetch(r.url).then(e=>e.text()):e.textContent=r.textContent,l.appendChild(e)}return s.appendChild(l),s.appendChild(c),o.appendChild(s),i&&(Array.isArray(i)?i:[`keydown`,`keyup`,`keypress`]).forEach(e=>{c.addEventListener(e,e=>e.stopPropagation())}),{parentElement:a,shadow:o,isolatedElement:c}})}async function R(e,t){let n=Math.random().toString(36).substring(2,15),r=[];if(t.inheritStyles||r.push(`/* WXT Shadow Root Reset */ :host{all:initial !important;}`),t.css&&r.push(t.css),e.options?.cssInjectionMode===`ui`){let e=await z();r.push(e.replaceAll(`:root`,`:host`))}let{shadowCss:i,documentCss:a}=N(r.join(`
`).trim()),{isolatedElement:o,parentElement:s,shadow:c}=await L({name:t.name,css:{textContent:i},mode:t.mode??`open`,isolateEvents:t.isolateEvents}),l,u=()=>{if(k(s,t),D(s,c.querySelector(`html`),t),a&&!document.querySelector(`style[wxt-shadow-root-document-styles="${n}"]`)){let e=document.createElement(`style`);e.textContent=a,e.setAttribute(`wxt-shadow-root-document-styles`,n),(document.head??document.body).append(e)}l=t.onMount(o,c,s)},d=()=>{for(t.onRemove?.(l),s.remove(),document.querySelector(`style[wxt-shadow-root-document-styles="${n}"]`)?.remove();o.lastChild;)o.removeChild(o.lastChild);l=void 0},f=A({mount:u,remove:d},t);return e.onInvalidated(d),{shadow:c,shadowHost:s,uiContainer:o,...f,get mounted(){return l}}}async function z(){let e=u.runtime.getURL(`/content-scripts/floating-button.css`);try{return await(await fetch(e)).text()}catch(t){return d.warn(`Failed to load styles @ ${e}. Did you forget to import the stylesheet in your entrypoint?`,t),``}}function B(){return`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

:host {
  all: initial;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

#browserbot-ask-page-root {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 2147483646;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ─── Panel Container ──────────────────────────────── */

.askpage-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: #13141a;
  color: #f3f4f6;
  border-left: 1px solid rgba(255,255,255,0.08);
  box-shadow: -8px 0 40px rgba(0,0,0,0.35);
  animation: slideInPanel 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

.askpage-panel.minimized {
  animation: slideOutPanel 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes slideInPanel {
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
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
  width: 5px;
  cursor: col-resize;
  background: transparent;
  z-index: 10;
  transition: background 0.15s;
}

.askpage-resize-handle:hover,
.askpage-resize-handle.dragging {
  background: rgba(167, 139, 250, 0.5);
}

/* ─── Header ───────────────────────────────────────── */

.askpage-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  flex-shrink: 0;
}

.askpage-header-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: linear-gradient(135deg, #6c5ce7, #a78bfa);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.askpage-header-icon svg {
  color: #fff;
}

.askpage-header-title {
  font-size: 14px;
  font-weight: 700;
  flex: 1;
}

.askpage-header-btn {
  background: rgba(255,255,255,0.06);
  border: none;
  color: #9ca3af;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.askpage-header-btn:hover {
  background: rgba(255,255,255,0.12);
  color: #f3f4f6;
}

/* ─── Provider / Prompt Selector Row ───────────────── */

.askpage-controls {
  display: flex;
  gap: 8px;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.askpage-select {
  flex: 1;
  padding: 7px 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  color: #f3f4f6;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: border-color 0.15s;
  appearance: auto;
}

.askpage-select:focus {
  outline: none;
  border-color: #a78bfa;
}

.askpage-select option {
  background: #1c1e2a;
  color: #f3f4f6;
}

/* ─── Quick Prompt Select ──────────────────────── */

.askpage-quick-prompt-select {
  max-width: 140px;
  min-width: 110px;
  flex: 0 0 auto !important;
}

/* ─── Chat Messages ────────────────────────────────── */

.askpage-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.askpage-messages::-webkit-scrollbar {
  width: 5px;
}

.askpage-messages::-webkit-scrollbar-track {
  background: transparent;
}

.askpage-messages::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
}

.askpage-msg-wrapper {
  display: flex;
  flex-direction: column;
}

.askpage-msg-wrapper.user {
  align-items: flex-end;
}

.askpage-msg-wrapper.assistant,
.askpage-msg-wrapper.error {
  align-items: flex-start;
}

.askpage-msg {
  max-width: 90%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.55;
  word-break: break-word;
  animation: fadeInMsg 0.2s ease;
}

@keyframes fadeInMsg {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.askpage-msg.user {
  align-self: flex-end;
  background: linear-gradient(135deg, #6c5ce7, #a78bfa);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.askpage-msg.assistant {
  align-self: flex-start;
  background: rgba(255,255,255,0.06);
  color: #e5e7eb;
  border-bottom-left-radius: 4px;
}

.askpage-msg.error {
  align-self: flex-start;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

/* ─── Markdown Rendering ───────────────────────────── */

.askpage-msg.assistant h1,
.askpage-msg.assistant h2,
.askpage-msg.assistant h3,
.askpage-msg.assistant h4 {
  margin: 12px 0 6px;
  font-weight: 700;
  line-height: 1.3;
}

.askpage-msg.assistant h1 { font-size: 17px; }
.askpage-msg.assistant h2 { font-size: 15px; }
.askpage-msg.assistant h3 { font-size: 14px; }
.askpage-msg.assistant h4 { font-size: 13px; }

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

.askpage-msg.assistant ul,
.askpage-msg.assistant ol {
  margin: 6px 0;
  padding-left: 20px;
}

.askpage-msg.assistant li {
  margin: 3px 0;
}

.askpage-msg.assistant code {
  background: rgba(167, 139, 250, 0.12);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
}

.askpage-msg.assistant pre {
  background: rgba(0,0,0,0.3);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  padding: 12px;
  margin: 8px 0;
  overflow-x: auto;
  scrollbar-width: thin;
}

.askpage-msg.assistant pre code {
  background: none;
  padding: 0;
  border-radius: 0;
  font-size: 12px;
  line-height: 1.5;
}

.askpage-msg.assistant blockquote {
  border-left: 3px solid #a78bfa;
  padding-left: 12px;
  margin: 8px 0;
  color: #9ca3af;
}

.askpage-msg.assistant table {
  border-collapse: collapse;
  margin: 8px 0;
  width: 100%;
  font-size: 12px;
}

.askpage-msg.assistant th,
.askpage-msg.assistant td {
  border: 1px solid rgba(255,255,255,0.1);
  padding: 6px 10px;
  text-align: left;
}

.askpage-msg.assistant th {
  background: rgba(255,255,255,0.06);
  font-weight: 600;
}

.askpage-msg.assistant a {
  color: #a78bfa;
  text-decoration: underline;
}

.askpage-msg.assistant strong { font-weight: 700; }
.askpage-msg.assistant em { font-style: italic; }

.askpage-msg.assistant hr {
  border: none;
  border-top: 1px solid rgba(255,255,255,0.1);
  margin: 12px 0;
}

/* ─── Typing Indicator ─────────────────────────────── */

.askpage-typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 14px;
  align-self: flex-start;
}

.askpage-typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #a78bfa;
  animation: typingBounce 1.4s infinite ease-in-out;
}

.askpage-typing-dot:nth-child(2) { animation-delay: 0.2s; }
.askpage-typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* ─── Tab Context Bar ──────────────────────────────── */

.askpage-tabs-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  flex-wrap: wrap;
  flex-shrink: 0;
}

.askpage-tabs-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6b7280;
  margin-right: 4px;
}

.askpage-tab-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 8px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 6px;
  font-size: 11px;
  color: #6ee7b7;
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
  color: #6ee7b7;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  line-height: 1;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.askpage-tab-chip-close:hover {
  opacity: 1;
}

.askpage-add-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(255,255,255,0.06);
  border: 1px dashed rgba(255,255,255,0.15);
  border-radius: 6px;
  color: #9ca3af;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.askpage-add-tab-btn:hover {
  background: rgba(167, 139, 250, 0.1);
  border-color: rgba(167, 139, 250, 0.3);
  color: #a78bfa;
}

/* ─── Tab Picker Modal ─────────────────────────────── */

.askpage-tab-picker-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.askpage-tab-picker {
  background: #1c1e2a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 16px;
  width: calc(100% - 32px);
  max-width: 360px;
  max-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: scaleIn 0.2s ease;
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.askpage-tab-picker h4 {
  font-size: 14px;
  font-weight: 700;
  margin: 0;
}

.askpage-tab-picker-search {
  padding: 8px 12px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: #f3f4f6;
  font-family: inherit;
  font-size: 13px;
  width: 100%;
}

.askpage-tab-picker-search:focus {
  outline: none;
  border-color: #a78bfa;
}

.askpage-tab-picker-search::placeholder {
  color: #6b7280;
}

.askpage-tab-picker-list {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 260px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.askpage-tab-picker-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: rgba(255,255,255,0.03);
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  color: #e5e7eb;
  text-align: left;
  width: 100%;
}

.askpage-tab-picker-item:hover {
  background: rgba(167, 139, 250, 0.08);
  border-color: rgba(167, 139, 250, 0.2);
}

.askpage-tab-picker-item.selected {
  background: rgba(167, 139, 250, 0.12);
  border-color: #a78bfa;
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
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.askpage-tab-picker-url {
  font-size: 10px;
  color: #6b7280;
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
  padding: 7px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  border: none;
  transition: all 0.15s;
}

.askpage-tab-picker-btn.cancel {
  background: rgba(255,255,255,0.06);
  color: #9ca3af;
}

.askpage-tab-picker-btn.cancel:hover {
  background: rgba(255,255,255,0.1);
}

.askpage-tab-picker-btn.confirm {
  background: #a78bfa;
  color: #fff;
}

.askpage-tab-picker-btn.confirm:hover {
  background: #c4b5fd;
}

/* ─── Input Area ───────────────────────────────────── */

.askpage-input-area {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.02);
  flex-shrink: 0;
}

.askpage-input {
  flex: 1;
  padding: 10px 14px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: #f3f4f6;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.45;
  resize: none;
  max-height: 120px;
  scrollbar-width: thin;
  transition: border-color 0.15s;
}

.askpage-input:focus {
  outline: none;
  border-color: #a78bfa;
}

.askpage-input::placeholder {
  color: #6b7280;
}

.askpage-send-btn {
  width: 38px;
  height: 38px;
  background: linear-gradient(135deg, #6c5ce7, #a78bfa);
  border: none;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}

.askpage-send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 16px rgba(108, 92, 231, 0.35);
}

.askpage-send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ─── Minimized Floating Tab ───────────────────────── */

.askpage-minimized-tab {
  position: fixed;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 40px;
  height: 48px;
  background: linear-gradient(135deg, #6c5ce7, #a78bfa);
  border: none;
  border-radius: 10px 0 0 10px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -4px 0 16px rgba(108, 92, 231, 0.3);
  z-index: 2147483646;
  animation: fadeInTab 0.3s ease;
  transition: all 0.15s;
}

.askpage-minimized-tab:hover {
  width: 48px;
  box-shadow: -6px 0 24px rgba(108, 92, 231, 0.5);
}

@keyframes fadeInTab {
  from { opacity: 0; transform: translateY(-50%) translateX(20px); }
  to   { opacity: 1; transform: translateY(-50%) translateX(0); }
}

/* ─── Welcome Message ──────────────────────────────── */

.askpage-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 12px;
  text-align: center;
  padding: 40px 20px;
}

.askpage-welcome-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(108, 92, 231, 0.15), rgba(167, 139, 250, 0.15));
  display: flex;
  align-items: center;
  justify-content: center;
}

.askpage-welcome-icon svg {
  color: #a78bfa;
}

.askpage-welcome h3 {
  font-size: 16px;
  font-weight: 700;
  color: #f3f4f6;
  margin: 0;
}

.askpage-welcome p {
  font-size: 13px;
  color: #6b7280;
  max-width: 260px;
  line-height: 1.5;
  margin: 0;
}

/* ─── Code Copy Button ─────────────────────────────── */

.askpage-code-wrapper {
  position: relative;
  margin: 8px 0;
}

.askpage-copy-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  padding: 3px 10px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 5px;
  color: #9ca3af;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  z-index: 2;
}

.askpage-copy-btn:hover {
  background: rgba(167, 139, 250, 0.2);
  border-color: rgba(167, 139, 250, 0.4);
  color: #a78bfa;
}

.askpage-code-wrapper pre {
  margin: 0 !important;
}

/* ─── Current Tab Chip ─────────────────────────────── */

.askpage-current-tab-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 6px;
  color: #9ca3af;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
}

.askpage-current-tab-chip:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
  color: #a78bfa;
}

.askpage-current-tab-chip.active {
  background: rgba(99, 102, 241, 0.15);
  border-color: #a78bfa;
  color: #a78bfa;
}

.askpage-tab-chip-check {
  font-size: 11px;
  font-weight: 700;
}

/* ─── History Header Button ──────────────────── */

.askpage-history-btn {
  margin-right: 2px;
}

.askpage-history-btn.active {
  background: rgba(167, 139, 250, 0.2) !important;
  color: #a78bfa !important;
}

/* ─── History Sidebar Close Button ────────────── */

.askpage-history-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.askpage-history-close:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

/* ─── History Sidebar ────────────────────────── */

.askpage-history-sidebar {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 260px;
  background: #181a22;
  border-right: 1px solid rgba(255,255,255,0.08);
  z-index: 20;
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
  padding: 14px 12px 8px;
}

.askpage-history-header h4 {
  font-size: 13px;
  font-weight: 700;
  margin: 0;
  color: #f3f4f6;
}

.askpage-history-new {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(167, 139, 250, 0.12);
  border: 1px solid rgba(167, 139, 250, 0.25);
  border-radius: 6px;
  color: #a78bfa;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.askpage-history-new:hover {
  background: rgba(167, 139, 250, 0.2);
}

.askpage-history-search {
  margin: 4px 12px 8px;
  padding: 7px 10px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 6px;
  color: #f3f4f6;
  font-family: inherit;
  font-size: 12px;
}

.askpage-history-search:focus { outline: none; border-color: #a78bfa; }
.askpage-history-search::placeholder { color: #6b7280; }

.askpage-history-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 8px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.askpage-history-item {
  display: flex;
  align-items: stretch;
  border-radius: 8px;
  margin-bottom: 2px;
  transition: background 0.12s;
}

.askpage-history-item:hover {
  background: rgba(255,255,255,0.04);
}

.askpage-history-item.active {
  background: rgba(167, 139, 250, 0.1);
}

.askpage-history-item-main {
  flex: 1;
  padding: 8px 8px;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  color: #e5e7eb;
  min-width: 0;
}

.askpage-history-item-title {
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.askpage-history-item-meta {
  font-size: 10px;
  color: #6b7280;
  margin-top: 2px;
}

.askpage-history-item-delete {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 16px;
  opacity: 0;
  transition: all 0.12s;
  display: flex;
  align-items: center;
}

.askpage-history-item:hover .askpage-history-item-delete {
  opacity: 0.6;
}

.askpage-history-item-delete:hover {
  opacity: 1 !important;
  color: #ef4444;
}

.askpage-history-empty {
  padding: 24px 16px;
  text-align: center;
  color: #6b7280;
  font-size: 12px;
}

/* ─── Thinking Block ─────────────────────────── */

.askpage-thinking-block {
  align-self: flex-start;
  max-width: 90%;
  margin-bottom: 4px;
  border-radius: 10px;
  background: rgba(167, 139, 250, 0.06);
  border: 1px solid rgba(167, 139, 250, 0.12);
  overflow: hidden;
  animation: fadeInMsg 0.2s ease;
}

.askpage-thinking-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #a78bfa;
  cursor: pointer;
  list-style: none;
  user-select: none;
}

.askpage-thinking-summary::-webkit-details-marker { display: none; }

.askpage-thinking-summary::before {
  content: '▶';
  font-size: 8px;
  transition: transform 0.15s;
}

details[open] > .askpage-thinking-summary::before {
  transform: rotate(90deg);
}

.askpage-thinking-content {
  padding: 8px 12px;
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.5;
  border-top: 1px solid rgba(167, 139, 250, 0.1);
  font-style: italic;
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.askpage-thinking-content p { margin: 4px 0; }
.askpage-thinking-content code {
  background: rgba(167, 139, 250, 0.1);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 11px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.askpage-thinking-spinner {
  animation: spin 1.5s linear infinite;
}

/* ─── Welcome Prompt Buttons ──────────────────── */

.askpage-welcome-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
  justify-content: center;
}

.askpage-welcome-prompt-btn {
  padding: 6px 14px;
  background: rgba(167, 139, 250, 0.1);
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 20px;
  color: #a78bfa;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
}

.askpage-welcome-prompt-btn:hover {
  background: rgba(167, 139, 250, 0.2);
  border-color: rgba(167, 139, 250, 0.4);
  transform: translateY(-1px);
}

/* ─── Floating Button ──────────────────────────────── */

#browserbot-floating-btn {
  position: fixed;
  right: 12px;
  bottom: 80px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2147483645;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease, background 0.2s ease, box-shadow 0.2s ease;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
}

#browserbot-floating-btn:hover {
  transform: scale(1.1);
  background: rgba(99, 102, 241, 0.5);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

#browserbot-floating-btn.dragging {
  transition: none;
  transform: scale(1.15);
  background: rgba(99, 102, 241, 0.55);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

#browserbot-floating-btn.hidden {
  opacity: 0;
  transform: scale(0.7);
  pointer-events: none;
}

#browserbot-floating-btn svg {
  width: 16px;
  height: 16px;
  color: rgba(255, 255, 255, 0.85);
  pointer-events: none;
}
`}var V=l({matches:[`<all_urls>`],cssInjectionMode:`ui`,runAt:`document_idle`,async main(e){let t=!1,n=null,r=!0;if(r=await(async()=>{let e=await u.storage.local.get(`appState`);return e.appState?e.appState.askPageFloatingButton!==!1:!0})(),u.storage.onChanged.addListener((e,t)=>{if(t===`local`&&e.appState?.newValue){let t=e.appState.newValue,n=r;r=t.askPageFloatingButton!==!1,r&&!n?i():!r&&n&&a()}}),!r)return;async function i(){t||(t=!0,(await R(e,{name:`browserbot-floating-button`,position:`overlay`,zIndex:2147483645,onMount(e){let t=document.createElement(`style`);t.textContent=B(),e.getRootNode().appendChild(t);let r=document.createElement(`div`);r.id=`browserbot-floating-btn`,r.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,e.appendChild(r),n=r,o(r)},onRemove(){n=null}})).mount())}function a(){n&&(n.remove(),t=!1)}function o(e){let t=!1,n=!1,r=0,i=0,a=0,o=0,c=null,l=!1,u=localStorage.getItem(`browserbot-float-btn-pos`);if(u)try{let t=JSON.parse(u);e.style.right=`auto`,e.style.left=t.left+`px`,e.style.top=t.top+`px`,e.style.bottom=`auto`}catch{}e.addEventListener(`touchstart`,s=>{let c=s.touches[0];t=!0,n=!1,r=c.clientX,i=c.clientY;let l=e.getBoundingClientRect();a=l.left,o=l.top,e.classList.add(`dragging`),m(),g()},{passive:!0}),e.addEventListener(`touchmove`,s=>{if(!t)return;let c=s.touches[0],l=Math.abs(c.clientX-r),u=Math.abs(c.clientY-i);if((l>5||u>5)&&(n=!0),n){s.preventDefault();let t=a+(c.clientX-r),n=o+(c.clientY-i),l=Math.max(0,Math.min(window.innerWidth-48,t)),u=Math.max(0,Math.min(window.innerHeight-48,n));e.style.right=`auto`,e.style.left=l+`px`,e.style.top=u+`px`,e.style.bottom=`auto`}},{passive:!1}),e.addEventListener(`touchend`,r=>{if(t=!1,e.classList.remove(`dragging`),!n)s();else{let t=e.getBoundingClientRect();localStorage.setItem(`browserbot-float-btn-pos`,JSON.stringify({left:t.left,top:t.top})),d(e),f()}}),e.addEventListener(`mousedown`,s=>{s.preventDefault(),t=!0,n=!1,r=s.clientX,i=s.clientY;let c=e.getBoundingClientRect();a=c.left,o=c.top,e.classList.add(`dragging`),m(),g()}),document.addEventListener(`mousemove`,s=>{if(!t)return;let c=Math.abs(s.clientX-r),l=Math.abs(s.clientY-i);if((c>5||l>5)&&(n=!0),n){let t=a+(s.clientX-r),n=o+(s.clientY-i),c=Math.max(0,Math.min(window.innerWidth-48,t)),l=Math.max(0,Math.min(window.innerHeight-48,n));e.style.right=`auto`,e.style.left=c+`px`,e.style.top=l+`px`,e.style.bottom=`auto`}}),document.addEventListener(`mouseup`,r=>{if(t)if(t=!1,e.classList.remove(`dragging`),!n)s();else{let t=e.getBoundingClientRect();localStorage.setItem(`browserbot-float-btn-pos`,JSON.stringify({left:t.left,top:t.top})),d(e),f()}});function d(e){let t=e.getBoundingClientRect(),n=t.left+t.width/2,r=t.top+t.height/2;n<window.innerWidth/2?e.style.left=`8px`:e.style.left=window.innerWidth-56+`px`;let i=Math.max(8,Math.min(window.innerHeight-56,r-24));e.style.top=i+`px`,localStorage.setItem(`browserbot-float-btn-pos`,JSON.stringify({left:parseInt(e.style.left),top:i}))}function f(){l=!0,p()}function p(){l&&(m(),c=setTimeout(()=>{h()},3e3))}function m(){c&&=(clearTimeout(c),null)}function h(){e.classList.add(`hidden`)}function g(){e.classList.remove(`hidden`),l&&p()}let _=null;window.addEventListener(`scroll`,()=>{g(),_&&clearTimeout(_),_=setTimeout(()=>{l&&p()},1e3)},{passive:!0}),document.addEventListener(`touchstart`,t=>{let n=t.touches[0],r=e.getBoundingClientRect();n.clientX>=r.left-100&&n.clientX<=r.right+100&&n.clientY>=r.top-100&&n.clientY<=r.bottom+100&&g()},{passive:!0}),setTimeout(()=>{f()},5e3)}async function s(){try{await u.runtime.sendMessage({type:`TOGGLE_ASK_PAGE`})}catch{}}i()}}),H=class e extends Event{static EVENT_NAME=U(`wxt:locationchange`);constructor(t,n){super(e.EVENT_NAME,{}),this.newUrl=t,this.oldUrl=n}};function U(e){return`${u?.runtime?.id}:floating-button:${e}`}var W=typeof globalThis.navigation?.addEventListener==`function`;function G(e){let t,n=!1;return{run(){n||(n=!0,t=new URL(location.href),W?globalThis.navigation.addEventListener(`navigate`,e=>{let n=new URL(e.destination.url);n.href!==t.href&&(window.dispatchEvent(new H(n,t)),t=n)},{signal:e.signal}):e.setInterval(()=>{let e=new URL(location.href);e.href!==t.href&&(window.dispatchEvent(new H(e,t)),t=e)},1e3))}}}var K=class e{static SCRIPT_STARTED_MESSAGE_TYPE=U(`wxt:content-script-started`);id;abortController;locationWatcher=G(this);constructor(e,t){this.contentScriptName=e,this.options=t,this.id=Math.random().toString(36).slice(2),this.abortController=new AbortController,this.stopOldScripts(),this.listenForNewerScripts()}get signal(){return this.abortController.signal}abort(e){return this.abortController.abort(e)}get isInvalid(){return u.runtime?.id??this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(e){return this.signal.addEventListener(`abort`,e),()=>this.signal.removeEventListener(`abort`,e)}block(){return new Promise(()=>{})}setInterval(e,t){let n=setInterval(()=>{this.isValid&&e()},t);return this.onInvalidated(()=>clearInterval(n)),n}setTimeout(e,t){let n=setTimeout(()=>{this.isValid&&e()},t);return this.onInvalidated(()=>clearTimeout(n)),n}requestAnimationFrame(e){let t=requestAnimationFrame((...t)=>{this.isValid&&e(...t)});return this.onInvalidated(()=>cancelAnimationFrame(t)),t}requestIdleCallback(e,t){let n=requestIdleCallback((...t)=>{this.signal.aborted||e(...t)},t);return this.onInvalidated(()=>cancelIdleCallback(n)),n}addEventListener(e,t,n,r){t===`wxt:locationchange`&&this.isValid&&this.locationWatcher.run(),e.addEventListener?.(t.startsWith(`wxt:`)?U(t):t,n,{...r,signal:this.signal})}notifyInvalidated(){this.abort(`Content script context invalidated`),d.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){document.dispatchEvent(new CustomEvent(e.SCRIPT_STARTED_MESSAGE_TYPE,{detail:{contentScriptName:this.contentScriptName,messageId:this.id}})),window.postMessage({type:e.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:this.id},`*`)}verifyScriptStartedEvent(e){let t=e.detail?.contentScriptName===this.contentScriptName,n=e.detail?.messageId===this.id;return t&&!n}listenForNewerScripts(){let t=e=>{!(e instanceof CustomEvent)||!this.verifyScriptStartedEvent(e)||this.notifyInvalidated()};document.addEventListener(e.SCRIPT_STARTED_MESSAGE_TYPE,t),this.onInvalidated(()=>document.removeEventListener(e.SCRIPT_STARTED_MESSAGE_TYPE,t))}},q={debug:(...e)=>([...e],void 0),log:(...e)=>([...e],void 0),warn:(...e)=>([...e],void 0),error:(...e)=>([...e],void 0)};return(async()=>{try{let{main:e,...t}=V;return await e(new K(`floating-button`,t))}catch(e){throw q.error(`The content script "floating-button" crashed on startup!`,e),e}})()})();
floatingButton;