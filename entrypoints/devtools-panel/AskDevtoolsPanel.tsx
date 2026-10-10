import { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';
import { AppStorage, OpenAIProvider, AIProviderType, ChatMsg, Conversation, generateUUID, DEFAULT_DEVTOOLS_SYSTEM_PROMPT } from '../../utils/storage';
import { DevtoolsSidebar } from './components/DevtoolsSidebar';
import { DevtoolsChatArea } from './components/DevtoolsChatArea';
import type { DevToolsConfig, DevToolsData } from './types';
import { inferInitiator } from './types';
import { devtoolsEval, getDevtoolsHAR, getInspectedTabId, reloadInspectedWindow } from '../../utils/devtoolsCompat';
import type { ParsedAIAction } from '../../utils/actionExecutor';
import { executeTabGroups, executeBookmarkPlan } from '../../utils/actionExecutor';
import { getBookmarkTree } from '../../utils/bookmarks';

marked.setOptions({ breaks: true, gfm: true });

const MARKDOWN_FORMAT_INSTRUCTION = '\n\nIMPORTANT: Always format your responses using markdown. Use headings, bullet points, code blocks, bold, italic, and other markdown features to make your responses well-structured and readable.';
const redactSecrets = (value: string) => value
  .replace(/(["']?(?:authorization|cookie|set-cookie|token|access_token|refresh_token|api[_-]?key|password|secret)["']?\s*[:=]\s*["']?)([^"'&,}\s]+)/gi, '$1[REDACTED]')
  .replace(/Bearer\s+[A-Za-z0-9._~+/-]+=*/gi, 'Bearer [REDACTED]');
const redactUrl = (value: string) => {
  try {
    const u = new URL(value);
    for (const k of [...u.searchParams.keys()]) if (/token|key|secret|auth|session|code|email/i.test(k)) u.searchParams.set(k, '[REDACTED]');
    return u.toString();
  } catch { return value; }
};
const safeJson = (value: unknown) => JSON.stringify(value, (_key, item) => typeof item === 'string' ? (item.startsWith('http://') || item.startsWith('https://') ? redactUrl(item) : redactSecrets(item)) : item);
const sanitizeMarkdownHtml = (html: string) => {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const allowed = new Set(['P', 'BR', 'STRONG', 'EM', 'DEL', 'BLOCKQUOTE', 'UL', 'OL', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'CODE', 'PRE', 'DIV', 'BUTTON', 'A', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'HR']);
  const visit = (node: ParentNode) => {
    for (const child of Array.from(node.childNodes)) {
      if (child instanceof HTMLElement) {
        if (!allowed.has(child.tagName)) { child.replaceWith(document.createTextNode(child.textContent || '')); continue; }
        for (const attr of Array.from(child.attributes)) {
          if (attr.name === 'class' || attr.name === 'title') continue;
          if (child.tagName === 'A' && attr.name === 'href' && /^(https?:|mailto:)/i.test(attr.value)) continue;
          child.removeAttribute(attr.name);
        }
        if (child.tagName === 'A' && !child.getAttribute('href')) child.removeAttribute('href');
        visit(child);
      } else if (child instanceof Element) {
        child.replaceWith(document.createTextNode(child.textContent || ''));
      }
    }
  };
  visit(parsed.body);
  return parsed.body.innerHTML;
};

export default function AskDevtoolsPanel() {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [providerType, setProviderType] = useState<AIProviderType>('openai');
  const [openaiProviders, setOpenaiProviders] = useState<OpenAIProvider[]>([]);
  const [selectedOpenAIId, setSelectedOpenAIId] = useState('');
  const [ollamaModel, setOllamaModel] = useState('');

  const [thinkingContent, setThinkingContent] = useState('');
  const [thinkingExpanded, setThinkingExpanded] = useState(false);
  const [devtoolsSystemPrompt, setDevtoolsSystemPrompt] = useState('');

  // Opt-in Copy-Paste AI state
  const [copyPasteUnlocked, setCopyPasteUnlocked] = useState(false);
  const [copyPasteUnlockCommand, setCopyPasteUnlockCommand] = useState('/unlockMySecrets3038');

  // DevTools specific state
  const [config, setConfig] = useState<DevToolsConfig>({
    console: true,
    network: true,
    dom: true,
    performance: true,
    networkHeaders: true,
    networkCookies: true,
    networkPayload: true,
    networkResponseBody: false,
    networkDisplayMode: 'summary',
    includeHtml: false,
    includeCss: false,
    includeJs: false,
    cookieValues: false,
    allowLargeBodies: false,
    webVitals: true,
    storage: true,
    storageValues: false,
    cookies: true,
    screenshots: false,
    liveConsole: false,
    pwa: true,
    security: true,
    eventListeners: false,
    matchedStyles: false,
    accessibilityTree: false,
  });
  
  const [capturedData, setCapturedData] = useState<DevToolsData | null>(null);
  const [savedCaptureContext, setSavedCaptureContext] = useState('');
  const [captureStatus, setCaptureStatus] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);

  // Granular Context State
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());
  const [selectedNetworkIds, setSelectedNetworkIds] = useState<Set<string>>(new Set());
  const [includeDom, setIncludeDom] = useState(true);
  const [includePerf, setIncludePerf] = useState(true);
  const [networkFilter, setNetworkFilter] = useState('');
  
  // Chat history
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [historySearch, setHistorySearch] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamingContentRef = useRef('');
  const streamingThinkingRef = useRef('');
  const sessionIdRef = useRef<string>(generateUUID());
  const harEntriesRef = useRef<any[]>([]);
  const requestCacheRef = useRef<any[]>([]);
  const liveConsoleCleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!config.liveConsole) return;
    if (liveConsoleCleanupTimerRef.current) {
      clearTimeout(liveConsoleCleanupTimerRef.current);
      liveConsoleCleanupTimerRef.current = null;
    }
    let cancelled = false;
    const install = `(() => {
      try {
        if (window.__browserbotLiveConsole?.installed) return 'already-installed';
        const records = window.__browserbotLiveLogs = window.__browserbotLiveLogs || [];
        const stringify = value => {
          try {
            if (value instanceof Error) return value.message + (value.stack ? '\\n' + value.stack : '');
            if (typeof value === 'object' && value !== null) return JSON.stringify(value, (k, v) => typeof v === 'function' ? '[Function]' : v);
            return String(value);
          } catch (_) { return '[Unserializable]'; }
        };
        const push = (level, text, stack = '') => {
          records.push({ ts: Date.now(), level, text: String(text).slice(0, 4000), stack: String(stack).slice(0, 6000) });
          if (records.length > 200) records.splice(0, records.length - 200);
        };
        const originals = {};
        const wrappers = {};
        for (const level of ['log', 'info', 'warn', 'error', 'debug']) {
          originals[level] = console[level];
          wrappers[level] = function(...args) {
            push(level, args.map(stringify).join(' '), args.find(a => a instanceof Error)?.stack || '');
            return originals[level]?.apply(this, args);
          };
          console[level] = wrappers[level];
        }
        const onError = event => push('error', event.message || 'JavaScript error', event.error?.stack || '');
        const onRejection = event => push('error', 'Unhandled Promise: ' + stringify(event.reason), event.reason?.stack || '');
        window.addEventListener('error', onError);
        window.addEventListener('unhandledrejection', onRejection);
        window.__browserbotLiveConsole = { installed: true, originals, wrappers, onError, onRejection };
        return 'installed';
      } catch (error) { return 'error:' + String(error); }
    })()`;
    devtoolsEval<string>(install).then(({ result, exception: exceptionInfo }) => {
      if (cancelled) return;
      if (exceptionInfo?.unsupported) {
        setCaptureStatus('Live console unavailable: the DevTools inspection API is not exposed in this browser.');
        return;
      }
      if (exceptionInfo?.isException || exceptionInfo?.code) {
        const message = exceptionInfo.description || exceptionInfo.value || 'inspection was blocked';
        const detail = /cannot access a chrome-extension:\/\//i.test(String(message))
          ? 'Chrome blocks this extension from inspecting another extension page.'
          : message;
        setCaptureStatus(`Live console unavailable: ${detail}`);
      } else if (typeof result === 'string' && result.startsWith('error:')) {
        setCaptureStatus(`Live console unavailable: ${result.slice(6)}`);
      } else {
        setCaptureStatus('Live console enabled. New console calls will be captured without reloading.');
      }
    });
    return () => {
      cancelled = true;
      // React StrictMode mounts, cleans up, then mounts effects again in development.
      // Delay restoration briefly so that remount can cancel it instead of racing install.
      liveConsoleCleanupTimerRef.current = setTimeout(() => {
        devtoolsEval(`(() => {
          const state = window.__browserbotLiveConsole;
          if (!state?.installed) return;
          for (const level of Object.keys(state.wrappers)) if (console[level] === state.wrappers[level]) console[level] = state.originals[level];
          window.removeEventListener('error', state.onError);
          window.removeEventListener('unhandledrejection', state.onRejection);
          delete window.__browserbotLiveConsole;
        })()`).catch(() => null);
        liveConsoleCleanupTimerRef.current = null;
      }, 250);
    };
  }, [config.liveConsole]);

  useEffect(() => {
    const onReq = (req: any) => requestCacheRef.current.push(req);
    // Stale HAR entries from a previous page must never leak into a new
    // capture's details view (F-16).
    const onNavigated = () => { harEntriesRef.current = []; requestCacheRef.current = []; };
    const network = (browser as any).devtools?.network;
    if (network?.onRequestFinished) network.onRequestFinished.addListener(onReq);
    if (network?.onNavigated) network.onNavigated.addListener(onNavigated);
    return () => {
      try { if (network?.onRequestFinished) network.onRequestFinished.removeListener(onReq); } catch (_) {}
      try { if (network?.onNavigated) network.onNavigated.removeListener(onNavigated); } catch (_) {}
    };
  }, []);

  useEffect(() => {
    AppStorage.get().then(state => {
      setProviderType(state.activeProvider);
      setOpenaiProviders(state.openaiProviders);
      setSelectedOpenAIId(state.activeOpenAIProviderId);
      setOllamaModel(state.ollamaModel);
      setDevtoolsSystemPrompt(state.askDevToolsSystemPrompt);
      setCopyPasteUnlocked(state.copyPasteUnlocked ?? false);
      setCopyPasteUnlockCommand(state.copyPasteUnlockCommand || '/unlockMySecrets3038');
    });

    const handleStorageChange = (changes: any, area: string) => {
      if (area === 'local' && changes.appState?.newValue) {
        const state = changes.appState.newValue;
        if (state.copyPasteUnlocked !== undefined) setCopyPasteUnlocked(state.copyPasteUnlocked);
        if (state.copyPasteUnlockCommand) setCopyPasteUnlockCommand(state.copyPasteUnlockCommand);
      }
    };
    browser.storage.onChanged.addListener(handleStorageChange);
    return () => browser.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  useEffect(() => {
    const listener = (message: any) => {
      if (message.sessionId && message.sessionId !== sessionIdRef.current) return;
      if (message.type === 'ASK_PAGE_CHAT_CHUNK') {
        streamingContentRef.current += message.chunk;
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = { ...updated[lastIdx], content: streamingContentRef.current };
          }
          return updated;
        });
      } else if (message.type === 'ASK_PAGE_CHAT_THINKING') {
        streamingThinkingRef.current += message.chunk;
        setThinkingContent(streamingThinkingRef.current);
        setThinkingExpanded(true);
      } else if (message.type === 'ASK_PAGE_CHAT_DONE') {
        const savedThinking = streamingThinkingRef.current;
        const finalContent = streamingContentRef.current;
        setMessages(prev => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: finalContent || updated[lastIdx].content,
              thinking: savedThinking || updated[lastIdx].thinking
            };
          }
          return updated;
        });
        setIsStreaming(false);
        setThinkingExpanded(false);
        streamingContentRef.current = '';
        streamingThinkingRef.current = '';
        setThinkingContent('');
      } else if (message.type === 'ASK_PAGE_CHAT_ERROR') {
        setIsStreaming(false);
        streamingContentRef.current = '';
        streamingThinkingRef.current = '';
        setThinkingContent('');
        setMessages(prev => {
          const lastIdx = prev.length - 1;
          const updated = (lastIdx >= 0 && prev[lastIdx].role === 'assistant' && !prev[lastIdx].content)
            ? prev.slice(0, lastIdx)
            : prev;
          return [...updated, { role: 'error', content: message.error || 'Failed to generate response' }];
        });
      }
    };
    browser.runtime.onMessage.addListener(listener);
    loadConversations();
    return () => browser.runtime.onMessage.removeListener(listener);
  }, []);

  const loadConversations = () => {
    browser.runtime.sendMessage({ type: 'LOAD_CONVERSATIONS' }).then((data: any) => {
      if (Array.isArray(data)) setConversations(data.filter((c: any) => c.title.startsWith('[DevTools]')));
    }).catch(() => {});
  };

  const saveCurrentConversation = async () => {
    if (messages.length === 0) return;
    const firstUserMsg = messages.find(m => m.role === 'user');
    const title = '[DevTools] ' + (firstUserMsg?.content.slice(0, 80) || 'New Chat');
    const conversation: Conversation = {
      id: activeConversationId || generateUUID(),
      title,
      createdAt: activeConversationId ? (conversations.find(c => c.id === activeConversationId)?.createdAt || Date.now()) : Date.now(),
      updatedAt: Date.now(),
      pageUrl: 'DevTools',
      pageTitle: 'DevTools',
      messages: messages,
      devtoolsCapture: getPersistedCapture(),
      devtoolsContext: capturedData ? (savedCaptureContext || await buildContextData()) : undefined,
      devtoolsConfig: capturedData ? config : undefined,
      devtoolsSelection: capturedData ? { logIds: [...selectedLogIds], networkIds: [...selectedNetworkIds], dom: includeDom, performance: includePerf } : undefined,
    };
    if (!activeConversationId) {
      setActiveConversationId(conversation.id);
    }
    browser.runtime.sendMessage({ type: 'SAVE_CONVERSATION', conversation }).then((saved: boolean) => {
      if (saved) loadConversations();
      else setCaptureStatus('Conversation could not be saved within local storage limits. Remove older conversations or large captures.');
    }).catch(() => setCaptureStatus('Conversation could not be saved.'));
  };

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (messages.length === 0 || isStreaming) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveCurrentConversation(), 1000);
  }, [messages, isStreaming, capturedData, config, includeDom, includePerf, selectedLogIds, selectedNetworkIds]);

  const startNewChat = () => {
    setMessages([]);
    setCapturedData(null);
    setSavedCaptureContext('');
    harEntriesRef.current = [];
    setActiveConversationId(null);
    sessionIdRef.current = generateUUID();
    streamingContentRef.current = '';
    setShowHistory(false);
  };

  const loadConversation = (conv: Conversation) => {
    setMessages(conv.messages);
    setCapturedData(conv.devtoolsCapture || null);
    setSavedCaptureContext(conv.devtoolsContext || '');
    if (conv.devtoolsConfig) setConfig(conv.devtoolsConfig);
    harEntriesRef.current = [];
    setSelectedLogIds(new Set(conv.devtoolsSelection?.logIds || (conv.devtoolsCapture?.logs || []).map((l: any) => l.id)));
    setSelectedNetworkIds(new Set(conv.devtoolsSelection?.networkIds || (conv.devtoolsCapture?.network || []).map((n: any) => n.id)));
    setIncludeDom(conv.devtoolsSelection?.dom ?? !!conv.devtoolsCapture?.dom);
    setIncludePerf(conv.devtoolsSelection?.performance ?? !!conv.devtoolsCapture?.performance);
    setActiveConversationId(conv.id);
    setShowHistory(false);
  };

  const deleteConversation = async (id: string) => {
    await browser.runtime.sendMessage({ type: 'DELETE_CONVERSATION', id });
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) startNewChat();
  };

  const clearConversation = () => {
    setMessages([]);
    setActiveConversationId(null);
    streamingContentRef.current = '';
  };

  const updateConfig = (next: DevToolsConfig) => {
    setConfig(next);
    setSavedCaptureContext('');
  };

  const getPersistedCapture = (): DevToolsData | undefined => {
    if (!capturedData) return undefined;
    // Deep clone must never throw on unexpected shapes (e.g. CDP payloads
    // with circular refs) — fall back to a shallow copy instead (F-09).
    let copy: DevToolsData;
    try {
      copy = JSON.parse(JSON.stringify(capturedData)) as DevToolsData;
    } catch {
      copy = { ...capturedData };
    }
    if (!config.storageValues && copy.storage) for (const area of ['localStorage', 'sessionStorage']) for (const item of Object.values(copy.storage[area] || {}) as any[]) delete item.value;
    if (!config.cookieValues) copy.cookies = copy.cookies?.map(c => { const item = { ...c }; delete item.value; return item; });
    if (!config.screenshots) delete copy.screenshot;
    if (!config.eventListeners && copy.dom) delete copy.dom.listeners;
    return copy;
  };

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => scrollToBottom(), [messages, thinkingContent, scrollToBottom]);

  const injectLogger = () => {
    const script = `
      window.__browserbotLogs = window.__browserbotLogs || [];
      const _log = console.log, _warn = console.warn, _error = console.error;
      const safeStr = (o) => {
        try {
          if (o instanceof Error) return o.message + (o.stack ? '\\n' + o.stack : '');
          if (typeof o === 'object') return JSON.stringify(o, (k,v) => typeof v === 'function' ? '[Function]' : v);
          return String(o);
        } catch(e) { return '[Unserializable]'; }
      };
      console.log = function(...args) { window.__browserbotLogs.push({ ts: Date.now(), level: 'log', text: args.map(safeStr).join(' ').slice(0,4000) }); if(window.__browserbotLogs.length>500)window.__browserbotLogs.shift(); _log.apply(console, args); };
      console.warn = function(...args) { window.__browserbotLogs.push({ ts: Date.now(), level: 'warn', text: args.map(safeStr).join(' ').slice(0,4000) }); if(window.__browserbotLogs.length>500)window.__browserbotLogs.shift(); _warn.apply(console, args); };
      console.error = function(...args) { window.__browserbotLogs.push({ ts: Date.now(), level: 'error', text: args.map(safeStr).join(' ').slice(0,4000), stack: args[0] && args[0].stack ? String(args[0].stack).slice(0,6000) : '' }); if(window.__browserbotLogs.length>500)window.__browserbotLogs.shift(); _error.apply(console, args); };
      window.addEventListener('error', (e) => window.__browserbotLogs.push({ ts: Date.now(), level: 'error', text: String(e.message).slice(0,4000), stack: String(e.error?.stack||'').slice(0,6000) }));
      window.addEventListener('unhandledrejection', (e) => window.__browserbotLogs.push({ ts: Date.now(), level: 'error', text: ('Unhandled Promise: ' + String(e.reason)).slice(0,4000) }));
    `;
    reloadInspectedWindow(script)
      .then(() => setCaptureStatus('Logger injected & page reloading.'))
      .catch((e: any) => setCaptureStatus(`Logger injection failed: ${e?.message || 'reload unavailable'}`));
  };

  const captureDevToolsData = async () => {
    setIsCapturing(true);
    setCaptureStatus('Capturing from DevTools...');
    // Never leak a previous page's HAR/request cache into this capture (F-16).
    harEntriesRef.current = [];
    requestCacheRef.current = [];
    try {
      const data: DevToolsData = { captureId: generateUUID() };
      let warning = '';
      const inspectedTabId = getInspectedTabId();

      const metaRes = (await devtoolsEval(`
          (function() {
            try {
              return {
                url: window.location.href,
                title: document.title,
                userAgent: navigator.userAgent,
                viewport: window.innerWidth + 'x' + window.innerHeight,
                framework: (window.angular || (window as any).ng ? 'Angular ' : '') + (window.React || (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ ? 'React ' : '') + ((window as any).__vue__ || (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__ ? 'Vue ' : ''),
                localKeys: Object.keys(localStorage || {}),
                sessionKeys: Object.keys(sessionStorage || {})
              };
            } catch(e) { return null; }
          })()
        `)).result;
      if (metaRes) data.metadata = metaRes;
      else warning += ' Inspected-page evaluation is unavailable, so page metadata could not be read.';

      if (config.storage) {
        await devtoolsEval(`(function(){try{
          const summarize=(s,include)=>{const out={};let budget=10000;for(let i=0;i<Math.min(s.length,100);i++){const k=s.key(i);const v=s.getItem(k)||'';const n=Math.min(512,budget,v.length);const sensitive=/token|secret|password|auth|session|cookie|key/i.test(k);out[k]={length:v.length,...(include&&!sensitive&&n>0?{value:v.slice(0,n)}:{})};if(include&&!sensitive)budget-=n;}return out;};
          window.__browserbotStorageSnapshot={localStorage:summarize(localStorage,${Boolean(config.storageValues)}),sessionStorage:summarize(sessionStorage,${Boolean(config.storageValues)}),indexedDB:[],cacheNames:[],quota:null};
          Promise.all([indexedDB.databases?indexedDB.databases():Promise.resolve([]),window.caches?caches.keys():Promise.resolve([]),navigator.storage?.estimate?navigator.storage.estimate():Promise.resolve(null)]).then(([db,cache,quota])=>{window.__browserbotStorageSnapshot.indexedDB=(db||[]).slice(0,50).map(x=>({name:x.name,version:x.version}));window.__browserbotStorageSnapshot.cacheNames=(cache||[]).slice(0,50);window.__browserbotStorageSnapshot.quota=quota?{usage:quota.usage,quota:quota.quota}:null;});
        }catch(e){window.__browserbotStorageSnapshot={error:String(e)}}})()`);
        await new Promise(resolve => setTimeout(resolve, 150));
        const storageRes = (await devtoolsEval<any>('window.__browserbotStorageSnapshot || null')).result;
        if (storageRes) data.storage = storageRes;
      }

      if (config.webVitals) {
        const vitals = (await devtoolsEval<any>(`(function(){try{
          window.__browserbotVitals=window.__browserbotVitals||{lcp:null,cls:0,inpCandidate:0,layoutShifts:[],longTasks:[],interactions:[]};
          if(!window.__browserbotVitalsObserver){window.__browserbotVitalsObserver=true;for(const type of ['largest-contentful-paint','layout-shift','longtask','event']){try{new PerformanceObserver(list=>{for(const e of list.getEntries()){if(type==='largest-contentful-paint')window.__browserbotVitals.lcp=Math.round(e.startTime);if(type==='layout-shift'&&!e.hadRecentInput){window.__browserbotVitals.layoutShifts.push({start:Math.round(e.startTime),value:e.value});window.__browserbotVitals.cls+=e.value;}if(type==='longtask')window.__browserbotVitals.longTasks.push({start:Math.round(e.startTime),duration:Math.round(e.duration)});if(type==='event'){window.__browserbotVitals.inpCandidate=Math.max(window.__browserbotVitals.inpCandidate,Math.round(e.duration));window.__browserbotVitals.interactions.push({name:e.name,duration:Math.round(e.duration),start:Math.round(e.startTime)});}}window.__browserbotVitals.layoutShifts=window.__browserbotVitals.layoutShifts.slice(-20);window.__browserbotVitals.longTasks=window.__browserbotVitals.longTasks.slice(-20);window.__browserbotVitals.interactions=window.__browserbotVitals.interactions.slice(-20);}).observe({type,buffered:true,durationThreshold:16});}catch(_){}}}
          const nav=performance.getEntriesByType('navigation')[0];
          return {...window.__browserbotVitals,navigation:nav?{responseStart:Math.round(nav.responseStart),domInteractive:Math.round(nav.domInteractive),loadEventEnd:Math.round(nav.loadEventEnd)}:null};
        }catch(e){return null}})()`)).result;
        if (vitals) data.vitals = vitals;
      }

      if (config.performance) {
        const perfRes = (await devtoolsEval(`
            (function() {
              try {
                const nav = performance.getEntriesByType('navigation')[0];
                // performance.memory is Chromium-only; null in Firefox
                const memory = performance.memory ? {
                  jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
                  totalJSHeapSize: performance.memory.totalJSHeapSize,
                  usedJSHeapSize: performance.memory.usedJSHeapSize
                } : null;
                const timing = performance.timing;
                let navData = null;
                if (nav) {
                  navData = {
                    loadEventEnd: nav.loadEventEnd,
                    domContentLoadedEventEnd: nav.domContentLoadedEventEnd,
                    responseEnd: nav.responseEnd,
                    requestStart: nav.requestStart,
                    domInteractive: nav.domInteractive
                  };
                } else if (timing) {
                  // Legacy PerformanceTiming fallback (deprecated but universal)
                  const start = timing.navigationStart;
                  navData = {
                    loadEventEnd: timing.loadEventEnd - start,
                    domContentLoadedEventEnd: timing.domContentLoadedEventEnd - start,
                    responseEnd: timing.responseEnd - start,
                    requestStart: timing.requestStart - start,
                    domInteractive: timing.domInteractive - start
                  };
                }
                // first-paint is Chromium-only; Firefox only exposes first-contentful-paint
                const paints = performance.getEntriesByType('paint').map(p => ({ name: p.name, startTime: Math.round(p.startTime) }));
                return {
                  navTiming: navData,
                  memory,
                  paints,
                  // Surface which fields are browser-limited so the AI is aware
                  browserNote: !performance.memory ? 'Firefox: memory metrics unavailable; first-paint entry absent (only first-contentful-paint exposed).' : null
                };
              } catch(e) { return null; }
            })()
          `)).result;
        if (perfRes) data.performance = perfRes;
      }

      if (config.dom) {
        // NOTE (F-04): `getEventListeners()` is a DevTools console helper and is
        // never defined in inspected-page context. Listener counts come from
        // the background CDP path (`DOMDebugger.getEventListeners`) below.
        const domRes = (await devtoolsEval<any>(`
            (function() {
              try {
                const el = $0;
                if (!el) return null;
                const rect = el.getBoundingClientRect();
                const style = getComputedStyle(el);
                const computedStyle = Object.fromEntries(['display','position','boxSizing','width','height','margin','padding','fontSize','fontFamily','lineHeight','color','backgroundColor','overflow','zIndex','flex','gridTemplateColumns'].map(k => [k, style[k]]));
                const selectorParts = []; let cursor = el;
                while (cursor && cursor.nodeType === 1 && selectorParts.length < 8) { let part = cursor.tagName.toLowerCase(); if (cursor.id) { part += '#' + cursor.id; selectorParts.unshift(part); break; } const same = Array.from(cursor.parentElement?.children || []).filter(x => x.tagName === cursor.tagName); if (same.length > 1) part += ':nth-of-type(' + (same.indexOf(cursor) + 1) + ')'; selectorParts.unshift(part); cursor = cursor.parentElement; }
                return {
                  tag: el.tagName,
                  id: el.id,
                  className: el.className,
                  text: el.textContent ? el.textContent.slice(0, 500) : '',
                  html: (() => { const clone = el.cloneNode(true); for (const input of Array.from(clone.querySelectorAll('input,textarea,select'))) { input.removeAttribute('value'); if ('value' in input) input.value = ''; } return clone.outerHTML.slice(0, 1000); })(),
                  attributes: Array.from(el.attributes).filter(a => a.name.toLowerCase() !== 'value' && !/token|secret|password|authorization/i.test(a.name)).map(a => ({name: a.name, value: a.value})),
                  rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
                  computedStyle,
                  accessibility: { role: el.getAttribute('role') || el.tagName.toLowerCase(), label: el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent?.trim().slice(0,160) || '' },
                  selector: selectorParts.join(' > ')
                };
              } catch(e) { return null; }
            })()
          `)).result;
        if (domRes) {
          data.dom = domRes;
          if ((config.matchedStyles || config.accessibilityTree || config.eventListeners) && domRes.selector) {
            try {
              const cdp = await browser.runtime.sendMessage({ type: 'GET_DEVTOOLS_ELEMENT_CDP', tabId: inspectedTabId, selector: domRes.selector, matchedStyles: config.matchedStyles, accessibilityTree: config.accessibilityTree, eventListeners: config.eventListeners });
              if (cdp?.matchedStyles) data.dom.matchedStyles = cdp.matchedStyles;
              if (cdp?.accessibilityTree) data.dom.accessibilityTree = cdp.accessibilityTree;
              if (cdp?.listeners) data.dom.listeners = cdp.listeners;
              if (cdp?.listenersNote && config.eventListeners && !cdp?.listeners) data.dom.listenersNote = cdp.listenersNote;
              if (cdp?.unsupported) data.dom.cdpNote = cdp.unsupported;
              if (cdp?.error) data.dom.cdpNote = cdp.error;
            } catch (_) { data.dom.cdpNote = 'CDP capture unavailable for this browser/target.'; }
          } else if (config.eventListeners) {
            data.dom.listenersNote = 'Event-listener inspection needs the Chrome debugger path and a selected element.';
          }
        }
      }

      if (config.network || config.security) {
        const harLog = await getDevtoolsHAR();
        if (harLog && harLog.entries) {
          harEntriesRef.current = harLog.entries;
          if (config.network) data.network = harLog.entries.map((entry: any, idx: number) => ({
            id: 'net_' + idx,
            method: entry.request.method,
            url: redactUrl(entry.request.url),
            status: entry.response.status,
            duration: Math.round(entry.time),
            mimeType: entry.response.content?.mimeType,
            size: entry.response.content?.size,
            initiator: inferInitiator(entry)
          })).sort((a: any, b: any) => Number(b.status >= 400) - Number(a.status >= 400) || Number(b.duration > 1000) - Number(a.duration > 1000)).slice(0, 100);
        } else if (config.network) {
          // HAR is empty/unavailable (e.g. Firefox fires onRequestFinished only
          // after the Network panel was opened). Fall back to the background
          // webRequest snapshot so the option still yields data (F-02/F-03).
          try {
            const fallback = await browser.runtime.sendMessage({ type: 'GET_DEVTOOLS_NETWORK_FALLBACK', tabId: inspectedTabId });
            if (Array.isArray(fallback) && fallback.length) {
              data.network = fallback.map((entry: any, idx: number) => ({
                id: 'net_' + idx,
                method: entry.method,
                url: redactUrl(entry.url),
                status: entry.status,
                duration: entry.duration || 0,
                mimeType: entry.mimeType,
                size: entry.size,
                initiator: entry.initiator || 'webrequest-fallback'
              })).sort((a: any, b: any) => Number(b.status >= 400) - Number(a.status >= 400)).slice(0, 100);
              warning += ' Network panel data was empty, so a background request snapshot was used instead (no timings/bodies).';
            } else {
              warning += ' No network requests were visible. Open the browser Network panel and reload, then capture again.';
            }
          } catch (_) {
            warning += ' Network data was unavailable for this capture.';
          }
        }
      }

      if (config.cookies && data.metadata?.url) {
        try {
          const cookieResult = await browser.runtime.sendMessage({ type: 'GET_DEVTOOLS_COOKIES', url: data.metadata.url, includeValues: config.cookieValues });
          if (Array.isArray(cookieResult)) data.cookies = cookieResult;
        } catch (_) { data.cookies = []; }
      }

      if (config.security) {
        data.security = (await devtoolsEval<any>(`(function(){try{return {pageProtocol:location.protocol,mixedContentCandidates:Array.from(document.querySelectorAll('img[src],script[src],link[href],iframe[src]')).map(e=>e.src||e.href).filter(u=>location.protocol==='https:'&&u.startsWith('http:')).slice(0,50),cspMeta:Array.from(document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]')).map(e=>e.content),permissionsPolicyMeta:Array.from(document.querySelectorAll('meta[http-equiv="Permissions-Policy"]')).map(e=>e.content)}}catch(e){return null}})()`)).result;
        // Match the document request defensively: `_resourceType` is
        // Chrome-specific, so fall back to URL + method matching (F-17).
        const documentRequest = harEntriesRef.current.find((e: any) => e._resourceType === 'document' || e._resourceType === 'Document')
          || harEntriesRef.current.find((e: any) => e.request?.url === data.metadata?.url && (!e.request?.method || e.request.method === 'GET'));
        if (data.security && documentRequest?.response?.headers) {
          const securityHeaders = new Set(['content-security-policy','content-security-policy-report-only','strict-transport-security','permissions-policy','x-content-type-options','x-frame-options','referrer-policy','cross-origin-opener-policy','cross-origin-embedder-policy','cross-origin-resource-policy']);
          data.security.responseHeaders = documentRequest.response.headers.filter((h: any) => securityHeaders.has(String(h.name).toLowerCase())).map((h: any) => ({ name: h.name, value: redactSecrets(redactUrl(h.value)) }));
        }
        if (data.security && data.cookies) data.security.cookieFlags = data.cookies.map(c => ({ name: c.name, secure: c.secure, httpOnly: c.httpOnly, sameSite: c.sameSite, session: c.session }));
      }

      if (config.pwa) {
        await devtoolsEval(`(function(){try{
          window.__browserbotPwa={registrations:[],manifestUrl:document.querySelector('link[rel="manifest"]')?.href||null,manifest:null};
          Promise.all([navigator.serviceWorker?.getRegistrations?.()||Promise.resolve([]),window.__browserbotPwa.manifestUrl?fetch(window.__browserbotPwa.manifestUrl).then(r=>r.json()).catch(()=>null):Promise.resolve(null)]).then(([regs,manifest])=>{window.__browserbotPwa.registrations=regs.slice(0,20).map(r=>({scope:r.scope,activeScript:r.active?.scriptURL,state:r.active?.state,waitingScript:r.waiting?.scriptURL}));window.__browserbotPwa.manifest=manifest?{name:manifest.name,short_name:manifest.short_name,start_url:manifest.start_url,display:manifest.display,theme_color:manifest.theme_color,icons:(manifest.icons||[]).slice(0,10).map(i=>({src:i.src,sizes:i.sizes,type:i.type}))}:null;});
        }catch(e){window.__browserbotPwa={error:String(e)}}})()`);
        await new Promise(resolve => setTimeout(resolve, 150));
        data.pwa = (await devtoolsEval<any>('window.__browserbotPwa || null')).result;
      }

      if (config.screenshots) {
        try {
          const screenshotResult = await browser.runtime.sendMessage({ type: 'CAPTURE_DEVTOOLS_SCREENSHOT', tabId: inspectedTabId });
          const SCREENSHOT_LIMIT = 750000;
          if (screenshotResult?.dataUrl && screenshotResult.dataUrl.length <= SCREENSHOT_LIMIT) data.screenshot = screenshotResult.dataUrl;
          else if (screenshotResult?.dataUrl) warning += ' Screenshot skipped because it exceeded the 750 KB attachment limit.';
          else if (screenshotResult?.error) warning += ` Screenshot unavailable: ${screenshotResult.error}`;
        } catch (error: any) { warning += ` Screenshot unavailable: ${error?.message || 'capture failed'}`; }
      }

      if (config.console) {
        const logsRes = (await devtoolsEval<any[]>('window.__browserbotLogs || []')).result;
        if (logsRes && Array.isArray(logsRes)) {
          // Stable IDs bind to content so re-captures and selection survive
          // re-renders instead of shifting with array position (F-15).
          data.logs = logsRes.slice(-200).map((l: any, idx: number) => ({ ...l, id: `log_${l.ts || 0}_${idx}` }));
        }
      }
      if (config.liveConsole) {
        const liveLogs = (await devtoolsEval<any[]>('window.__browserbotLiveLogs || []')).result;
        const live = Array.isArray(liveLogs) ? liveLogs : [];
        // Deduplicate live entries against the injected-logger set only; keep
        // within-batch duplicates so same-millisecond identical user logs are
        // not collapsed (F-13).
        const existing = new Set((data.logs || []).map(l => `${l.ts}|${l.level}|${l.text}|${l.stack || ''}`));
        const fresh = live.map((l, idx) => ({ ...l, id: `live_${l.ts || 0}_${idx}` })).filter(l =>
          !existing.has(`${l.ts}|${l.level}|${l.text}|${l.stack || ''}`));
        data.logs = [...(data.logs || []), ...fresh];
      }

      setCapturedData(data);
      setSavedCaptureContext('');
      
      // Select all by default
      if (data.logs) setSelectedLogIds(new Set(data.logs.map(l => l.id)));
      if (data.network) setSelectedNetworkIds(new Set(data.network.map(n => n.id)));
      setIncludeDom(!!data.dom);
      setIncludePerf(!!data.performance);
      
      let statusMsg = '✅ Captured ';
      if (!data.dom) statusMsg += '(No element selected in Elements tab. ';
      else statusMsg += '(' + data.dom.tag + ' element. ';
      
      setCaptureStatus(statusMsg + ')' + warning);
    } catch (e: any) {
      setCaptureStatus(`Error: ${e.message}`);
    }
    setIsCapturing(false);
  };

  const buildPreamble = () => {
    const meta = capturedData?.metadata;
    return (devtoolsSystemPrompt || DEFAULT_DEVTOOLS_SYSTEM_PROMPT)
      .replace(/{url}/g,                meta?.url ? redactUrl(meta.url) : '')
      .replace(/{pageTitle}/g,          meta?.title         || '')
      .replace(/{userAgent}/g,          meta?.userAgent     || '')
      .replace(/{viewport}/g,           meta?.viewport      || '')
      .replace(/{framework}/g,          meta?.framework?.trim() || 'Not detected')
      .replace(/{timestamp}/g,          new Date().toISOString())
      .replace(/{localStorageKeys}/g,   (meta?.localKeys  || []).join(', ') || '(none)')
      .replace(/{sessionStorageKeys}/g, (meta?.sessionKeys || []).join(', ') || '(none)');
  };

  const buildContextData = async (): Promise<string> => {
    if (!capturedData) return '';
    if (savedCaptureContext && harEntriesRef.current.length === 0) return savedCaptureContext;
    let prompt = '';
    const selectedLogCount = capturedData.logs?.filter(l => selectedLogIds.has(l.id)).length || 0;
    const selectedNetworkCount = capturedData.network?.filter(n => selectedNetworkIds.has(n.id)).length || 0;
    prompt += `## Capture ${capturedData.captureId || 'snapshot'}\nPage: ${redactUrl(capturedData.metadata?.url || '(unknown)')}\nIncluded: ${selectedLogCount} console entries, ${selectedNetworkCount} network requests${includeDom && capturedData.dom ? ', selected element $0' : ''}${includePerf && capturedData.performance ? ', navigation/performance' : ''}${config.webVitals && capturedData.vitals ? ', Web Vitals' : ''}${config.storage && capturedData.storage ? ', storage inventory' : ''}${config.cookies && capturedData.cookies?.length ? ', cookie metadata' : ''}${config.screenshots && capturedData.screenshot ? ', screenshot attachment' : ''}\n\n`;

    if (capturedData?.metadata) {
      const m = capturedData.metadata;
      prompt += `## Capture Metadata\n`;
      prompt += `- **URL**: ${redactUrl(m.url || '')}\n`;
      prompt += `- **Timestamp**: ${new Date().toISOString()}\n`;
      if (m.framework) prompt += `- **Framework**: ${m.framework}(detected)\n`;
      prompt += `- **User Agent**: ${m.userAgent}\n`;
      prompt += `- **Viewport**: ${m.viewport}\n`;
      if (m.localKeys?.length) prompt += `- **Local Storage Keys**: ${m.localKeys.join(', ')}\n`;
      if (m.sessionKeys?.length) prompt += `- **Session Storage Keys**: ${m.sessionKeys.join(', ')}\n`;
      prompt += '\n';
    }

    if (capturedData?.logs?.length && selectedLogIds.size > 0) {
      prompt += `## Console Logs\n`;
      const logGroups = new Map<string, { log: any; count: number }>();
      capturedData.logs.filter(l => selectedLogIds.has(l.id)).forEach(log => {
        const key = `${log.level}|${log.text}|${log.stack || ''}`;
        const group = logGroups.get(key);
        if (group) group.count++; else logGroups.set(key, { log, count: 1 });
      });
      for (const { log, count } of logGroups.values()) {
        prompt += `[${log.id}] [${new Date(log.ts).toISOString()}] [${log.level.toUpperCase()}] ${redactSecrets(log.text)}${count > 1 ? ` (repeated ${count} times)` : ''}\n`;
        if (log.stack) prompt += `Stack:\n${redactSecrets(log.stack).slice(0, 6000)}\n`;
      }
      prompt += '\n';
    }
    
    if (capturedData?.network?.length && selectedNetworkIds.size > 0) {
      const selectedNet = capturedData.network.filter(n => selectedNetworkIds.has(n.id));
      const networkGroups = new Map<string, { entry: any; count: number; minTime: number; maxTime: number }>();
      for (const entry of selectedNet) {
        const key = `${entry.method}|${entry.url}|${entry.status}|${entry.mimeType || ''}`;
        const group = networkGroups.get(key);
        if (group) { group.count++; group.minTime = Math.min(group.minTime, entry.duration); group.maxTime = Math.max(group.maxTime, entry.duration); }
        else networkGroups.set(key, { entry, count: 1, minTime: entry.duration, maxTime: entry.duration });
      }
      
      if (config.networkDisplayMode === 'summary' || config.networkDisplayMode === 'both') {
        prompt += `## Network Summary (${selectedNet.length} requests)\n`;
        prompt += `| ID | URL | Method | Status | Time | Size | Initiator | Flag |\n`;
        prompt += `|----|-----|--------|--------|------|------|-----------|------|\n`;
        for (const { entry: n, count, minTime, maxTime } of networkGroups.values()) {
          let flag = '';
          if (n.status >= 400) flag = '❌ FAILED';
          else if (n.duration > 1000) flag = '⚠️ SLOW';
          const sizeStr = n.size ? Math.round(n.size / 1024) + 'KB' : '-';
          const init = (n as any).initiator || '-';
          prompt += `| ${n.id} | ${n.url} | ${n.method} | ${n.status} | ${minTime === maxTime ? `${minTime}ms` : `${minTime}-${maxTime}ms`} | ${sizeStr} | ${init} | ${flag}${count > 1 ? ` (${count}×)` : ''} |\n`;
        }
        prompt += '\n';
      }

      if (config.networkDisplayMode === 'details' || config.networkDisplayMode === 'both') {
        prompt += `## Network Details\n`;
        // Body budget applies only when response bodies are actually requested
        // (F-10): the summary table above must never consume it.
        let remainingBodyChars = config.networkResponseBody ? (config.allowLargeBodies ? 100000 : 20000) : 0;
        const detailed = new Set<string>();
        for (const n of selectedNet) {
          const detailKey = `${n.method}|${n.url}|${n.status}|${n.mimeType || ''}`;
          if (detailed.has(detailKey)) continue;
          detailed.add(detailKey);
          const rawIdx = parseInt(n.id.split('_')[1]);
          const rawEntry = harEntriesRef.current[rawIdx];
          prompt += `### ${n.id} ${n.method} ${n.url} - Status: ${n.status} (${n.duration}ms) ${n.mimeType || ''} ${n.size ? n.size + 'B' : ''}\n`;
          
          if (rawEntry) {
            if (config.networkHeaders) {
               if (rawEntry.request?.headers?.length) {
                 const filteredReqHeaders = rawEntry.request.headers.filter((h: any) => h.name.toLowerCase() !== 'cookie');
                 prompt += `**Request Headers:**\n` + filteredReqHeaders.map((h: any) => `${h.name}: ${/authorization|token|secret|api[-_]?key/i.test(h.name) ? '[REDACTED]' : redactSecrets(h.value)}`).join('\n') + '\n';
               }
               if (rawEntry.response?.headers?.length) {
                 const filteredResHeaders = rawEntry.response.headers.filter((h: any) => h.name.toLowerCase() !== 'set-cookie');
                 prompt += `**Response Headers:**\n` + filteredResHeaders.map((h: any) => `${h.name}: ${/authorization|token|secret|api[-_]?key/i.test(h.name) ? '[REDACTED]' : redactSecrets(h.value)}`).join('\n') + '\n';
               }
            }
            if (config.networkCookies) {
               if (rawEntry.request?.cookies?.length) {
                        prompt += `**Cookies:**\n` + rawEntry.request.cookies.map((c: any) => config.cookieValues ? `${c.name}=${String(c.value || '').slice(0, 256)}` : c.name).join('; ') + '\n';
               }
            }
            if (config.networkPayload && rawEntry.request?.postData) {
               const pd = rawEntry.request.postData;
               if (pd.text) {
                prompt += `**Request Payload:**\n${redactSecrets(pd.text)}\n`;
               } else if (pd.params && pd.params.length) {
                 prompt += `**Request Payload:**\n${redactSecrets(pd.params.map((p: any) => p.name + '=' + p.value).join('&'))}\n`;
               }
            }
            if (config.networkResponseBody) {
               const mime = n.mimeType?.toLowerCase() || '';
               const isHtml = mime.includes('html');
               const isCss = mime.includes('css');
               const isJs = mime.includes('javascript') || mime.includes('ecmascript');
               
               let shouldFetch = false;
               if (mime.includes('json') || mime.includes('xml')) shouldFetch = true;
               else if (isHtml && config.includeHtml) shouldFetch = true;
               else if (isCss && config.includeCss) shouldFetch = true;
               else if (isJs && config.includeJs) shouldFetch = true;
               else if (mime.includes('text') && !isHtml && !isCss && !isJs) shouldFetch = true;

                if (shouldFetch && remainingBodyChars > 0) {
                   const sizeLimit = config.allowLargeBodies ? 5000000 : 50000;
                   if (n.size && n.size > sizeLimit) {
                     prompt += `**Response Body:** (Skipped, HAR-reported size ${Math.round(n.size/1024)}KB exceeds threshold)\n`;
                   } else {
                 try {
                    const body = await new Promise<string>((resolve) => {
                      const timer = setTimeout(() => resolve(''), 600);
                      try {
                        const onDone = (content: string) => {
                          clearTimeout(timer);
                          resolve(content || '');
                        };
                        if (typeof rawEntry.getContent !== 'function') throw new Error('no-getContent');
                        const result = rawEntry.getContent(onDone);
                       if (result && typeof result.then === 'function') {
                         result.then((res: any) => {
                           clearTimeout(timer);
                           if (Array.isArray(res)) resolve(res[0] || '');
                           else if (res && typeof res === 'object' && res.content) resolve(res.content || '');
                           else resolve((res as string) || '');
                         }).catch(() => {
                           clearTimeout(timer);
                           resolve('');
                         });
                       }
                      } catch(err) {
                        try {
                          // Entries without getContent (e.g. fallback snapshots).
                          // Match a live onRequestFinished entry by URL+method (F-07).
                          const match = requestCacheRef.current.find(r => r.request?.url === rawEntry.request?.url && r.request?.method === rawEntry.request?.method);
                          const targetEntry = (typeof rawEntry.getContent === 'function') ? rawEntry : match;
                          if (!targetEntry || typeof targetEntry.getContent !== 'function') {
                            clearTimeout(timer);
                            resolve('');
                            return;
                          }
                         const result = targetEntry.getContent((c: string) => {
                           clearTimeout(timer);
                           resolve(c || '');
                         });
                         if (result && typeof result.then === 'function') {
                           result.then((res: any) => {
                             clearTimeout(timer);
                             if (Array.isArray(res)) resolve(res[0] || '');
                             else if (res && typeof res === 'object' && res.content) resolve(res.content || '');
                             else resolve((res as string) || '');
                           }).catch(() => {
                             clearTimeout(timer);
                             resolve('');
                           });
                         } else if (!result) {
                           clearTimeout(timer);
                           resolve('');
                         }
                       } catch (e) {
                         clearTimeout(timer);
                         resolve('');
                       }
                     }
                   });
                      if (body) {
                   // Enforce the cap on the ACTUAL body length, not just the
                   // HAR-reported size (F-19).
                   if (body.length > sizeLimit) {
                     const bodyLimit = Math.min(sizeLimit, remainingBodyChars);
                     prompt += `**Response Body:**\n\`\`\`\n${redactSecrets(body).slice(0, bodyLimit)}\n...[TRUNCATED ${Math.round(body.length/1024)}KB actual]\n\`\`\`\n`;
                     remainingBodyChars -= bodyLimit;
                   } else {
                     const bodyLimit = Math.min(sizeLimit, remainingBodyChars);
                     prompt += `**Response Body:**\n\`\`\`\n${redactSecrets(body).slice(0, bodyLimit)}${body.length > bodyLimit ? '\n...[TRUNCATED]' : ''}\n\`\`\`\n`;
                     remainingBodyChars -= Math.min(body.length, bodyLimit);
                   }
                      }
                  } catch(e) {}
                  }
               }
            }
          }
          prompt += '\n';
        }
      }
    }
    
    if (includeDom && capturedData?.dom) {
      prompt += `## Selected DOM Element ($0)\n`;
      prompt += `Tag: ${capturedData.dom.tag}, ID: ${capturedData.dom.id}, Class: ${capturedData.dom.className}\n`;
      prompt += `Attributes: ${JSON.stringify(capturedData.dom.attributes)}\n`;
      if (capturedData.dom.html) prompt += `HTML Snippet: ${capturedData.dom.html}\n`;
      prompt += `Text Snippet: ${capturedData.dom.text}\n`;
      prompt += `Rect: ${JSON.stringify(capturedData.dom.rect)}\n\n`;
      if (capturedData.dom.computedStyle) prompt += `Computed Styles: ${JSON.stringify(capturedData.dom.computedStyle)}\n`;
      if (config.eventListeners && capturedData.dom.listeners) prompt += `Event Listener Counts: ${JSON.stringify(capturedData.dom.listeners)}\n`;
      if (config.eventListeners && !capturedData.dom.listeners && capturedData.dom.listenersNote) prompt += `Event Listeners: ${capturedData.dom.listenersNote}\n`;
      if (config.matchedStyles && capturedData.dom.matchedStyles) prompt += `Matched CSS Rules: ${JSON.stringify(capturedData.dom.matchedStyles)}\n`;
      if (config.accessibilityTree && capturedData.dom.accessibilityTree) prompt += `Accessibility Node: ${JSON.stringify(capturedData.dom.accessibilityTree)}\n`;
      if (capturedData.dom.cdpNote) prompt += `CDP: ${capturedData.dom.cdpNote}\n`;
      prompt += '\n';
    }
    
    if (includePerf && capturedData?.performance) {
      prompt += `## Page Performance\n`;
      if (capturedData.performance.browserNote) {
        prompt += `> Note: ${capturedData.performance.browserNote}\n`;
      }
      prompt += `Navigation Timing: ${JSON.stringify(capturedData.performance.navTiming, null, 2)}\n`;
      if (capturedData.performance.paints?.length) {
        prompt += `Paints: ${JSON.stringify(capturedData.performance.paints)}\n`;
      }
      if (capturedData.performance.memory) {
        prompt += `Memory: ${JSON.stringify(capturedData.performance.memory, null, 2)}\n`;
      }
      prompt += '\n';
    }

    if (config.storage && capturedData.storage) {
      const storage = JSON.parse(JSON.stringify(capturedData.storage));
      if (!config.storageValues) for (const area of ['localStorage', 'sessionStorage']) for (const item of Object.values(storage[area] || {}) as any[]) delete item.value;
      prompt += `## Storage Inventory (${config.storageValues ? 'values opted in; sensitive-key values remain redacted' : 'values excluded'})\n${redactSecrets(JSON.stringify(storage))}\n\n`;
    }
    if (config.cookies && capturedData.cookies?.length) {
      const cookies = capturedData.cookies.map(c => { const copy = { ...c }; if (!config.cookieValues) delete (copy as any).value; return copy; });
      prompt += `## Cookie Metadata (values ${config.cookieValues ? 'explicitly included' : 'redacted'})\n${JSON.stringify(cookies)}\n\n`;
    }
    if (config.webVitals && capturedData.vitals) {
      prompt += `## Web Performance Signals\n${JSON.stringify(capturedData.vitals)}\n\n`;
    }
    if (config.security && capturedData.security) prompt += `## Security Signals\n${safeJson(capturedData.security)}\n\n`;
    if (config.pwa && capturedData.pwa) prompt += `## PWA / Service Worker\n${safeJson(capturedData.pwa)}\n\n`;
    if (config.screenshots && capturedData.screenshot) {
      prompt += `## Screenshot\n${providerType === 'chrome_ai' ? 'The screenshot is captured but is not sent because Chrome AI currently receives text only.' : 'A screenshot image is attached to this user turn; image support depends on the selected model/provider.'}\n\n`;
    }

    return prompt.trim();
  };

  const buildSystemPrompt = async () => {
    const preamble = buildPreamble();
    const contextData = await buildContextData();
    let full = preamble;
    if (contextData) {
      full += '\n\n' + contextData;
    }
    full += MARKDOWN_FORMAT_INSTRUCTION;
    return full;
  };

  const copyContext = async () => {
    if (!capturedData) {
      setCaptureStatus('⚠️ No context captured yet. Click Capture Context first!');
      setTimeout(() => setCaptureStatus(''), 2500);
      return;
    }
    const contextData = await buildContextData();
    navigator.clipboard.writeText(contextData).then(() => {
      setCaptureStatus('✅ Context copied to clipboard!');
      setTimeout(() => setCaptureStatus(''), 2000);
    });
  };

  const sendMessage = async (textOverride?: string) => {
    const text = (textOverride !== undefined ? textOverride : input).trim();
    if (isStreaming || !text) return;
    if (config.screenshots && capturedData?.screenshot && providerType === 'chrome_ai') {
      setCaptureStatus('Screenshot captured, but Chrome AI receives text only. Select an image-capable Ollama or OpenAI-compatible model to send it.');
    }

    // Secret unlock / lock command interception
    const unlockCmd = (copyPasteUnlockCommand || '/unlockMySecrets3038').trim().toLowerCase();
    if (text.toLowerCase() === unlockCmd) {
      await AppStorage.set({ copyPasteUnlocked: true });
      setCopyPasteUnlocked(true);
      setInput('');
      setCaptureStatus('🔓 Copy-Paste AI workflow unlocked!');
      setTimeout(() => setCaptureStatus(''), 3000);
      return;
    }
    if (copyPasteUnlocked && (text.toLowerCase() === '/lock' || text.toLowerCase() === '/lockcopypaste')) {
      await AppStorage.set({ copyPasteUnlocked: false });
      setCopyPasteUnlocked(false);
      setInput('');
      setCaptureStatus('🔒 Copy-Paste AI workflow locked.');
      setTimeout(() => setCaptureStatus(''), 3000);
      return;
    }

    const newSessionId = generateUUID();
    sessionIdRef.current = newSessionId;

    const sysPrompt = await buildSystemPrompt();
    const chatMessages: any[] = [
      { role: 'system', content: sysPrompt }
    ];
    // Shared 8000-char history budget with a per-message cap so one long
    // reply cannot starve earlier turns down to empty strings (F-12).
    let historyBudget = 8000;
    const PER_MESSAGE_CAP = 2000;
    const recent = [...messages].reverse().filter(m => m.role !== 'error').slice(0, 12).reverse();
    for (const m of recent) {
      if (m.role === 'error') continue;
      if (historyBudget <= 0) break;
      const allowance = Math.min(PER_MESSAGE_CAP, historyBudget);
      if (m.role === 'assistant') {
        const c = (m.content || (m.thinking ? `[Thinking process: ${m.thinking}]` : '')).slice(-allowance);
        if (c) { chatMessages.push({ role: 'assistant', content: c }); historyBudget -= c.length; }
      } else {
        const c = m.content.slice(-allowance);
        if (c) { chatMessages.push({ role: m.role, content: c }); historyBudget -= c.length; }
      }
    }
    chatMessages.push({
      role: 'user',
      content: text,
      ...(config.screenshots && capturedData?.screenshot && providerType !== 'chrome_ai' ? { imageDataUrl: capturedData.screenshot } : {}),
    });

    setMessages(prev => [
      ...prev.filter(m => m.role !== 'error'),
      { role: 'user', content: text },
      { role: 'assistant', content: '' }
    ]);
    setInput('');
    setIsStreaming(true);
    streamingContentRef.current = '';
    streamingThinkingRef.current = '';
    setThinkingContent('');

    if (inputRef.current) inputRef.current.style.height = 'auto';

    browser.runtime.sendMessage({
      type: 'ASK_PAGE_CHAT',
      messages: chatMessages,
      providerType,
      openaiProviderId: selectedOpenAIId,
      sessionId: newSessionId
    });
  };

  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMsg) return;
    setMessages(prev => prev.filter(m => m.role !== 'error'));
    sendMessage(lastUserMsg.content);
  };

  const handleSelectWelcomePrompt = async (promptText: string) => {
    if (!capturedData) {
      await captureDevToolsData();
    }
    sendMessage(promptText);
  };

  const handlePasteAction = async (action: ParsedAIAction) => {
    if (action.type === 'chat') {
      const userText = input.trim();
      const newMessages: ChatMsg[] = [...messages];
      if (userText) {
        newMessages.push({ role: 'user', content: userText });
        setInput('');
      }
      newMessages.push({ role: 'assistant', content: action.content });
      setMessages(newMessages);
      setCaptureStatus('✓ AI response added');
      setTimeout(() => setCaptureStatus(''), 3000);
    } else if (action.type === 'tab_groups') {
      try {
        const tabs = await browser.tabs.query({ currentWindow: true });
        const tabsInfo = tabs.map(t => ({ id: t.id!, url: t.url!, title: t.title || '' }));
        const res = await executeTabGroups(action.categories, false, tabsInfo);
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `✓ Organized tabs into **${res.created}** groups (${res.totalTabs} tabs).` }
        ]);
        setCaptureStatus(`✓ Applied ${res.created} tab groups`);
        setTimeout(() => setCaptureStatus(''), 3000);
      } catch (e: any) {
        setCaptureStatus(`Error: ${e?.message || e}`);
      }
    } else if (action.type === 'bookmarks') {
      try {
        const tree = await getBookmarkTree();
        const res = await executeBookmarkPlan(action.plan, tree.folders, tree.bookmarks);
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `✓ Bookmark plan applied: Created **${res.foldersCreated}** folders, moved **${res.bookmarksMoved}** bookmarks.` }
        ]);
        setCaptureStatus(`✓ Moved ${res.bookmarksMoved} bookmarks`);
        setTimeout(() => setCaptureStatus(''), 3000);
      } catch (e: any) {
        setCaptureStatus(`Error: ${e?.message || e}`);
      }
    }
  };

  const renderMarkdown = (content: string) => {
    if (!content) return '';
    try {
      let html = marked.parse(content) as string;
      html = html.replace(/<pre><code([^>]*)>/g, (_match, attrs) => `<div class="askpage-code-wrapper"><button class="askpage-copy-btn" onclick="(function(btn){var code=btn.parentElement.querySelector('code');navigator.clipboard.writeText(code.innerText).then(function(){btn.textContent='Copied!';setTimeout(function(){btn.textContent='Copy'},1500)});})(this)">Copy</button><pre><code${attrs}>`);
      html = html.replace(/<\/code><\/pre>/g, '</code></pre></div>');
      return sanitizeMarkdownHtml(html);
    } catch { return content; }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const abortStream = () => {
    if (sessionIdRef.current) {
      browser.runtime.sendMessage({
        type: 'ASK_PAGE_CHAT_ABORT',
        sessionId: sessionIdRef.current
      }).catch(() => {});
    }
    setIsStreaming(false);
  };
  
  const toggleNetworkId = (id: string) => {
    const next = new Set(selectedNetworkIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedNetworkIds(next);
  };
  
  const toggleLogId = (id: string) => {
    const next = new Set(selectedLogIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedLogIds(next);
  };

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden', background: 'var(--pbg)', fontFamily: 'var(--font)', color: 'var(--fg)' }}>
      {/* ── Sidebar ── */}
      <DevtoolsSidebar
        sidebarCollapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(c => !c)}
        config={config}
        onChangeConfig={updateConfig}
        onInjectLogger={injectLogger}
        isCapturing={isCapturing}
        onCapture={captureDevToolsData}
        capturedData={capturedData}
        onCopyContext={copyContext}
        captureStatus={captureStatus}
        includeDom={includeDom}
        onToggleIncludeDom={value => { setIncludeDom(value); setSavedCaptureContext(''); }}
        includePerf={includePerf}
        onToggleIncludePerf={value => { setIncludePerf(value); setSavedCaptureContext(''); }}
        selectedLogIds={selectedLogIds}
        onToggleLogId={id => { toggleLogId(id); setSavedCaptureContext(''); }}
        selectedNetworkIds={selectedNetworkIds}
        onToggleNetworkId={id => { toggleNetworkId(id); setSavedCaptureContext(''); }}
        onSelectAllNetwork={() => { setSelectedNetworkIds(new Set(capturedData?.network?.map(n => n.id) || [])); setSavedCaptureContext(''); }}
        onDeselectAllNetwork={() => { setSelectedNetworkIds(new Set()); setSavedCaptureContext(''); }}
        networkFilter={networkFilter}
        onChangeNetworkFilter={setNetworkFilter}
      />

      {/* ── Main Chat Area ── */}
      <DevtoolsChatArea
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        startNewChat={startNewChat}
        historySearch={historySearch}
        setHistorySearch={setHistorySearch}
        conversations={conversations}
        activeConversationId={activeConversationId}
        loadConversation={loadConversation}
        deleteConversation={deleteConversation}
        loadConversations={loadConversations}
        messages={messages}
        clearConversation={clearConversation}
        providerType={providerType}
        setProviderType={setProviderType}
        selectedOpenAIId={selectedOpenAIId}
        setSelectedOpenAIId={setSelectedOpenAIId}
        openaiProviders={openaiProviders}
        ollamaModel={ollamaModel}
        messagesContainerRef={messagesContainerRef}
        isStreaming={isStreaming}
        thinkingContent={thinkingContent}
        thinkingExpanded={thinkingExpanded}
        setThinkingExpanded={setThinkingExpanded}
        renderMarkdown={renderMarkdown}
        inputRef={inputRef}
        input={input}
        setInput={setInput}
        handleKeyDown={handleKeyDown}
        capturedData={capturedData}
        isCapturing={isCapturing}
        onCapture={captureDevToolsData}
        abortStream={abortStream}
        sendMessage={sendMessage}
        onRetry={handleRetry}
        onSelectWelcomePrompt={handleSelectWelcomePrompt}
        copyPasteUnlocked={copyPasteUnlocked}
        copyPasteUnlockCommand={copyPasteUnlockCommand}
        buildPreamble={buildPreamble}
        buildContextData={buildContextData}
        buildSystemPrompt={buildSystemPrompt}
        onExecutePasteAction={handlePasteAction}
      />
    </div>
  );
}
