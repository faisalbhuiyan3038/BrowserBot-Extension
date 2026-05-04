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

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamingContentRef = useRef('');
  const streamingThinkingRef = useRef('');
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  const harEntriesRef = useRef<any[]>([]);

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
      window.__browserbotLogs = [];
      const _log = console.log, _warn = console.warn, _error = console.error;
      console.log = function(...args) { window.__browserbotLogs.push({ ts: Date.now(), level: 'log', text: args.join(' ') }); _log.apply(console, args); };
      console.warn = function(...args) { window.__browserbotLogs.push({ ts: Date.now(), level: 'warn', text: args.join(' ') }); _warn.apply(console, args); };
      console.error = function(...args) { window.__browserbotLogs.push({ ts: Date.now(), level: 'error', text: args.join(' '), stack: args[0] && args[0].stack ? args[0].stack : '' }); _error.apply(console, args); };
    `;
    browser.devtools.inspectedWindow.reload({ injectedScript: script });
    setCaptureStatus('Logger injected & page reloading.');
  };

  const captureDevToolsData = async () => {
    setIsCapturing(true);
    setCaptureStatus('Capturing from DevTools...');
    try {
      const data: DevToolsData = {};

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
    
    if (capturedData?.logs?.length && selectedLogIds.size > 0) {
      prompt += `## Console Logs\n`;
      capturedData.logs.filter(l => selectedLogIds.has(l.id)).forEach(l => {
        prompt += `[${new Date(l.ts).toISOString()}] [${l.level.toUpperCase()}] ${l.text}\n`;
        if (l.stack) prompt += `Stack:\n${l.stack}\n`;
      });
      prompt += '\n';
    }
    
    if (capturedData?.network?.length && selectedNetworkIds.size > 0) {
      prompt += `## Network Requests\n`;
      const selectedNet = capturedData.network.filter(n => selectedNetworkIds.has(n.id));
      for (const n of selectedNet) {
        const rawIdx = parseInt(n.id.split('_')[1]);
        const rawEntry = harEntriesRef.current[rawIdx];
        prompt += `### ${n.method} ${n.url} - Status: ${n.status} (${n.duration}ms) ${n.mimeType || ''} ${n.size ? n.size + 'B' : ''}\n`;
        
        if (rawEntry) {
          if (config.networkHeaders) {
             if (rawEntry.request?.headers?.length) {
               prompt += `**Request Headers:**\n` + rawEntry.request.headers.map((h: any) => `${h.name}: ${h.value}`).join('\n') + '\n';
             }
             if (rawEntry.response?.headers?.length) {
               prompt += `**Response Headers:**\n` + rawEntry.response.headers.map((h: any) => `${h.name}: ${h.value}`).join('\n') + '\n';
             }
          }
          if (config.networkCookies) {
             if (rawEntry.request?.cookies?.length) {
               prompt += `**Cookies:**\n` + rawEntry.request.cookies.map((c: any) => `${c.name}=${c.value}`).join('; ') + '\n';
             }
          }
          if (config.networkPayload && rawEntry.request?.postData?.text) {
             prompt += `**Request Payload:**\n${rawEntry.request.postData.text}\n`;
          }
          if (config.networkResponseBody) {
             const mime = n.mimeType?.toLowerCase() || '';
             if (mime.includes('text') || mime.includes('json') || mime.includes('html') || mime.includes('xml')) {
                try {
                   const body = await new Promise<string>((resolve) => rawEntry.getContent((content: string) => resolve(content)));
                   if (body) {
                     prompt += `**Response Body:**\n\`\`\`\n${body.slice(0, 100000)}${body.length > 100000 ? '\n...[TRUNCATED]' : ''}\n\`\`\`\n`;
                   }
                } catch(e) {}
             }
          }
        }
        prompt += '\n';
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

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Sidebar Controls */}
      <div style={{ width: '380px', backgroundColor: '#fff', borderRight: '1px solid #e5e7eb', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#111827' }}>AI Debugger Panel</h2>
        
        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '10px' }}>
          Select elements in the <strong>Elements</strong> tab before capturing.
        </div>

        <div style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}>
            <input type="checkbox" checked={config.console} onChange={e => setConfig({...config, console: e.target.checked})} />
            Capture Console Logs
          </label>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Chrome extension APIs cannot read past logs natively. You must inject a logger script and reload the page to capture them automatically.
          </div>
          <button 
            onClick={injectLogger}
            style={{ padding: '6px 10px', fontSize: '12px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', alignSelf: 'flex-start' }}
          >
            Inject Logger & Reload Page
          </button>
        </div>

        <div style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}>
            <input type="checkbox" checked={config.network} onChange={e => setConfig({...config, network: e.target.checked})} />
            Capture Network History (HAR)
          </label>
        </div>

        <div style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}>
            <input type="checkbox" checked={config.dom} onChange={e => setConfig({...config, dom: e.target.checked})} />
            Capture Selected DOM Element ($0)
          </label>

          <div style={{ paddingBottom: '10px', borderBottom: '1px solid #374151' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Performance</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <input type="checkbox" checked={config.performance} onChange={e => setConfig({ ...config, performance: e.target.checked })} />
              Navigation Timing & Memory
            </label>
          </div>
          
          <div style={{ paddingBottom: '10px' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Network Options</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
              <input type="checkbox" checked={config.networkHeaders} onChange={e => setConfig({ ...config, networkHeaders: e.target.checked })} />
              Include Headers
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginTop: '4px' }}>
              <input type="checkbox" checked={config.networkCookies} onChange={e => setConfig({ ...config, networkCookies: e.target.checked })} />
              Include Cookies
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginTop: '4px' }}>
              <input type="checkbox" checked={config.networkPayload} onChange={e => setConfig({ ...config, networkPayload: e.target.checked })} />
              Include Request Payload
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', marginTop: '4px' }}>
              <input type="checkbox" checked={config.networkResponseBody} onChange={e => setConfig({ ...config, networkResponseBody: e.target.checked })} />
              Include Response Body (lazy fetched)
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button 
            onClick={captureDevToolsData}
            disabled={isCapturing}
            style={{ flex: 1, padding: '10px', backgroundColor: '#e17055', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: isCapturing ? 'not-allowed' : 'pointer' }}
          >
            {isCapturing ? 'Capturing...' : 'Capture Snapshot'}
          </button>
          
          <button 
            onClick={copyContext}
            disabled={!capturedData}
            style={{ padding: '10px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontWeight: 500, cursor: !capturedData ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Copy Context to Clipboard"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
        </div>

        {captureStatus && (
          <div style={{ fontSize: '13px', color: captureStatus.startsWith('✅') ? '#059669' : '#dc2626', marginTop: '4px' }}>
            {captureStatus}
          </div>
        )}

        {capturedData && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <h3 style={{ fontSize: '14px', margin: 0, paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>Context Payload</h3>
            
            {capturedData.dom && (
              <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input type="checkbox" checked={includeDom} onChange={e => setIncludeDom(e.target.checked)} />
                <strong>$0 DOM Element:</strong> {capturedData.dom.tag}
              </label>
            )}
            
            {capturedData.performance && (
              <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input type="checkbox" checked={includePerf} onChange={e => setIncludePerf(e.target.checked)} />
                <strong>Performance Metrics</strong>
              </label>
            )}

            {capturedData.logs && capturedData.logs.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>Console Logs ({selectedLogIds.size}/{capturedData.logs.length}):</div>
                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '4px' }}>
                  {capturedData.logs.map(log => (
                    <label key={log.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', padding: '2px 0' }}>
                      <input type="checkbox" checked={selectedLogIds.has(log.id)} onChange={() => toggleLogId(log.id)} style={{ marginTop: '3px' }} />
                      <span style={{ wordBreak: 'break-all', color: log.level === 'error' ? '#dc2626' : '#374151' }}>[{log.level}] {log.text.substring(0, 100)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {capturedData.network && capturedData.network.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Network Requests ({selectedNetworkIds.size}/{capturedData.network.length}):</span>
                  <div>
                    <button onClick={() => setSelectedNetworkIds(new Set(capturedData.network!.map(n => n.id)))} style={{ fontSize: '11px', cursor: 'pointer', background: 'none', border: 'none', color: '#2563eb' }}>All</button>
                    <button onClick={() => setSelectedNetworkIds(new Set())} style={{ fontSize: '11px', cursor: 'pointer', background: 'none', border: 'none', color: '#2563eb' }}>None</button>
                  </div>
                </div>
                <input 
                  type="text" 
                  placeholder="Filter requests..." 
                  value={networkFilter} 
                  onChange={e => setNetworkFilter(e.target.value)} 
                  style={{ width: '100%', padding: '4px', fontSize: '12px', border: '1px solid #d1d5db', borderRadius: '4px' }} 
                />
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '4px', padding: '4px' }}>
                  {capturedData.network.filter(req => req.url.toLowerCase().includes(networkFilter.toLowerCase()) || req.method.toLowerCase().includes(networkFilter.toLowerCase())).map(req => (
                    <label key={req.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '12px', padding: '2px 0' }}>
                      <input type="checkbox" checked={selectedNetworkIds.has(req.id)} onChange={() => toggleNetworkId(req.id)} style={{ marginTop: '3px' }} />
                      <span style={{ wordBreak: 'break-all', color: req.status >= 400 ? '#dc2626' : '#374151' }}>
                        <strong>{req.method}</strong> {req.status} - {new URL(req.url).pathname}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', background: '#13141a', color: '#f3f4f6', overflow: 'hidden' }}>
        
        {/* History sidebar */}
        {showHistory && (
          <div className="askpage-history-sidebar" style={{ left: 0, right: 'auto', borderRight: '1px solid #374151', borderLeft: 'none' }}>
            <div className="askpage-history-header">
              <h4>Chat History</h4>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="askpage-history-new" onClick={startNewChat}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  New
                </button>
                <button className="askpage-history-close" onClick={() => setShowHistory(false)} title="Close">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            <input
              className="askpage-history-search"
              placeholder="Search DevTools chats…"
              value={historySearch}
              onChange={e => setHistorySearch(e.target.value)}
            />
            <div className="askpage-history-list">
              {conversations.filter(c => !historySearch || c.title.toLowerCase().includes(historySearch.toLowerCase())).map(conv => (
                <div key={conv.id} className={`askpage-history-item ${activeConversationId === conv.id ? 'active' : ''}`}>
                  <button className="askpage-history-item-main" onClick={() => loadConversation(conv)}>
                    <div className="askpage-history-item-title">{conv.title.replace('[DevTools] ', '')}</div>
                    <div className="askpage-history-item-meta">
                      {new Date(conv.updatedAt).toLocaleDateString()} · {conv.messages.filter(m => m.role === 'user').length} msgs
                    </div>
                  </button>
                  <button className="askpage-history-item-delete" onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }} title="Delete">×</button>
                </div>
              ))}
              {conversations.length === 0 && (
                <div className="askpage-history-empty">No DevTools chats yet</div>
              )}
            </div>
          </div>
        )}

        {/* Header Options */}
        <div className="askpage-controls" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className={`askpage-header-btn askpage-history-btn ${showHistory ? 'active' : ''}`}
            onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadConversations(); }}
            title="Chat History"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </button>
          
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff', flex: 1 }}>AI Debugger Panel</span>
          
          {messages.length > 0 && (
            <button className="askpage-header-btn" onClick={clearConversation} title="New conversation">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
          )}

          <select
            className="askpage-select"
            style={{ width: 'auto' }}
            value={providerType === 'openai' ? `openai:${selectedOpenAIId}` : providerType}
            onChange={e => {
              const val = e.target.value;
              if (val.startsWith('openai:')) {
                setProviderType('openai');
                setSelectedOpenAIId(val.replace('openai:', ''));
              } else {
                setProviderType(val as AIProviderType);
              }
            }}
          >
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
          ) : (
            messages.map((msg, i) => {
              const isLastMessage = i === messages.length - 1;
              const isCurrentlyStreaming = isStreaming && isLastMessage && msg.role === 'assistant';
              const showLiveThinking = isCurrentlyStreaming && thinkingContent;
              
              return (
                <div key={i} className={`askpage-msg-wrapper ${msg.role}`}>
                  {msg.role === 'assistant' && (msg.thinking || showLiveThinking) && (
                    <details className="askpage-thinking-block" open={showLiveThinking ? thinkingExpanded : undefined}>
                      <summary className="askpage-thinking-summary" onClick={showLiveThinking ? (e) => { e.preventDefault(); setThinkingExpanded(!thinkingExpanded); } : undefined}>
                        {showLiveThinking ? 'Thinking…' : 'Thinking process'}
                      </summary>
                      <div className="askpage-thinking-content" dangerouslySetInnerHTML={{ __html: renderMarkdown((showLiveThinking ? thinkingContent : msg.thinking) as string) }} />
                    </details>
                  )}
                  <div className={`askpage-msg ${msg.role}`} {...(msg.role === 'assistant' ? { dangerouslySetInnerHTML: { __html: renderMarkdown(msg.content) || '<span style="opacity:0.3">Thinking…</span>' } } : {})}>
                    {msg.role !== 'assistant' ? msg.content : undefined}
                  </div>
                </div>
              );
            })
          )}
          {isStreaming && !thinkingContent && messages[messages.length - 1]?.content === '' && (
            <div className="askpage-typing"><div className="askpage-typing-dot"/><div className="askpage-typing-dot"/><div className="askpage-typing-dot"/></div>
          )}
        </div>

        {/* Input */}
        <div className="askpage-input-area" style={{ padding: '20px' }}>
          <textarea
            ref={inputRef}
            className="askpage-input"
            value={input}
            onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the captured DevTools data…"
            rows={1}
            disabled={isStreaming || (!capturedData && messages.length === 0)}
            style={{ opacity: (!capturedData && messages.length === 0) ? 0.5 : 1 }}
          />
          {isStreaming ? (
            <button className="askpage-send-btn" onClick={abortStream} title="Stop"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg></button>
          ) : (
            <button className="askpage-send-btn" onClick={sendMessage} disabled={!input.trim()} title="Send"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button>
          )}
        </div>

      </div>
    </div>
  );
}
