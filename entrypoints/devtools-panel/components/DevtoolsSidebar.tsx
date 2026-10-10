import React from 'react';
import { S } from '../devtoolsStyles';
import type { DevToolsConfig, DevToolsData } from '../types';

interface DevtoolsSidebarProps {
  sidebarCollapsed: boolean;
  onToggleCollapsed: () => void;
  config: DevToolsConfig;
  onChangeConfig: (newConfig: DevToolsConfig) => void;
  onInjectLogger: () => void;
  isCapturing: boolean;
  onCapture: () => void;
  capturedData: DevToolsData | null;
  onCopyContext: () => void;
  captureStatus: string;
  includeDom: boolean;
  onToggleIncludeDom: (checked: boolean) => void;
  includePerf: boolean;
  onToggleIncludePerf: (checked: boolean) => void;
  selectedLogIds: Set<string>;
  onToggleLogId: (id: string) => void;
  selectedNetworkIds: Set<string>;
  onToggleNetworkId: (id: string) => void;
  onSelectAllNetwork: () => void;
  onDeselectAllNetwork: () => void;
  networkFilter: string;
  onChangeNetworkFilter: (filter: string) => void;
}

export const DevtoolsSidebar: React.FC<DevtoolsSidebarProps> = ({
  sidebarCollapsed,
  onToggleCollapsed,
  config,
  onChangeConfig,
  onInjectLogger,
  isCapturing,
  onCapture,
  capturedData,
  onCopyContext,
  captureStatus,
  includeDom,
  onToggleIncludeDom,
  includePerf,
  onToggleIncludePerf,
  selectedLogIds,
  onToggleLogId,
  selectedNetworkIds,
  onToggleNetworkId,
  onSelectAllNetwork,
  onDeselectAllNetwork,
  networkFilter,
  onChangeNetworkFilter,
}) => {
  return (
    <div style={S.sidebar(sidebarCollapsed)}>
      {/* Collapse toggle on the edge */}
      <button
        style={S.collapseBtn()}
        onClick={onToggleCollapsed}
        title={sidebarCollapsed ? 'Expand panel' : 'Collapse panel'}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          {sidebarCollapsed ? (
            <polyline points="9 18 15 12 9 6" />
          ) : (
            <polyline points="15 18 9 12 15 6" />
          )}
        </svg>
      </button>

      {/* Inner content — hidden when collapsed */}
      {!sidebarCollapsed && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--ac)"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span
              style={{
                fontSize: '20px',
                fontWeight: 700,
                fontFamily: 'var(--hfont)',
                color: 'var(--fg)',
              }}
            >
              Capture Settings
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--mute)', marginTop: '-4px' }}>
            Select an element in Elements tab before capturing.
          </div>

          {/* Console section */}
          <div style={S.card()}>
            <div style={S.sectionTitle()}>Console</div>
            <label style={S.label()}>
              <input
                type="checkbox"
                checked={config.console}
                onChange={e => onChangeConfig({ ...config, console: e.target.checked })}
              />
              Capture Console Logs
            </label>
            <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.5' }}>
              Logs are only captured after injecting the logger script below.
            </div>
            <button
              style={{
                ...S.btn(),
                fontSize: '12px',
                padding: '6px 10px',
                alignSelf: 'flex-start',
              }}
              onClick={onInjectLogger}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Inject Logger &amp; Reload
            </button>
          </div>

          {/* Capture sources */}
          <div style={S.card()}>
            <div style={S.sectionTitle()}>Capture Sources</div>
            <label style={S.label()}>
              <input
                type="checkbox"
                checked={config.network}
                onChange={e => onChangeConfig({ ...config, network: e.target.checked })}
              />
              Network (HAR)
            </label>
            <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.5' }}>
              If no requests appear, open the browser Network panel once and reload, then capture again.
            </div>
            <label style={S.label()}>
              <input
                type="checkbox"
                checked={config.dom}
                onChange={e => onChangeConfig({ ...config, dom: e.target.checked })}
              />
              Selected DOM Element ($0)
            </label>
            <label style={S.label()}>
              <input
                type="checkbox"
                checked={config.performance}
                onChange={e => onChangeConfig({ ...config, performance: e.target.checked })}
              />
              Performance &amp; Memory
            </label>
          </div>

          {/* Network options */}
          <div style={S.card()}>
            <div style={S.sectionTitle()}>Network Options</div>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Format</div>
              <select
                style={S.select()}
                value={config.networkDisplayMode}
                onChange={e =>
                  onChangeConfig({
                    ...config,
                    networkDisplayMode: e.target.value as 'summary' | 'details' | 'both',
                  })
                }
              >
                <option value="summary">Summary Table Only</option>
                <option value="details">Full Details Only</option>
                <option value="both">Both (Summary + Details)</option>
              </select>
            </div>
            <label style={S.label()}>
              <input
                type="checkbox"
                checked={config.networkHeaders}
                onChange={e => onChangeConfig({ ...config, networkHeaders: e.target.checked })}
              />
              Include Headers
            </label>
            <label style={S.label()}>
              <input
                type="checkbox"
                checked={config.networkCookies}
                onChange={e => onChangeConfig({ ...config, networkCookies: e.target.checked })}
              />
              Include Cookies
            </label>
            {config.networkCookies && (
              <label style={S.label(true)}>
                <input
                  type="checkbox"
                  checked={config.cookieValues}
                  onChange={e => onChangeConfig({ ...config, cookieValues: e.target.checked })}
                />
                Show Cookie Values
              </label>
            )}
            <label style={S.label()}>
              <input
                type="checkbox"
                checked={config.networkPayload}
                onChange={e => onChangeConfig({ ...config, networkPayload: e.target.checked })}
              />
              Include Request Payload
            </label>
            <label style={S.label()}>
              <input
                type="checkbox"
                checked={config.networkResponseBody}
                onChange={e => onChangeConfig({ ...config, networkResponseBody: e.target.checked })}
              />
              Include Response Bodies
            </label>
            {config.networkResponseBody && (
              <div style={{ marginLeft: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>Body MIME filters</div>
                {(['includeHtml', 'includeCss', 'includeJs'] as const).map(k => (
                  <label key={k} style={S.label()}>
                    <input
                      type="checkbox"
                      checked={config[k]}
                      onChange={e => onChangeConfig({ ...config, [k]: e.target.checked })}
                    />
                    {k === 'includeHtml' ? 'HTML' : k === 'includeCss' ? 'CSS' : 'JS'}
                  </label>
                ))}
                <label style={S.label()}>
                  <input
                    type="checkbox"
                    checked={config.allowLargeBodies}
                    onChange={e => onChangeConfig({ ...config, allowLargeBodies: e.target.checked })}
                  />
                  Allow &gt;50KB bodies
                </label>
              </div>
            )}
            <div style={{ borderTop: '1px solid var(--bd)', paddingTop: 8, marginTop: 4 }}>
              <div style={S.sectionTitle()}>Additional Context</div>
              {([
                ['webVitals', 'Web Vitals / long tasks'],
                ['storage', 'Storage inventory + quota'],
                ['cookies', 'Cookie security metadata'],
                ['screenshots', 'Attach screenshot (opt-in; Chrome uses debugger)'],
                ['pwa', 'PWA / service worker state'],
                ['security', 'Security signals'],
                ['eventListeners', 'Selected element event listener counts (via debugger; Chrome only)'],
                ['matchedStyles', 'Matched CSS rules (Chrome only)'],
                ['accessibilityTree', 'Accessibility tree node (Chrome only)'],
              ] as const).map(([key, label]) => <label key={key} style={S.label()}>
                <input type="checkbox" checked={config[key]} disabled={['eventListeners', 'matchedStyles', 'accessibilityTree'].includes(key) && !browser.runtime.getURL('').startsWith('chrome-extension://')} onChange={e => onChangeConfig({ ...config, [key]: e.target.checked })} />{label}
              </label>)}
              {config.storage && <label style={S.label(true)}><input type="checkbox" checked={config.storageValues} onChange={e => onChangeConfig({ ...config, storageValues: e.target.checked })} />Include storage values (opt-in)</label>}
              {config.cookies && <label style={S.label(true)}><input type="checkbox" checked={config.cookieValues} onChange={e => onChangeConfig({ ...config, cookieValues: e.target.checked })} />Include cookie values (opt-in)</label>}
              <label style={S.label()}><input type="checkbox" checked={config.liveConsole} onChange={e => onChangeConfig({ ...config, liveConsole: e.target.checked })} />Live console (no reload)</label>
              {config.liveConsole && <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.5' }}>Captures new console calls from the inspected page while enabled. It uses the DevTools inspection context and does not attach a second debugger.</div>}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={S.btn(true, isCapturing)}
              onClick={onCapture}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                  </svg>{' '}
                  Capturing…
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                  </svg>{' '}
                  Capture Snapshot
                </>
              )}
            </button>
            <button
              style={S.btn(false, !capturedData)}
              onClick={onCopyContext}
              disabled={!capturedData}
              title="Copy context to clipboard"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>

          {captureStatus && (
            <div
              style={{
                fontSize: '12px',
                padding: '6px 10px',
                borderRadius: 'var(--rs)',
                background: captureStatus.startsWith('✅') ? 'var(--sub)' : 'rgba(200, 55, 45, 0.12)',
                color: captureStatus.startsWith('✅') ? 'var(--fg)' : 'var(--er)',
                border: `1.5px solid ${captureStatus.startsWith('✅') ? 'var(--bd)' : 'var(--er)'}`,
              }}
            >
              {captureStatus}
            </div>
          )}

          {/* Context payload selectors */}
          {capturedData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {capturedData.screenshot && <div style={{ fontSize: '11px', color: 'var(--mute)' }}>
                Screenshot {config.screenshots ? 'will be attached to supported providers' : 'captured but excluded from the prompt'}
                <img src={capturedData.screenshot} alt="Captured inspected tab" style={{ display: 'block', width: '100%', maxHeight: 140, objectFit: 'contain', marginTop: 6, border: '1px solid var(--bd)', borderRadius: 8 }} />
              </div>}
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--mute)',
                  paddingTop: '6px',
                  borderTop: '1.5px dashed var(--bd)',
                }}
              >
                Context Payload
              </div>

              {capturedData.dom && (
                <label style={S.label()}>
                  <input
                    type="checkbox"
                    checked={includeDom}
                    onChange={e => onToggleIncludeDom(e.target.checked)}
                  />
                  <span>
                    $0 <strong style={{ color: '#e17055' }}>{capturedData.dom.tag}</strong>
                  </span>
                </label>
              )}
              {capturedData.performance && (
                <label style={S.label()}>
                  <input
                    type="checkbox"
                    checked={includePerf}
                    onChange={e => onToggleIncludePerf(e.target.checked)}
                  />
                  Performance Metrics
                </label>
              )}
              {capturedData?.performance?.browserNote && (
                <div style={{ fontSize: '11px', color: 'var(--mute)', lineHeight: '1.5' }}>
                  Note: {capturedData.performance.browserNote}
                </div>
              )}

              {capturedData.logs && capturedData.logs.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg)' }}>Console Logs</span>
                    <span style={S.badge('var(--sub)')}>
                      {selectedLogIds.size}/{capturedData.logs.length}
                    </span>
                  </div>
                  <div style={S.listBox()}>
                    {capturedData.logs.map(log => (
                      <label key={log.id} style={S.listRow(log.level === 'error')}>
                        <input
                          type="checkbox"
                          checked={selectedLogIds.has(log.id)}
                          onChange={() => onToggleLogId(log.id)}
                          style={{ marginTop: '2px', flexShrink: 0 }}
                        />
                        <span style={{ wordBreak: 'break-all' }}>
                          [{log.level}] {log.text.substring(0, 80)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {capturedData.network && capturedData.network.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--fg)' }}>Network</span>
                    <span
                      style={S.badge(
                        selectedNetworkIds.size < capturedData.network.length ? 'var(--acs)' : 'var(--sub)'
                      )}
                    >
                      {selectedNetworkIds.size}/{capturedData.network.length}
                    </span>
                    <button
                      onClick={onSelectAllNetwork}
                      style={{
                        marginLeft: 'auto',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        color: 'var(--ac)',
                      }}
                    >
                      All
                    </button>
                    <button
                      onClick={onDeselectAllNetwork}
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        color: 'var(--mute)',
                      }}
                    >
                      None
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="🔍 Filter by URL or method…"
                    value={networkFilter}
                    onChange={e => onChangeNetworkFilter(e.target.value)}
                    style={S.filterInput()}
                  />
                  <div style={S.listBox()}>
                    {capturedData.network
                      .filter(
                        r =>
                          r.url.toLowerCase().includes(networkFilter.toLowerCase()) ||
                          r.method.toLowerCase().includes(networkFilter.toLowerCase())
                      )
                      .map(req => (
                        <label key={req.id} style={S.listRow(req.status >= 400)}>
                          <input
                            type="checkbox"
                            checked={selectedNetworkIds.has(req.id)}
                            onChange={() => onToggleNetworkId(req.id)}
                            style={{ marginTop: '2px', flexShrink: 0 }}
                          />
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              wordBreak: 'break-all',
                              minWidth: 0,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: 'monospace',
                                fontSize: '10px',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                background: req.status >= 400 ? 'rgba(200, 55, 45, 0.15)' : 'var(--sub)',
                                color: req.status >= 400 ? 'var(--er)' : 'var(--fg)',
                                border: '1px solid var(--bd)',
                                flexShrink: 0,
                              }}
                            >
                              {req.method}
                            </span>
                            <span style={{ color: req.status >= 400 ? 'var(--er)' : 'var(--mute)' }}>{req.status}</span>
                            <span
                              style={{
                                color: 'var(--fg)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {(() => {
                                try {
                                  return new URL(req.url).pathname;
                                } catch {
                                  return req.url;
                                }
                              })()}
                            </span>
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
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '16px',
            gap: '16px',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mute)" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {capturedData && (
            <div
              style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ac)' }}
              title="Data captured"
            />
          )}
        </div>
      )}
    </div>
  );
};
