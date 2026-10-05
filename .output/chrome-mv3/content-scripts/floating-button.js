var floatingButton=(function(){var e=Object.create,t=Object.defineProperty,n=Object.getOwnPropertyDescriptor,r=Object.getOwnPropertyNames,i=Object.getPrototypeOf,a=Object.prototype.hasOwnProperty,o=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports),s=(e,i,o,s)=>{if(i&&typeof i==`object`||typeof i==`function`)for(var c=r(i),l=0,u=c.length,d;l<u;l++)d=c[l],!a.call(e,d)&&d!==o&&t(e,d,{get:(e=>i[e]).bind(null,d),enumerable:!(s=n(i,d))||s.enumerable});return e},c=(n,r,a)=>(a=n==null?{}:e(i(n)),s(r||!n||!n.__esModule?t(a,`default`,{value:n,enumerable:!0}):a,n));function l(e){return e}var u=globalThis.browser?.runtime?.id?globalThis.browser:globalThis.chrome,d={debug:(...e)=>([...e],void 0),log:(...e)=>([...e],void 0),warn:(...e)=>([...e],void 0),error:(...e)=>([...e],void 0)},f=Symbol(`null`),p=0,m=class extends Map{constructor(){super(),this._objectHashes=new WeakMap,this._symbolHashes=new Map,this._publicKeys=new Map;let[e]=arguments;if(e!=null){if(typeof e[Symbol.iterator]!=`function`)throw TypeError(typeof e+` is not iterable (cannot read property Symbol(Symbol.iterator))`);for(let[t,n]of e)this.set(t,n)}}_getPublicKeys(e,t=!1){if(!Array.isArray(e))throw TypeError(`The keys parameter must be an array`);let n=this._getPrivateKey(e,t),r;return n&&this._publicKeys.has(n)?r=this._publicKeys.get(n):t&&(r=[...e],this._publicKeys.set(n,r)),{privateKey:n,publicKey:r}}_getPrivateKey(e,t=!1){let n=[];for(let r of e){r===null&&(r=f);let e=typeof r==`object`||typeof r==`function`?`_objectHashes`:typeof r==`symbol`?`_symbolHashes`:!1;if(!e)n.push(r);else if(this[e].has(r))n.push(this[e].get(r));else if(t){let t=`@@mkm-ref-${p++}@@`;this[e].set(r,t),n.push(t)}else return!1}return JSON.stringify(n)}set(e,t){let{publicKey:n}=this._getPublicKeys(e,!0);return super.set(n,t)}get(e){let{publicKey:t}=this._getPublicKeys(e);return super.get(t)}has(e){let{publicKey:t}=this._getPublicKeys(e);return super.has(t)}delete(e){let{publicKey:t,privateKey:n}=this._getPublicKeys(e);return!!(t&&super.delete(t)&&this._publicKeys.delete(n))}clear(){super.clear(),this._symbolHashes.clear(),this._publicKeys.clear()}get[Symbol.toStringTag](){return`ManyKeysMap`}get size(){return super.size}};function h(e){if(typeof e!=`object`||!e)return!1;let t=Object.getPrototypeOf(e);return t!==null&&t!==Object.prototype&&Object.getPrototypeOf(t)!==null||Symbol.iterator in e?!1:Symbol.toStringTag in e?Object.prototype.toString.call(e)===`[object Module]`:!0}function g(e,t,n=`.`,r){if(!h(t))return g(e,{},n,r);let i=Object.assign({},t);for(let t in e){if(t===`__proto__`||t===`constructor`)continue;let a=e[t];a!=null&&(r&&r(i,t,a,n)||(Array.isArray(a)&&Array.isArray(i[t])?i[t]=[...a,...i[t]]:h(a)&&h(i[t])?i[t]=g(a,i[t],(n?`${n}.`:``)+t.toString(),r):i[t]=a))}return i}function _(e){return(...t)=>t.reduce((t,n)=>g(t,n,``,e),{})}var v=_(),y=e=>e===null?{isDetected:!1}:{isDetected:!0,result:e},b=e=>e===null?{isDetected:!0,result:null}:{isDetected:!1},x=()=>({target:globalThis.document,unifyProcess:!0,detector:y,observeConfigs:{childList:!0,subtree:!0,attributes:!0},signal:void 0,customMatcher:void 0}),S=(e,t)=>v(e,t),C=new m;function w(e){let{defaultOptions:t}=e;return(e,n)=>{let{target:r,unifyProcess:i,observeConfigs:a,detector:o,signal:s,customMatcher:c}=S(n,t),l=[e,r,i,a,o,s,c],u=C.get(l);if(i&&u)return u;let d=new Promise(async(t,n)=>{if(s?.aborted)return n(s.reason);let i=new MutationObserver(async n=>{for(let a of n){if(s?.aborted){i.disconnect();break}let n=await T({selector:e,target:r,detector:o,customMatcher:c});if(n.isDetected){i.disconnect(),t(n.result);break}}});s?.addEventListener(`abort`,()=>(i.disconnect(),n(s.reason)),{once:!0});let l=await T({selector:e,target:r,detector:o,customMatcher:c});if(l.isDetected)return t(l.result);i.observe(r,a)}).finally(()=>{C.delete(l)});return C.set(l,d),d}}async function T({target:e,selector:t,detector:n,customMatcher:r}){return await n(r?r(t):e.querySelector(t))}var E=w({defaultOptions:x()});function D(e,t,n){n.position!==`inline`&&(n.zIndex!=null&&(e.style.zIndex=String(n.zIndex)),e.style.overflow=`visible`,e.style.position=`relative`,e.style.width=`0`,e.style.height=`0`,e.style.display=`block`,t&&(n.position===`overlay`?(t.style.position=`absolute`,n.alignment?.startsWith(`bottom-`)?t.style.bottom=`0`:t.style.top=`0`,n.alignment?.endsWith(`-right`)?t.style.right=`0`:t.style.left=`0`):(t.style.position=`fixed`,t.style.top=`0`,t.style.bottom=`0`,t.style.left=`0`,t.style.right=`0`)))}function O(e){if(e.anchor==null)return document.body;let t=typeof e.anchor==`function`?e.anchor():e.anchor;return typeof t==`string`?t.startsWith(`/`)?document.evaluate(t,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue??void 0:document.querySelector(t)??void 0:t??void 0}function k(e,t){let n=O(t);if(n==null)throw Error(`Failed to mount content script UI: could not find anchor element`);switch(t.append){case void 0:case`last`:n.append(e);break;case`first`:n.prepend(e);break;case`replace`:n.replaceWith(e);break;case`after`:n.parentElement?.insertBefore(e,n.nextElementSibling);break;case`before`:n.parentElement?.insertBefore(e,n);break;default:t.append(n,e)}}function A(e,t){let n,r=()=>{n?.stopAutoMount(),n=void 0},i=()=>{e.mount()},a=e.remove;return{mount:i,remove:()=>{r(),e.remove()},autoMount:e=>{n&&d.warn(`autoMount is already set.`),n=j({mount:i,unmount:a,stopAutoMount:r},{...t,...e})}}}function j(e,t){let n=new AbortController,r=`explicit_stop_auto_mount`,i=()=>{n.abort(r),t.onStop?.()},a=typeof t.anchor==`function`?t.anchor():t.anchor;if(a instanceof Element)throw Error("autoMount and Element anchor option cannot be combined. Avoid passing `Element` directly or `() => Element` to the anchor.");async function o(i){let a=!!O(t);for(a&&e.mount();!n.signal.aborted;)try{a=!!await E(i??`body`,{customMatcher:()=>O(t)??null,detector:a?b:y,signal:n.signal}),a?e.mount():(e.unmount(),t.once&&e.stopAutoMount())}catch(e){if(n.signal.aborted&&n.signal.reason===r)break;throw e}}return o(a),{stopAutoMount:i}}var M=/(\s*@(property|font-face)[\s\S]*?{[\s\S]*?})/gm;function N(e){return{documentCss:Array.from(e.matchAll(M),e=>e[0]).join(``).trim(),shadowCss:e.replace(M,``).trim()}}var P=c(o(((e,t)=>{var n=/^[a-z](?:[\.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*-(?:[\x2D\.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]|[\uD800-\uDB7F][\uDC00-\uDFFF])*$/;t.exports=function(e){return n.test(e)}}))(),1),F=(e,t,n)=>new Promise((r,i)=>{var a=e=>{try{s(n.next(e))}catch(e){i(e)}},o=e=>{try{s(n.throw(e))}catch(e){i(e)}},s=e=>e.done?r(e.value):Promise.resolve(e.value).then(a,o);s((n=n.apply(e,t)).next())}),I=[`article`,`aside`,`blockquote`,`body`,`div`,`footer`,`h1`,`h2`,`h3`,`h4`,`h5`,`h6`,`header`,`main`,`nav`,`p`,`section`,`span`];function L(e){return F(this,null,function*(){let{name:t,mode:n=`closed`,css:r,isolateEvents:i=!1}=e;if(!I.includes(t)&&!(0,P.default)(t))throw Error(`"${t}" cannot have a shadow root attached to it. It must be two words and kebab-case, with a few exceptions. See https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#elements_you_can_attach_a_shadow_to`);let a=document.createElement(t),o=a.attachShadow({mode:n}),s=document.createElement(`html`),c=document.createElement(`body`),l=document.createElement(`head`);if(r){let e=document.createElement(`style`);`url`in r?e.textContent=yield fetch(r.url).then(e=>e.text()):e.textContent=r.textContent,l.appendChild(e)}return s.appendChild(l),s.appendChild(c),o.appendChild(s),i&&(Array.isArray(i)?i:[`keydown`,`keyup`,`keypress`]).forEach(e=>{c.addEventListener(e,e=>e.stopPropagation())}),{parentElement:a,shadow:o,isolatedElement:c}})}async function R(e,t){let n=Math.random().toString(36).substring(2,15),r=[];if(t.inheritStyles||r.push(`/* WXT Shadow Root Reset */ :host{all:initial !important;}`),t.css&&r.push(t.css),e.options?.cssInjectionMode===`ui`){let e=await z();r.push(e.replaceAll(`:root`,`:host`))}let{shadowCss:i,documentCss:a}=N(r.join(`
`).trim()),{isolatedElement:o,parentElement:s,shadow:c}=await L({name:t.name,css:{textContent:i},mode:t.mode??`open`,isolateEvents:t.isolateEvents}),l,u=()=>{if(k(s,t),D(s,c.querySelector(`html`),t),a&&!document.querySelector(`style[wxt-shadow-root-document-styles="${n}"]`)){let e=document.createElement(`style`);e.textContent=a,e.setAttribute(`wxt-shadow-root-document-styles`,n),(document.head??document.body).append(e)}l=t.onMount(o,c,s)},d=()=>{for(t.onRemove?.(l),s.remove(),document.querySelector(`style[wxt-shadow-root-document-styles="${n}"]`)?.remove();o.lastChild;)o.removeChild(o.lastChild);l=void 0},f=A({mount:u,remove:d},t);return e.onInvalidated(d),{shadow:c,shadowHost:s,uiContainer:o,...f,get mounted(){return l}}}async function z(){let e=u.runtime.getURL(`/content-scripts/floating-button.css`);try{return await(await fetch(e)).text()}catch(t){return d.warn(`Failed to load styles @ ${e}. Did you forget to import the stylesheet in your entrypoint?`,t),``}}function B(){try{return`
      @font-face {
        font-family: 'Caveat';
        src: url('${u.runtime.getURL(`/fonts/Caveat/Caveat-VariableFont_wght.ttf`)}') format('truetype');
        font-weight: 100 900;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Nunito';
        src: url('${u.runtime.getURL(`/fonts/Nunito/Nunito-VariableFont_wght.ttf`)}') format('truetype');
        font-weight: 100 900;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'Nunito';
        src: url('${u.runtime.getURL(`/fonts/Nunito/Nunito-Italic-VariableFont_wght.ttf`)}') format('truetype');
        font-weight: 100 900;
        font-style: italic;
        font-display: swap;
      }
    `}catch{return``}}function V(){return`<svg style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;" aria-hidden="true">
    <defs>
      <filter id="rough" x="-3%" y="-6%" width="106%" height="112%">
        <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2"/>
      </filter>
    </defs>
  </svg>`}function H(){return`
${B()}

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
textarea { resize: none; }
textarea::-webkit-resizer { display: none; }
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
.askpage-panel.closing {
  animation: fall .22s cubic-bezier(.4, 0, 1, 1) forwards !important;
  pointer-events: none;
}
@keyframes rise { from { opacity: 0; transform: translateY(14px) rotate(.6deg); } }
@keyframes fall {
  from { opacity: 1; transform: translateY(0) rotate(0deg); }
  to { opacity: 0; transform: translateY(16px) rotate(1deg) scale(0.96); }
}
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
  width: 100%; border: 0; background: none; resize: none !important; outline: 0;
  font: 14px/1.55 var(--font); color: inherit;
  max-height: 90px; display: block;
}
.askpage-input::-webkit-resizer { display: none; }
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

/* Floating button */
#browserbot-floating-btn {
  position: fixed; right: 14px; bottom: 80px; width: 40px; height: 40px;
  border-radius: 14px 10px 14px 10px / 10px 14px 10px 14px;
  background: var(--ac); border: 2px solid var(--bd); box-shadow: 3px 3px 0 var(--bd);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; z-index: 2147483645;
  transition: transform .35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity .25s ease, filter .15s;
}
#browserbot-floating-btn:hover:not(.panel-open) { transform: scale(1.08) rotate(-4deg); }
#browserbot-floating-btn svg { width: 20px; height: 20px; color: var(--acfg); }

/* Hidden smoothly when Ask Page panel is open */
#browserbot-floating-btn.panel-open {
  opacity: 0 !important;
  pointer-events: none !important;
  transform: scale(0.3) rotate(-15deg) !important;
  visibility: hidden;
  transition: transform .22s ease-in, opacity .18s ease-in, visibility 0s .22s;
}

#browserbot-floating-btn:not(.panel-open) {
  opacity: 1;
  visibility: visible;
  transition: transform .38s cubic-bezier(0.34, 1.56, 0.64, 1), opacity .25s ease;
}

#browserbot-floating-btn.hidden:not(.panel-open) {
  opacity: 0.35;
  transform: scale(0.88);
}
#browserbot-floating-btn.hidden:hover:not(.panel-open) {
  opacity: 1;
  transform: scale(1.08) rotate(-4deg);
}

@media (max-width: 480px) {
  .askpage-panel { left: 8px; right: 8px; bottom: 8px; width: auto; max-width: none; }
}
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
`}var U=l({matches:[`<all_urls>`],cssInjectionMode:`manual`,runAt:`document_idle`,async main(e){let t=!1,n=null,r=!0,i=!1;function a(e){i=e,n&&(e?n.classList.add(`panel-open`):(n.classList.remove(`panel-open`),n.classList.remove(`hidden`)))}window.addEventListener(`browserbot-ask-page-state`,e=>{a(!!e.detail?.open)});let o=new MutationObserver(()=>{let e=!!document.querySelector(`browserbot-ask-page`);e!==i&&a(e)});if(document.body?o.observe(document.body,{childList:!0}):document.addEventListener(`DOMContentLoaded`,()=>{document.body&&o.observe(document.body,{childList:!0})}),r=await(async()=>{let e=await u.storage.local.get(`appState`);return e.appState?e.appState.askPageFloatingButton!==!1:!0})(),u.storage.onChanged.addListener((e,t)=>{if(t===`local`&&e.appState?.newValue){let t=e.appState.newValue,n=r;r=t.askPageFloatingButton!==!1,r&&!n?s():!r&&n&&c()}}),!r)return;async function s(){t||(t=!0,(await R(e,{name:`browserbot-floating-button`,position:`overlay`,zIndex:2147483645,css:``,onMount(e){let t=document.createElement(`style`);t.textContent=H();let r=e.getRootNode();r.appendChild(t);let a=document.createElement(`div`);a.innerHTML=V(),r.appendChild(a);let o=document.createElement(`div`);o.id=`browserbot-floating-btn`,o.innerHTML=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,(i||document.querySelector(`browserbot-ask-page`))&&(i=!0,o.classList.add(`panel-open`)),e.appendChild(o),n=o,l(o)},onRemove(){n=null}})).mount())}function c(){n&&(n.remove(),t=!1)}function l(e){let t=!1,n=!1,r=0,a=0,o=0,s=0,c=null,l=!1,u=localStorage.getItem(`browserbot-float-btn-pos`);if(u)try{let t=JSON.parse(u);e.style.right=`auto`,e.style.left=t.left+`px`,e.style.top=t.top+`px`,e.style.bottom=`auto`}catch{}e.addEventListener(`touchstart`,i=>{let c=i.touches[0];t=!0,n=!1,r=c.clientX,a=c.clientY;let l=e.getBoundingClientRect();o=l.left,s=l.top,e.classList.add(`dragging`),h(),_()},{passive:!0}),e.addEventListener(`touchmove`,i=>{if(!t)return;let c=i.touches[0],l=Math.abs(c.clientX-r),u=Math.abs(c.clientY-a);if((l>5||u>5)&&(n=!0),n){i.preventDefault();let t=o+(c.clientX-r),n=s+(c.clientY-a),l=Math.max(0,Math.min(window.innerWidth-48,t)),u=Math.max(0,Math.min(window.innerHeight-48,n));e.style.right=`auto`,e.style.left=l+`px`,e.style.top=u+`px`,e.style.bottom=`auto`}},{passive:!1}),e.addEventListener(`touchend`,r=>{if(t=!1,e.classList.remove(`dragging`),!n)d();else{let t=e.getBoundingClientRect();localStorage.setItem(`browserbot-float-btn-pos`,JSON.stringify({left:t.left,top:t.top})),f(e),p()}}),e.addEventListener(`mousedown`,i=>{i.preventDefault(),t=!0,n=!1,r=i.clientX,a=i.clientY;let c=e.getBoundingClientRect();o=c.left,s=c.top,e.classList.add(`dragging`),h(),_()}),document.addEventListener(`mousemove`,i=>{if(!t)return;let c=Math.abs(i.clientX-r),l=Math.abs(i.clientY-a);if((c>5||l>5)&&(n=!0),n){let t=o+(i.clientX-r),n=s+(i.clientY-a),c=Math.max(0,Math.min(window.innerWidth-48,t)),l=Math.max(0,Math.min(window.innerHeight-48,n));e.style.right=`auto`,e.style.left=c+`px`,e.style.top=l+`px`,e.style.bottom=`auto`}}),document.addEventListener(`mouseup`,r=>{if(t)if(t=!1,e.classList.remove(`dragging`),!n)d();else{let t=e.getBoundingClientRect();localStorage.setItem(`browserbot-float-btn-pos`,JSON.stringify({left:t.left,top:t.top})),f(e),p()}});function f(e){let t=e.getBoundingClientRect(),n=t.left+t.width/2,r=t.top+t.height/2;n<window.innerWidth/2?e.style.left=`8px`:e.style.left=window.innerWidth-56+`px`;let i=Math.max(8,Math.min(window.innerHeight-56,r-24));e.style.top=i+`px`,localStorage.setItem(`browserbot-float-btn-pos`,JSON.stringify({left:parseInt(e.style.left),top:i}))}function p(){l=!0,m()}function m(){l&&(h(),c=setTimeout(()=>{g()},3e3))}function h(){c&&=(clearTimeout(c),null)}function g(){e.classList.add(`hidden`)}function _(){i||(e.classList.remove(`hidden`),l&&m())}let v=null;window.addEventListener(`scroll`,()=>{i||(_(),v&&clearTimeout(v),v=setTimeout(()=>{l&&m()},1e3))},{passive:!0}),document.addEventListener(`touchstart`,t=>{if(i)return;let n=t.touches[0],r=e.getBoundingClientRect();n.clientX>=r.left-100&&n.clientX<=r.right+100&&n.clientY>=r.top-100&&n.clientY<=r.bottom+100&&_()},{passive:!0}),setTimeout(()=>{p()},5e3)}async function d(){a(!0);try{await u.runtime.sendMessage({type:`TOGGLE_ASK_PAGE`})}catch{try{await new Promise(e=>setTimeout(e,200)),await u.runtime.sendMessage({type:`TOGGLE_ASK_PAGE`})}catch{console.warn(`BrowserBot: Could not reach background script for TOGGLE_ASK_PAGE`),a(!1)}}}s()}}),W=class e extends Event{static EVENT_NAME=G(`wxt:locationchange`);constructor(t,n){super(e.EVENT_NAME,{}),this.newUrl=t,this.oldUrl=n}};function G(e){return`${u?.runtime?.id}:floating-button:${e}`}var K=typeof globalThis.navigation?.addEventListener==`function`;function q(e){let t,n=!1;return{run(){n||(n=!0,t=new URL(location.href),K?globalThis.navigation.addEventListener(`navigate`,e=>{let n=new URL(e.destination.url);n.href!==t.href&&(window.dispatchEvent(new W(n,t)),t=n)},{signal:e.signal}):e.setInterval(()=>{let e=new URL(location.href);e.href!==t.href&&(window.dispatchEvent(new W(e,t)),t=e)},1e3))}}}var J=class e{static SCRIPT_STARTED_MESSAGE_TYPE=G(`wxt:content-script-started`);id;abortController;locationWatcher=q(this);constructor(e,t){this.contentScriptName=e,this.options=t,this.id=Math.random().toString(36).slice(2),this.abortController=new AbortController,this.stopOldScripts(),this.listenForNewerScripts()}get signal(){return this.abortController.signal}abort(e){return this.abortController.abort(e)}get isInvalid(){return u.runtime?.id??this.notifyInvalidated(),this.signal.aborted}get isValid(){return!this.isInvalid}onInvalidated(e){return this.signal.addEventListener(`abort`,e),()=>this.signal.removeEventListener(`abort`,e)}block(){return new Promise(()=>{})}setInterval(e,t){let n=setInterval(()=>{this.isValid&&e()},t);return this.onInvalidated(()=>clearInterval(n)),n}setTimeout(e,t){let n=setTimeout(()=>{this.isValid&&e()},t);return this.onInvalidated(()=>clearTimeout(n)),n}requestAnimationFrame(e){let t=requestAnimationFrame((...t)=>{this.isValid&&e(...t)});return this.onInvalidated(()=>cancelAnimationFrame(t)),t}requestIdleCallback(e,t){let n=requestIdleCallback((...t)=>{this.signal.aborted||e(...t)},t);return this.onInvalidated(()=>cancelIdleCallback(n)),n}addEventListener(e,t,n,r){t===`wxt:locationchange`&&this.isValid&&this.locationWatcher.run(),e.addEventListener?.(t.startsWith(`wxt:`)?G(t):t,n,{...r,signal:this.signal})}notifyInvalidated(){this.abort(`Content script context invalidated`),d.debug(`Content script "${this.contentScriptName}" context invalidated`)}stopOldScripts(){document.dispatchEvent(new CustomEvent(e.SCRIPT_STARTED_MESSAGE_TYPE,{detail:{contentScriptName:this.contentScriptName,messageId:this.id}})),window.postMessage({type:e.SCRIPT_STARTED_MESSAGE_TYPE,contentScriptName:this.contentScriptName,messageId:this.id},`*`)}verifyScriptStartedEvent(e){let t=e.detail?.contentScriptName===this.contentScriptName,n=e.detail?.messageId===this.id;return t&&!n}listenForNewerScripts(){let t=e=>{!(e instanceof CustomEvent)||!this.verifyScriptStartedEvent(e)||this.notifyInvalidated()};document.addEventListener(e.SCRIPT_STARTED_MESSAGE_TYPE,t),this.onInvalidated(()=>document.removeEventListener(e.SCRIPT_STARTED_MESSAGE_TYPE,t))}},Y={debug:(...e)=>([...e],void 0),log:(...e)=>([...e],void 0),warn:(...e)=>([...e],void 0),error:(...e)=>([...e],void 0)};return(async()=>{try{let{main:e,...t}=U;return await e(new J(`floating-button`,t))}catch(e){throw Y.error(`The content script "floating-button" crashed on startup!`,e),e}})()})();
floatingButton;