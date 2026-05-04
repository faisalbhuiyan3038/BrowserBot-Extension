import { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';
import { AppStorage, OpenAIProvider, AIProviderType, ChatMsg, Conversation, generateId } from '../../utils/storage';

marked.setOptions({ breaks: true, gfm: true });

interface DevToolsConfig {
  console: boolean;
  network: boolean;
  dom: boolean;
  performance: boolean;
  networkHeaders: boolean;
  networkCookies: boolean;
  networkPayload: boolean;
  networkResponseBody: boolean;
  networkDisplayMode: 'summary' | 'details' | 'both';
  includeHtml: boolean;
  includeCss: boolean;
  includeJs: boolean;
  cookieValues: boolean;
  allowLargeBodies: boolean;
}

interface LogEntry {
  id: string;
  ts: number;
  level: string;
  text: string;
  stack?: string;
}

interface NetworkEntry {
  id: string;
  method: string;
  url: string;
  status: number;
  duration: number;
  mimeType?: string;
  size?: number;
}

interface DevToolsData {
  logs?: LogEntry[];
  network?: NetworkEntry[];
  dom?: any;
  performance?: any;
  metadata?: any;
}

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

  // DevTools specific state
  const [config, setConfig] = useState<DevToolsConfig>({
    console: true,
    network: true,
    dom: true,
    performance: true,
    networkHeaders: true,
    networkCookies: true,
    networkPayload: true,
    networkResponseBody: true,
    networkDisplayMode: 'both',
    includeHtml: true,
    includeCss: false,
    includeJs: false,
    cookieValues: false,
    allowLargeBodies: false,
  });
  
  const [capturedData, setCapturedData] = useState<DevToolsData | null>(null);
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
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const harEntriesRef = useRef<any[]>([]);
  const requestCacheRef = useRef<any[]>([]);

  useEffect(() => {
    const onReq = (req: any) => requestCacheRef.current.push(req);
    if (browser.devtools?.network?.onRequestFinished) {
      browser.devtools.network.onRequestFinished.addListener(onReq);
      return () => browser.devtools.network.onRequestFinished.removeListener(onReq);
    }
  }, []);

  useEffect(() => {
    AppStorage.get().then(state => {
      setProviderType(state.activeProvider);
      setOpenaiProviders(state.openaiProviders);
      setSelectedOpenAIId(state.activeOpenAIProviderId);
      setOllamaModel(state.ollamaModel);
    });
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
        if (savedThinking) {
          setMessages(prev => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
              updated[lastIdx] = { ...updated[lastIdx], thinking: savedThinking };
            }
            return updated;
          });
        }
        setIsStreaming(false);
        setThinkingExpanded(false);
        streamingContentRef.current = '';
        streamingThinkingRef.current = '';
        setThinkingContent('');
      } else if (message.type === 'ASK_PAGE_CHAT_ERROR') {
        setIsStreaming(false);
        setMessages(prev => [...prev, { role: 'error', content: message.error }]);
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
      id: activeConversationId || generateId(),
      title,
      createdAt: activeConversationId ? (conversations.find(c => c.id === activeConversationId)?.createdAt || Date.now()) : Date.now(),
      updatedAt: Date.now(),
      pageUrl: 'DevTools',
      pageTitle: 'DevTools',
      messages: messages
    };
    if (!activeConversationId) {
      setActiveConversationId(conversation.id);
    }
    browser.runtime.sendMessage({ type: 'SAVE_CONVERSATION', conversation }).catch(() => {});
    loadConversations();
  };

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (messages.length === 0 || isStreaming) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveCurrentConversation(), 1000);
  }, [messages, isStreaming]);

  const startNewChat = () => {
    setMessages([]);
    setActiveConversationId(null);
    streamingContentRef.current = '';
    setShowHistory(false);
  };

  const loadConversation = (conv: Conversation) => {
    setMessages(conv.messages);
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
      console.log = function(...args) { window.__browserbotLogs.push({ ts: Date.now(), level: 'log', text: args.map(safeStr).join(' ') }); _log.apply(console, args); };
      console.warn = function(...args) { window.__browserbotLogs.push({ ts: Date.now(), level: 'warn', text: args.map(safeStr).join(' ') }); _warn.apply(console, args); };
      console.error = function(...args) { window.__browserbotLogs.push({ ts: Date.now(), level: 'error', text: args.map(safeStr).join(' '), stack: args[0] && args[0].stack ? args[0].stack : '' }); _error.apply(console, args); };
      window.addEventListener('error', (e) => window.__browserbotLogs.push({ ts: Date.now(), level: 'error', text: e.message, stack: e.error?.stack }));
      window.addEventListener('unhandledrejection', (e) => window.__browserbotLogs.push({ ts: Date.now(), level: 'error', text: 'Unhandled Promise: ' + String(e.reason) }));
    `;
    browser.devtools.inspectedWindow.reload({ injectedScript: script });
    setCaptureStatus('Logger injected & page reloading.');
  };

  const captureDevToolsData = async () => {
    setIsCapturing(true);
    setCaptureStatus('Capturing from DevTools...');
    try {
      const data: DevToolsData = {};

      const metaRes = await new Promise((resolve) => {
        browser.devtools.inspectedWindow.eval(`
          (function() {
            try {
              return {
                url: window.location.href,
                title: document.title,
                userAgent: navigator.userAgent,
                viewport: window.innerWidth + 'x' + window.innerHeight,
                framework: (window.angular ? 'Angular ' : '') + (window.React ? 'React ' : '') + ((window as any).__vue__ ? 'Vue ' : ''),
                localKeys: Object.keys(localStorage || {}),
                sessionKeys: Object.keys(sessionStorage || {})
              };
            } catch(e) { return null; }
          })()
        `, (result, isException) => resolve(isException ? null : result));
      });
      if (metaRes) data.metadata = metaRes;

      if (config.performance) {
        const perfRes = await new Promise((resolve) => {
          browser.devtools.inspectedWindow.eval(`
            (function() {
              try {
                const nav = performance.getEntriesByType('navigation')[0];
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
                  const start = timing.navigationStart;
                  navData = {
                    loadEventEnd: timing.loadEventEnd - start,
                    domContentLoadedEventEnd: timing.domContentLoadedEventEnd - start,
                    responseEnd: timing.responseEnd - start,
                    domInteractive: timing.domInteractive - start
                  };
                }
                const paints = performance.getEntriesByType('paint').map(p => ({ name: p.name, startTime: p.startTime }));
                return {
                  navTiming: navData,
                  memory,
                  paints
                };
              } catch(e) { return null; }
            })()
          `, (result, isException) => resolve(isException ? null : result));
        });
        if (perfRes) data.performance = perfRes;
      }

      if (config.dom) {
        const domRes = await new Promise((resolve) => {
          browser.devtools.inspectedWindow.eval(`
            (function() {
              try {
                const el = $0;
                if (!el) return null;
                const rect = el.getBoundingClientRect();
                return {
                  tag: el.tagName,
                  id: el.id,
                  className: el.className,
                  text: el.textContent ? el.textContent.slice(0, 500) : '',
                  html: el.outerHTML ? el.outerHTML.slice(0, 1000) : '',
                  attributes: Array.from(el.attributes).map(a => ({name: a.name, value: a.value})),
                  rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
                };
              } catch(e) { return null; }
            })()
          `, (result, isException) => resolve(isException ? null : result));
        });
        if (domRes) data.dom = domRes;
      }

      if (config.network) {
        const harLog = await new Promise<any>((resolve) => {
          browser.devtools.network.getHAR((har) => resolve(har));
        });
        if (harLog && harLog.entries) {
          harEntriesRef.current = harLog.entries;
          data.network = harLog.entries.map((entry: any, idx: number) => ({
            id: 'net_' + idx,
            method: entry.request.method,
            url: entry.request.url,
            status: entry.response.status,
            duration: Math.round(entry.time),
            mimeType: entry.response.content?.mimeType,
            size: entry.response.content?.size,
            initiator: entry._initiator?.type || 'unknown'
          }));
        }
      }

      if (config.console) {
        const logsRes = await new Promise((resolve) => {
          browser.devtools.inspectedWindow.eval('window.__browserbotLogs || []', (result, isException) => resolve(isException ? [] : result));
        });
        if (logsRes && Array.isArray(logsRes)) {
          data.logs = logsRes.map((l: any, idx: number) => ({ ...l, id: 'log_' + idx }));
        }
      }

      setCapturedData(data);
      
      // Select all by default
      if (data.logs) setSelectedLogIds(new Set(data.logs.map(l => l.id)));
      if (data.network) setSelectedNetworkIds(new Set(data.network.map(n => n.id)));
      setIncludeDom(!!data.dom);
      setIncludePerf(!!data.performance);
      
      let statusMsg = '✅ Captured ';
      if (!data.dom) statusMsg += '(No element selected in Elements tab. ';
      else statusMsg += '(' + data.dom.tag + ' element. ';
      
      setCaptureStatus(statusMsg + ')');
    } catch (e: any) {
      setCaptureStatus(`Error: ${e.message}`);
    }
    setIsCapturing(false);
  };

  const buildSystemPrompt = async () => {
    let prompt = `You are an expert web developer and debugger AI assistant. The user needs help analyzing DevTools data captured from the inspected webpage.\n\n`;

    if (capturedData?.metadata) {
      const m = capturedData.metadata;
      prompt += `## Capture Metadata\n`;
      prompt += `- **URL**: ${m.url}\n`;
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
      capturedData.logs.filter(l => selectedLogIds.has(l.id)).forEach(l => {
        prompt += `[${new Date(l.ts).toISOString()}] [${l.level.toUpperCase()}] ${l.text}\n`;
        if (l.stack) prompt += `Stack:\n${l.stack}\n`;
      });
      prompt += '\n';
    }
    
    if (capturedData?.network?.length && selectedNetworkIds.size > 0) {
      const selectedNet = capturedData.network.filter(n => selectedNetworkIds.has(n.id));
      
      if (config.networkDisplayMode === 'summary' || config.networkDisplayMode === 'both') {
        prompt += `## Network Summary (${selectedNet.length} requests)\n`;
        prompt += `| URL | Method | Status | Time | Size | Initiator | Flag |\n`;
        prompt += `|-----|--------|--------|------|------|-----------|------|\n`;
        for (const n of selectedNet) {
          let flag = '';
          if (n.status >= 400) flag = '❌ FAILED';
          else if (n.duration > 1000) flag = '⚠️ SLOW';
          const sizeStr = n.size ? Math.round(n.size / 1024) + 'KB' : '-';
          const init = (n as any).initiator || '-';
          prompt += `| ${n.url} | ${n.method} | ${n.status} | ${n.duration}ms | ${sizeStr} | ${init} | ${flag} |\n`;
        }
        prompt += '\n';
      }

      if (config.networkDisplayMode === 'details' || config.networkDisplayMode === 'both') {
        prompt += `## Network Details\n`;
        for (const n of selectedNet) {
          const rawIdx = parseInt(n.id.split('_')[1]);
          const rawEntry = harEntriesRef.current[rawIdx];
          prompt += `### ${n.method} ${n.url} - Status: ${n.status} (${n.duration}ms) ${n.mimeType || ''} ${n.size ? n.size + 'B' : ''}\n`;
          
          if (rawEntry) {
            if (config.networkHeaders) {
               if (rawEntry.request?.headers?.length) {
                 const filteredReqHeaders = rawEntry.request.headers.filter((h: any) => h.name.toLowerCase() !== 'cookie');
                 prompt += `**Request Headers:**\n` + filteredReqHeaders.map((h: any) => `${h.name}: ${h.value}`).join('\n') + '\n';
               }
               if (rawEntry.response?.headers?.length) {
                 const filteredResHeaders = rawEntry.response.headers.filter((h: any) => h.name.toLowerCase() !== 'set-cookie');
                 prompt += `**Response Headers:**\n` + filteredResHeaders.map((h: any) => `${h.name}: ${h.value}`).join('\n') + '\n';
               }
            }
            if (config.networkCookies) {
               if (rawEntry.request?.cookies?.length) {
                 prompt += `**Cookies:**\n` + rawEntry.request.cookies.map((c: any) => config.cookieValues ? `${c.name}=${c.value}` : c.name).join('; ') + '\n';
               }
            }
            if (config.networkPayload && rawEntry.request?.postData) {
               const pd = rawEntry.request.postData;
               if (pd.text) {
                 prompt += `**Request Payload:**\n${pd.text}\n`;
               } else if (pd.params && pd.params.length) {
                 prompt += `**Request Payload:**\n${pd.params.map((p: any) => p.name + '=' + p.value).join('&')}\n`;
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

               if (shouldFetch) {
                  const sizeLimit = config.allowLargeBodies ? 5000000 : 50000;
                  if (n.size && n.size > sizeLimit) {
                    prompt += `**Response Body:** (Skipped, size ${Math.round(n.size/1024)}KB exceeds threshold)\n`;
                  } else {
                try {
                   const body = await new Promise<string>((resolve) => {
                     try {
                       const result = rawEntry.getContent((content: string) => resolve(content || ''));
                       if (result && typeof result.then === 'function') {
                         result.then((res: any) => {
                           if (Array.isArray(res)) resolve(res[0] || '');
                           else if (res && typeof res === 'object' && res.content) resolve(res.content || '');
                           else resolve((res as string) || '');
                         }).catch(() => resolve(''));
                       }
                     } catch(err) {
                       try {
                         let targetEntry = rawEntry;
                         if (typeof targetEntry.getContent !== 'function') {
                           // Firefox fallback for getHAR items missing getContent
                           const match = requestCacheRef.current.find(r => r.request.url === rawEntry.request.url && r.request.method === rawEntry.request.method);
                           if (match) targetEntry = match;
                         }
                         const result = targetEntry.getContent();
                         if (result && typeof result.then === 'function') {
                           result.then((res: any) => {
                             if (Array.isArray(res)) resolve(res[0] || '');
                             else if (res && typeof res === 'object' && res.content) resolve(res.content || '');
                             else resolve((res as string) || '');
                           }).catch(() => resolve(''));
                         } else {
                           resolve('[Unavailable: In Firefox, you must open this panel before the page loads to capture response bodies]');
                         }
                       } catch (e) {
                         resolve('[Unavailable: In Firefox, you must open this panel before the page loads to capture response bodies]');
                       }
                     }
                   });
                     if (body) {
                       prompt += `**Response Body:**\n\`\`\`\n${body.slice(0, sizeLimit)}${body.length > sizeLimit ? '\n...[TRUNCATED]' : ''}\n\`\`\`\n`;
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
    }
    
    if (includePerf && capturedData?.performance) {
      prompt += `## Page Performance\n`;
      prompt += `Navigation Timing: ${JSON.stringify(capturedData.performance.navTiming, null, 2)}\n`;
      if (capturedData.performance.paints) {
        prompt += `Paints: ${JSON.stringify(capturedData.performance.paints)}\n`;
      }
      if (capturedData.performance.memory) {
        prompt += `Memory: ${JSON.stringify(capturedData.performance.memory, null, 2)}\n`;
      }
      prompt += '\n';
    }

    prompt += `Answer with specific, actionable debugging advice. Reference exact values from the data. IMPORTANT: Always format your responses using markdown.\n`;
    return prompt;
  };

  const copyContext = async () => {
    if (!capturedData) return;
    const prompt = await buildSystemPrompt();
    navigator.clipboard.writeText(prompt).then(() => {
      setCaptureStatus('✅ Context copied to clipboard!');
      setTimeout(() => setCaptureStatus(''), 2000);
    });
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (isStreaming || !text) return;

    let chatMessages = messages;
    if (!chatMessages.some(m => m.role === 'system')) {
      const systemPrompt = await buildSystemPrompt();
      chatMessages = [{ role: 'system', content: systemPrompt }, ...chatMessages];
    }
    
    chatMessages = [
        ...chatMessages.filter(m => m.role !== 'error'),
        { role: 'user', content: text }
    ];

    setMessages(prev => [...prev, { role: 'user', content: text }, { role: 'assistant', content: '' }]);
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
      sessionId: sessionIdRef.current
    });
  };

  const renderMarkdown = (content: string) => {
    if (!content) return '';
    try {
      let html = marked.parse(content) as string;
      html = html.replace(/<pre><code([^>]*)>/g, (_match, attrs) => `<div class="askpage-code-wrapper"><button class="askpage-copy-btn" onclick="(function(btn){var code=btn.parentElement.querySelector('code');navigator.clipboard.writeText(code.innerText).then(function(){btn.textContent='Copied!';setTimeout(function(){btn.textContent='Copy'},1500)});})(this)">Copy</button><pre><code${attrs}>`);
      return html.replace(/<\/code><\/pre>/g, '</code></pre></div>');
    } catch { return content; }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const abortStream = () => {
    browser.runtime.sendMessage({ type: 'ASK_PAGE_CHAT_ABORT' });
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

  // ── helpers ──────────────────────────────────────────────────────────────
  const S = {
    // sidebar
    sidebar: (collapsed: boolean): React.CSSProperties => ({
      width: collapsed ? '40px' : '360px',
      minWidth: collapsed ? '40px' : '360px',
      background: '#16171d',
      borderRight: '1px solid #2a2b35',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'width 0.2s ease, min-width 0.2s ease',
      position: 'relative',
    }),
    card: (): React.CSSProperties => ({
      background: '#1e1f28',
      border: '1px solid #2a2b35',
      borderRadius: '8px',
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }),
    sectionTitle: (): React.CSSProperties => ({
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.06em',
      textTransform: 'uppercase' as const,
      color: '#6b7280',
      marginBottom: '4px',
    }),
    label: (indent = false): React.CSSProperties => ({
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px',
      color: '#d1d5db',
      cursor: 'pointer',
      marginLeft: indent ? '20px' : 0,
    }),
    badge: (color: string): React.CSSProperties => ({
      fontSize: '10px',
      fontWeight: 700,
      padding: '1px 6px',
      borderRadius: '10px',
      background: color,
      color: '#fff',
      marginLeft: 'auto',
    }),
    btn: (primary = false, disabled = false): React.CSSProperties => ({
      padding: primary ? '9px 0' : '7px 12px',
      flex: primary ? 1 : undefined,
      fontSize: '13px',
      fontWeight: 600,
      borderRadius: '7px',
      border: primary ? 'none' : '1px solid #374151',
      background: primary ? (disabled ? '#4b3c38' : '#e17055') : '#252630',
      color: primary ? (disabled ? '#9ca3af' : '#fff') : '#d1d5db',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      opacity: disabled ? 0.6 : 1,
      transition: 'background 0.15s',
    }),
    select: (): React.CSSProperties => ({
      width: '100%',
      padding: '5px 8px',
      fontSize: '12px',
      borderRadius: '6px',
      border: '1px solid #374151',
      background: '#252630',
      color: '#d1d5db',
    }),
    filterInput: (): React.CSSProperties => ({
      width: '100%',
      padding: '5px 8px',
      fontSize: '12px',
      borderRadius: '6px',
      border: '1px solid #374151',
      background: '#252630',
      color: '#d1d5db',
      boxSizing: 'border-box' as const,
    }),
    listBox: (): React.CSSProperties => ({
      maxHeight: '160px',
      overflowY: 'auto' as const,
      background: '#13141a',
      border: '1px solid #2a2b35',
      borderRadius: '6px',
      padding: '4px',
    }),
    listRow: (error = false): React.CSSProperties => ({
      display: 'flex',
      alignItems: 'flex-start',
      gap: '6px',
      fontSize: '11px',
      padding: '3px 4px',
      borderRadius: '4px',
      cursor: 'pointer',
      color: error ? '#f87171' : '#9ca3af',
    }),
    collapseBtn: (): React.CSSProperties => ({
      position: 'absolute' as const,
      top: '50%',
      right: '-12px',
      transform: 'translateY(-50%)',
      width: '24px',
      height: '40px',
      background: '#252630',
      border: '1px solid #374151',
      borderRadius: '6px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#9ca3af',
      zIndex: 10,
      padding: 0,
    }),
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#13141a', fontFamily: 'system-ui, sans-serif', color: '#f3f4f6' }}>

      {/* ── Sidebar ── */}
      <div style={S.sidebar(sidebarCollapsed)}>
        {/* Collapse toggle on the edge */}
        <button style={S.collapseBtn()} onClick={() => setSidebarCollapsed(c => !c)} title={sidebarCollapsed ? 'Expand panel' : 'Collapse panel'}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            {sidebarCollapsed ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>}
          </svg>
        </button>

        {/* Inner content — hidden when collapsed */}
        {!sidebarCollapsed && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e17055" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#f9fafb' }}>Capture Settings</span>
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '-4px' }}>Select an element in Elements tab before capturing.</div>

            {/* Console section */}
            <div style={S.card()}>
              <div style={S.sectionTitle()}>Console</div>
              <label style={S.label()}>
                <input type="checkbox" checked={config.console} onChange={e => setConfig({...config, console: e.target.checked})} />
                Capture Console Logs
              </label>
              <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.5' }}>
                Logs are only captured after injecting the logger script below.
              </div>
              <button style={{ ...S.btn(), fontSize: '12px', padding: '6px 10px', alignSelf: 'flex-start' }} onClick={injectLogger}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Inject Logger &amp; Reload
              </button>
            </div>

            {/* Capture sources */}
            <div style={S.card()}>
              <div style={S.sectionTitle()}>Capture Sources</div>
              <label style={S.label()}>
                <input type="checkbox" checked={config.network} onChange={e => setConfig({...config, network: e.target.checked})} />
                Network (HAR)
              </label>
              <label style={S.label()}>
                <input type="checkbox" checked={config.dom} onChange={e => setConfig({...config, dom: e.target.checked})} />
                Selected DOM Element ($0)
              </label>
              <label style={S.label()}>
                <input type="checkbox" checked={config.performance} onChange={e => setConfig({...config, performance: e.target.checked})} />
                Performance &amp; Memory
              </label>
            </div>

            {/* Network options */}
            <div style={S.card()}>
              <div style={S.sectionTitle()}>Network Options</div>
              <div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Format</div>
                <select style={S.select()} value={config.networkDisplayMode} onChange={e => setConfig({...config, networkDisplayMode: e.target.value as 'summary'|'details'|'both'})}>
                  <option value="summary">Summary Table Only</option>
                  <option value="details">Full Details Only</option>
                  <option value="both">Both (Summary + Details)</option>
                </select>
              </div>
              <label style={S.label()}>
                <input type="checkbox" checked={config.networkHeaders} onChange={e => setConfig({...config, networkHeaders: e.target.checked})} />
                Include Headers
              </label>
              <label style={S.label()}>
                <input type="checkbox" checked={config.networkCookies} onChange={e => setConfig({...config, networkCookies: e.target.checked})} />
                Include Cookies
              </label>
              {config.networkCookies && (
                <label style={S.label(true)}>
                  <input type="checkbox" checked={config.cookieValues} onChange={e => setConfig({...config, cookieValues: e.target.checked})} />
                  Show Cookie Values
                </label>
              )}
              <label style={S.label()}>
                <input type="checkbox" checked={config.networkPayload} onChange={e => setConfig({...config, networkPayload: e.target.checked})} />
                Include Request Payload
              </label>
              <label style={S.label()}>
                <input type="checkbox" checked={config.networkResponseBody} onChange={e => setConfig({...config, networkResponseBody: e.target.checked})} />
                Include Response Bodies
              </label>
              {config.networkResponseBody && (
                <div style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Body MIME filters</div>
                  {(['includeHtml','includeCss','includeJs'] as const).map(k => (
                    <label key={k} style={S.label()}>
                      <input type="checkbox" checked={config[k]} onChange={e => setConfig({...config, [k]: e.target.checked})} />
                      {k === 'includeHtml' ? 'HTML' : k === 'includeCss' ? 'CSS' : 'JS'}
                    </label>
                  ))}
                  <label style={S.label()}>
                    <input type="checkbox" checked={config.allowLargeBodies} onChange={e => setConfig({...config, allowLargeBodies: e.target.checked})} />
                    Allow &gt;50KB bodies
                  </label>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={S.btn(true, isCapturing)} onClick={captureDevToolsData} disabled={isCapturing}>
                {isCapturing
                  ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg> Capturing…</>
                  : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg> Capture Snapshot</>}
              </button>
              <button style={S.btn(false, !capturedData)} onClick={copyContext} disabled={!capturedData} title="Copy context to clipboard">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>

            {captureStatus && (
              <div style={{ fontSize: '12px', padding: '6px 10px', borderRadius: '6px', background: captureStatus.startsWith('✅') ? '#052e16' : '#450a0a', color: captureStatus.startsWith('✅') ? '#4ade80' : '#f87171', border: `1px solid ${captureStatus.startsWith('✅') ? '#166534' : '#7f1d1d'}` }}>
                {captureStatus}
              </div>
            )}

            {/* Context payload selectors */}
            {capturedData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#6b7280', paddingTop: '4px', borderTop: '1px solid #2a2b35' }}>Context Payload</div>

                {capturedData.dom && (
                  <label style={S.label()}>
                    <input type="checkbox" checked={includeDom} onChange={e => setIncludeDom(e.target.checked)} />
                    <span>$0 <strong style={{ color: '#e17055' }}>{capturedData.dom.tag}</strong></span>
                  </label>
                )}
                {capturedData.performance && (
                  <label style={S.label()}>
                    <input type="checkbox" checked={includePerf} onChange={e => setIncludePerf(e.target.checked)} />
                    Performance Metrics
                  </label>
                )}

                {capturedData.logs && capturedData.logs.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#d1d5db' }}>Console Logs</span>
                      <span style={S.badge('#374151')}>{selectedLogIds.size}/{capturedData.logs.length}</span>
                    </div>
                    <div style={S.listBox()}>
                      {capturedData.logs.map(log => (
                        <label key={log.id} style={S.listRow(log.level === 'error')}>
                          <input type="checkbox" checked={selectedLogIds.has(log.id)} onChange={() => toggleLogId(log.id)} style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span style={{ wordBreak: 'break-all' }}>[{log.level}] {log.text.substring(0, 80)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {capturedData.network && capturedData.network.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#d1d5db' }}>Network</span>
                      <span style={S.badge(selectedNetworkIds.size < capturedData.network.length ? '#7c3aed' : '#374151')}>{selectedNetworkIds.size}/{capturedData.network.length}</span>
                      <button onClick={() => setSelectedNetworkIds(new Set(capturedData.network!.map(n => n.id)))} style={{ marginLeft: 'auto', fontSize: '11px', cursor: 'pointer', background: 'none', border: 'none', color: '#60a5fa' }}>All</button>
                      <button onClick={() => setSelectedNetworkIds(new Set())} style={{ fontSize: '11px', cursor: 'pointer', background: 'none', border: 'none', color: '#60a5fa' }}>None</button>
                    </div>
                    <input type="text" placeholder="🔍 Filter by URL or method…" value={networkFilter} onChange={e => setNetworkFilter(e.target.value)} style={S.filterInput()} />
                    <div style={S.listBox()}>
                      {capturedData.network
                        .filter(r => r.url.toLowerCase().includes(networkFilter.toLowerCase()) || r.method.toLowerCase().includes(networkFilter.toLowerCase()))
                        .map(req => (
                          <label key={req.id} style={S.listRow(req.status >= 400)}>
                            <input type="checkbox" checked={selectedNetworkIds.has(req.id)} onChange={() => toggleNetworkId(req.id)} style={{ marginTop: '2px', flexShrink: 0 }} />
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', wordBreak: 'break-all', minWidth: 0 }}>
                              <span style={{ fontFamily: 'monospace', fontSize: '10px', padding: '1px 5px', borderRadius: '3px', background: req.status >= 400 ? '#7f1d1d' : '#1e3a5f', color: req.status >= 400 ? '#fca5a5' : '#93c5fd', flexShrink: 0 }}>{req.method}</span>
                              <span style={{ color: req.status >= 400 ? '#f87171' : '#9ca3af' }}>{req.status}</span>
                              <span style={{ color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(() => { try { return new URL(req.url).pathname; } catch { return req.url; } })()}</span>
                            </span>
                          </label>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Collapsed state — show icon only */}
        {sidebarCollapsed && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '16px', gap: '16px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {capturedData && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }} title="Data captured" />}
          </div>
        )}
      </div>

      {/* ── Main Chat Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', background: '#13141a', color: '#f3f4f6', overflow: 'hidden' }}>

        {/* History sidebar */}
        {showHistory && (
          <div className="askpage-history-sidebar" style={{ left: 0, right: 'auto', borderRight: '1px solid #374151', borderLeft: 'none' }}>
            <div className="askpage-history-header">
              <h4>Chat History</h4>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="askpage-history-new" onClick={startNewChat}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                  New
                </button>
                <button className="askpage-history-close" onClick={() => setShowHistory(false)} title="Close">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
            <input className="askpage-history-search" placeholder="Search DevTools chats…" value={historySearch} onChange={e => setHistorySearch(e.target.value)} />
            <div className="askpage-history-list">
              {conversations.filter(c => !historySearch || c.title.toLowerCase().includes(historySearch.toLowerCase())).map(conv => (
                <div key={conv.id} className={`askpage-history-item ${activeConversationId === conv.id ? 'active' : ''}`}>
                  <button className="askpage-history-item-main" onClick={() => loadConversation(conv)}>
                    <div className="askpage-history-item-title">{conv.title.replace('[DevTools] ', '')}</div>
                    <div className="askpage-history-item-meta">{new Date(conv.updatedAt).toLocaleDateString()} · {conv.messages.filter(m => m.role === 'user').length} msgs</div>
                  </button>
                  <button className="askpage-history-item-delete" onClick={e => { e.stopPropagation(); deleteConversation(conv.id); }} title="Delete">×</button>
                </div>
              ))}
              {conversations.length === 0 && <div className="askpage-history-empty">No DevTools chats yet</div>}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="askpage-controls" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className={`askpage-header-btn askpage-history-btn ${showHistory ? 'active' : ''}`} onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadConversations(); }} title="Chat History">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </button>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff', flex: 1 }}>AI Debugger</span>
          {messages.length > 0 && (
            <button className="askpage-header-btn" onClick={clearConversation} title="New conversation">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          )}
          <select className="askpage-select" style={{ width: 'auto' }} value={providerType === 'openai' ? `openai:${selectedOpenAIId}` : providerType} onChange={e => { const v = e.target.value; if (v.startsWith('openai:')) { setProviderType('openai'); setSelectedOpenAIId(v.replace('openai:', '')); } else { setProviderType(v as AIProviderType); } }}>
            {openaiProviders.map(p => <option key={p.id} value={`openai:${p.id}`}>{p.name} ({p.model})</option>)}
            <option value="ollama">Ollama ({ollamaModel})</option>
            <option value="chrome_ai">Chrome AI</option>
          </select>
        </div>

        {/* Messages */}
        <div className="askpage-messages" ref={messagesContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {messages.length === 0 ? (
            <div className="askpage-welcome">
              <h3>AI Debugger Panel</h3>
              <p>Capture DevTools context from the sidebar, select exactly what to share, and ask the AI to debug, optimize, or explain.</p>
            </div>
          ) : messages.map((msg, i) => {
            const isLast = i === messages.length - 1;
            const streaming = isStreaming && isLast && msg.role === 'assistant';
            const liveThinking = streaming && thinkingContent;
            return (
              <div key={i} className={`askpage-msg-wrapper ${msg.role}`}>
                {msg.role === 'assistant' && (msg.thinking || liveThinking) && (
                  <details className="askpage-thinking-block" open={liveThinking ? thinkingExpanded : undefined}>
                    <summary className="askpage-thinking-summary" onClick={liveThinking ? e => { e.preventDefault(); setThinkingExpanded(!thinkingExpanded); } : undefined}>
                      {liveThinking ? 'Thinking…' : 'Thinking process'}
                    </summary>
                    <div className="askpage-thinking-content" dangerouslySetInnerHTML={{ __html: renderMarkdown((liveThinking ? thinkingContent : msg.thinking) as string) }} />
                  </details>
                )}
                <div className={`askpage-msg ${msg.role}`} {...(msg.role === 'assistant' ? { dangerouslySetInnerHTML: { __html: renderMarkdown(msg.content) || '<span style="opacity:0.3">Thinking…</span>' } } : {})}>
                  {msg.role !== 'assistant' ? msg.content : undefined}
                </div>
              </div>
            );
          })}
          {isStreaming && !thinkingContent && messages[messages.length - 1]?.content === '' && (
            <div className="askpage-typing"><div className="askpage-typing-dot"/><div className="askpage-typing-dot"/><div className="askpage-typing-dot"/></div>
          )}
        </div>

        {/* Input */}
        <div className="askpage-input-area" style={{ padding: '20px' }}>
          <textarea ref={inputRef} className="askpage-input" value={input}
            onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
            onKeyDown={handleKeyDown} placeholder="Ask about the captured DevTools data…" rows={1}
            disabled={isStreaming || (!capturedData && messages.length === 0)}
            style={{ opacity: (!capturedData && messages.length === 0) ? 0.5 : 1 }}
          />
          {isStreaming
            ? <button className="askpage-send-btn" onClick={abortStream} title="Stop"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg></button>
            : <button className="askpage-send-btn" onClick={sendMessage} disabled={!input.trim()} title="Send"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
          }
        </div>

      </div>
    </div>
  );
}
