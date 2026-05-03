import { useState, useEffect, useRef, useCallback } from 'react';
import { marked } from 'marked';
import { AppStorage, SystemPrompt, OpenAIProvider, AIProviderType, Conversation, ChatMsg, generateId } from '../../utils/storage';
import { getStyles } from '../../utils/chatStyles';

marked.setOptions({ breaks: true, gfm: true });

interface DevToolsConfig {
  console: boolean;
  network: boolean;
  dom: boolean;
  domSelector: string;
  domIncludeListeners: boolean;
  performance: boolean;
}

interface DevToolsData {
  logs?: any[];
  network?: any[];
  dom?: any;
  domListeners?: any[];
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

  const [pageTitle, setPageTitle] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [tabId, setTabId] = useState<number | null>(null);

  // DevTools specific state
  const [config, setConfig] = useState<DevToolsConfig>({
    console: true,
    network: true,
    dom: false,
    domSelector: 'body',
    domIncludeListeners: true,
    performance: true,
  });
  const [capturedData, setCapturedData] = useState<DevToolsData | null>(null);
  const [captureStatus, setCaptureStatus] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamingContentRef = useRef('');
  const streamingThinkingRef = useRef('');
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    // Get tab info from URL
    const params = new URLSearchParams(window.location.search);
    const pTabId = params.get('tabId');
    if (pTabId) setTabId(parseInt(pTabId));
    setPageTitle(params.get('title') || 'Unknown Page');
    setPageUrl(params.get('url') || 'about:blank');

    if (!pTabId) {
      browser.runtime.sendMessage({ type: 'GET_ACTIVE_TAB_INFO' }).then((info: any) => {
        if (info) {
          setTabId(info.tabId);
          setPageTitle(info.title);
          setPageUrl(info.url);
        }
      });
    }

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
    return () => browser.runtime.onMessage.removeListener(listener);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => scrollToBottom(), [messages, thinkingContent, scrollToBottom]);

  const captureDevToolsData = async () => {
    if (!tabId) {
      setCaptureStatus('Error: No target tab selected.');
      return;
    }
    setIsCapturing(true);
    setCaptureStatus('Capturing (banner will appear briefly on target tab)...');
    try {
      const data = await browser.runtime.sendMessage({
        type: 'COLLECT_DEVTOOLS_DATA',
        tabId,
        config
      });
      if (data.error === 'DEVTOOLS_OPEN') {
        setCaptureStatus('🔴 Please close DevTools (F12) on the target tab and try again.');
      } else if (data.error) {
        setCaptureStatus(`Error: ${data.error}`);
      } else {
        setCapturedData(data);
        setCaptureStatus('✅ Snapshot captured!');
      }
    } catch (e: any) {
      setCaptureStatus(`Error: ${e.message}`);
    }
    setIsCapturing(false);
  };

  const buildSystemPrompt = () => {
    let prompt = `You are an expert web developer and debugger AI assistant. The user needs help analyzing DevTools data captured from a live webpage.\n\nPage: ${pageTitle}\nURL: ${pageUrl}\n\n`;
    
    if (capturedData?.logs?.length) {
      prompt += `## Console Logs (${capturedData.logs.length} entries)\n`;
      capturedData.logs.forEach(l => {
        prompt += `[${new Date(l.ts).toISOString()}] [${l.level.toUpperCase()}] ${l.text}\n`;
        if (l.stack) prompt += `Stack:\n${l.stack}\n`;
      });
      prompt += '\n';
    }
    if (capturedData?.network?.length) {
      prompt += `## Network Requests (${capturedData.network.length} entries)\n`;
      capturedData.network.forEach(n => {
        prompt += `${n.method} ${n.url} - Status: ${n.status} (${n.duration}ms)\n`;
        if (n.error) prompt += `Error: ${n.error}\n`;
        if (n.responseBody) prompt += `Response Body snippet: ${n.responseBody.substring(0, 500)}...\n`;
      });
      prompt += '\n';
    }
    if (capturedData?.dom) {
      prompt += `## DOM Inspection (selector: "${config.domSelector}")\n`;
      prompt += `Tag: ${capturedData.dom.tag}, ID: ${capturedData.dom.id}, Class: ${capturedData.dom.className}\n`;
      prompt += `Text Snippet: ${capturedData.dom.text}\n`;
      if (capturedData.domListeners?.length) {
        prompt += `Event Listeners: ${capturedData.domListeners.map((l:any) => l.type).join(', ')}\n`;
      }
      prompt += '\n';
    }
    if (capturedData?.performance) {
      prompt += `## Page Performance\n`;
      const nav = capturedData.performance.navTiming;
      if (nav) {
        prompt += `Load Event: ${nav.loadEventEnd}ms\nDom Content Loaded: ${nav.domContentLoadedEventEnd}ms\n`;
      }
      if (capturedData.performance.memory) {
        prompt += `JS Heap Used: ${Math.round(capturedData.performance.memory.usedJSHeapSize / 1024 / 1024)}MB / ${Math.round(capturedData.performance.memory.totalJSHeapSize / 1024 / 1024)}MB\n`;
      }
      prompt += '\n';
    }

    prompt += `Answer with specific, actionable debugging advice. Reference exact values from the data. IMPORTANT: Always format your responses using markdown.\n`;
    return prompt;
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (isStreaming || !text) return;

    const sysContent = buildSystemPrompt();
    const chatMessages = [
      { role: 'system', content: sysContent },
      ...messages.filter(m => m.role !== 'error'),
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

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Sidebar Controls */}
      <div style={{ width: '320px', backgroundColor: '#fff', borderRight: '1px solid #e5e7eb', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0, color: '#111827' }}>Ask DevTools</h2>
        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '10px' }}>
          Target: <strong>{pageTitle}</strong>
        </div>

        <div style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}>
            <input type="checkbox" checked={config.console} onChange={e => setConfig({...config, console: e.target.checked})} />
            Console Logs
          </label>
        </div>

        <div style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}>
            <input type="checkbox" checked={config.network} onChange={e => setConfig({...config, network: e.target.checked})} />
            Network Requests
          </label>
        </div>

        <div style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}>
            <input type="checkbox" checked={config.dom} onChange={e => setConfig({...config, dom: e.target.checked})} />
            DOM Element
          </label>
          {config.dom && (
            <input 
              type="text" 
              value={config.domSelector} 
              onChange={e => setConfig({...config, domSelector: e.target.value})} 
              placeholder="CSS Selector (e.g. #app, .btn)" 
              style={{ width: '100%', padding: '6px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          )}
        </div>

        <div style={{ padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, fontSize: '14px', cursor: 'pointer' }}>
            <input type="checkbox" checked={config.performance} onChange={e => setConfig({...config, performance: e.target.checked})} />
            Performance Metrics
          </label>
        </div>

        <button 
          onClick={captureDevToolsData}
          disabled={isCapturing}
          style={{ padding: '10px', backgroundColor: '#e17055', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: isCapturing ? 'not-allowed' : 'pointer', marginTop: '10px' }}
        >
          {isCapturing ? 'Capturing...' : 'Capture Snapshot'}
        </button>

        {captureStatus && (
          <div style={{ fontSize: '13px', color: captureStatus.startsWith('✅') ? '#059669' : '#dc2626', marginTop: '4px' }}>
            {captureStatus}
          </div>
        )}

        {capturedData && (
          <div style={{ marginTop: '10px', fontSize: '13px', backgroundColor: '#f3f4f6', padding: '10px', borderRadius: '6px' }}>
            <strong>Captured:</strong>
            {capturedData.logs && <div>• {capturedData.logs.length} logs</div>}
            {capturedData.network && <div>• {capturedData.network.length} requests</div>}
            {capturedData.dom && <div>• 1 element ({capturedData.dom.tag})</div>}
            {capturedData.performance && <div>• Performance metrics</div>}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', background: '#13141a', color: '#f3f4f6', overflow: 'hidden' }}>
        
        {/* Header Options */}
        <div className="askpage-controls" style={{ padding: '10px 20px' }}>
          <select
            className="askpage-select"
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
               <h3>Ask about DevTools</h3>
               <p>Capture DevTools context from the sidebar and ask the AI to debug, optimize, or explain the data.</p>
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
