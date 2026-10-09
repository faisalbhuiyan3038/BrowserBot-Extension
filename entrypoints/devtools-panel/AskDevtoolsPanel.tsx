import { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';
import { AppStorage, OpenAIProvider, AIProviderType, ChatMsg, Conversation, generateUUID, DEFAULT_DEVTOOLS_SYSTEM_PROMPT } from '../../utils/storage';
import { DevtoolsSidebar } from './components/DevtoolsSidebar';
import { DevtoolsChatArea } from './components/DevtoolsChatArea';
import type { DevToolsConfig, DevToolsData } from './types';
import { inferInitiator } from './types';
import type { ParsedAIAction } from '../../utils/actionExecutor';
import { executeTabGroups, executeBookmarkPlan } from '../../utils/actionExecutor';
import { getBookmarkTree } from '../../utils/bookmarks';

marked.setOptions({ breaks: true, gfm: true });

const MARKDOWN_FORMAT_INSTRUCTION = '\n\nIMPORTANT: Always format your responses using markdown. Use headings, bullet points, code blocks, bold, italic, and other markdown features to make your responses well-structured and readable.';

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
  const sessionIdRef = useRef<string>(generateUUID());
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
    sessionIdRef.current = generateUUID();
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
            initiator: inferInitiator(entry)
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

  const buildPreamble = () => {
    const meta = capturedData?.metadata;
    return (devtoolsSystemPrompt || DEFAULT_DEVTOOLS_SYSTEM_PROMPT)
      .replace(/{url}/g,                meta?.url           || '')
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
    let prompt = '';

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
                     const timer = setTimeout(() => resolve(''), 600);
                     try {
                       const onDone = (content: string) => {
                         clearTimeout(timer);
                         resolve(content || '');
                       };
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
                         let targetEntry = rawEntry;
                         if (typeof targetEntry.getContent !== 'function') {
                           // Firefox fallback for getHAR items missing getContent
                           const match = requestCacheRef.current.find(r => r.request.url === rawEntry.request.url && r.request.method === rawEntry.request.method);
                           if (match) targetEntry = match;
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
    for (const m of messages) {
      if (m.role === 'error') continue;
      if (m.role === 'assistant') {
        const c = m.content || (m.thinking ? `[Thinking process: ${m.thinking}]` : '');
        if (c) chatMessages.push({ role: 'assistant', content: c });
      } else {
        chatMessages.push({ role: m.role, content: m.content });
      }
    }
    chatMessages.push({ role: 'user', content: text });

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
      return html.replace(/<\/code><\/pre>/g, '</code></pre></div>');
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
        onChangeConfig={setConfig}
        onInjectLogger={injectLogger}
        isCapturing={isCapturing}
        onCapture={captureDevToolsData}
        capturedData={capturedData}
        onCopyContext={copyContext}
        captureStatus={captureStatus}
        includeDom={includeDom}
        onToggleIncludeDom={setIncludeDom}
        includePerf={includePerf}
        onToggleIncludePerf={setIncludePerf}
        selectedLogIds={selectedLogIds}
        onToggleLogId={toggleLogId}
        selectedNetworkIds={selectedNetworkIds}
        onToggleNetworkId={toggleNetworkId}
        onSelectAllNetwork={() => setSelectedNetworkIds(new Set(capturedData?.network?.map(n => n.id) || []))}
        onDeselectAllNetwork={() => setSelectedNetworkIds(new Set())}
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
