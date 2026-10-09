import React, { useState, useRef, useEffect } from 'react';
import type { PromptContext, CopyModule } from '../utils/copyModules';
import { getAvailableCopyModules, buildModuleContent, copyTextToClipboard } from '../utils/copyModules';

interface CopyPromptDropdownProps {
  context: PromptContext;
  disabled?: boolean;
  onCopied?: (label: string) => void;
  className?: string;
  variant?: 'chat' | 'popup';
}

function getModuleIcon(id: string) {
  if (id === 'full_prompt') {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    );
  }
  if (id === 'prompt') {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export const CopyPromptDropdown: React.FC<CopyPromptDropdownProps> = ({
  context,
  disabled = false,
  onCopied,
  className = '',
  variant = 'chat',
}) => {
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const modules = getAvailableCopyModules(context);
  const defaultModule = modules[0] || { id: 'full_prompt', label: 'Full Prompt' };
  const [activeModuleId, setActiveModuleId] = useState<string>(defaultModule.id);

  // Keep activeModule valid if modules change
  const activeModule = modules.find(m => m.id === activeModuleId) || defaultModule;

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      // In Shadow DOM (e.g. Ask Page panel content script), events bubbling to document
      // have e.target retargeted to the shadow host element (<browserbot-ask-page>).
      // Standard dropdownRef.current.contains(e.target) fails because the wrapper does
      // not contain the custom element host.
      // e.composedPath() preserves the actual inner elements across shadow boundaries.
      const path = (e as any).composedPath ? (e as any).composedPath() : [];
      if (
        dropdownRef.current &&
        !path.includes(dropdownRef.current) &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleCopyModule = async (module: CopyModule, e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    if (disabled || copying) return;
    setCopying(true);
    setActiveModuleId(module.id);
    try {
      const text = await buildModuleContent(module.id, context);
      const success = await copyTextToClipboard(text);
      if (success) {
        setCopiedId(module.id);
        onCopied?.(module.label);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.error('BrowserBot: Error copying module', module.id, err);
    } finally {
      setCopying(false);
      setOpen(false);
    }
  };

  const isCopied = Boolean(copiedId);

  // Compute button label based on variant and active module
  const getButtonLabel = () => {
    if (isCopied) return 'Copied!';
    if (variant === 'popup') {
      if (activeModule.id === 'browser_context') return 'Copy Context';
      return `Copy ${activeModule.label}`;
    }
    return `Copy ${activeModule.label}`;
  };

  if (variant === 'popup') {
    return (
      <div
        ref={dropdownRef}
        className={`popup-split-btn-group ${isCopied ? 'copied' : ''} ${className}`}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="popup-split-main-btn"
          disabled={disabled || copying}
          onClick={(e) => handleCopyModule(activeModule, e)}
          title={`Copy ${activeModule.label} to clipboard`}
        >
          {isCopied ? (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              {getModuleIcon(activeModule.id)}
              <span>{getButtonLabel()}</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="popup-split-arrow-btn"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(prev => !prev);
          }}
          title="More copy options (Full Prompt, Prompt, Context)"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {open && (
          <div
            className="popup-split-menu"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {modules.map((m) => {
              const isItemCopied = copiedId === m.id;
              const isItemActive = activeModuleId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`popup-split-menu-item ${isItemActive ? 'active' : ''}`}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  onClick={(e) => handleCopyModule(m, e)}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    {getModuleIcon(m.id)}
                    {m.label}
                  </span>
                  {isItemCopied && (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={dropdownRef}
      className={`copy-prompt-dropdown-wrapper ${className}`}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'stretch',
        borderRadius: '7px',
        border: '1.5px solid var(--bd, #2a2622)',
        background: isCopied ? 'var(--ub, #ffd45e)' : 'var(--pbg, #fffbf0)',
        color: isCopied ? 'var(--ubf, #2a2622)' : 'var(--fg, #2a2622)',
        boxShadow: '1.5px 1.5px 0 var(--bd, #2a2622)',
        transition: 'all 0.15s ease',
      }}
    >
      <button
        type="button"
        className="askpage-att copy-prompt-main-btn"
        disabled={disabled || copying}
        onClick={(e) => handleCopyModule(activeModule, e)}
        title={`Copy ${activeModule.label} to clipboard`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 8px',
          border: 'none',
          background: 'transparent',
          color: 'inherit',
          fontSize: '12px',
          fontWeight: 600,
          cursor: disabled || copying ? 'not-allowed' : 'pointer',
          borderRadius: '5px 0 0 5px',
        }}
      >
        {isCopied ? (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Copied!</span>
          </>
        ) : (
          <>
            {getModuleIcon(activeModule.id)}
            <span>{getButtonLabel()}</span>
          </>
        )}
      </button>

      <button
        type="button"
        className="askpage-att copy-prompt-arrow-btn"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(prev => !prev);
        }}
        title="Select copy options (Full Prompt, Prompt, Browser Context)"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3px 7px',
          border: 'none',
          borderLeft: '1.5px solid var(--bd, #2a2622)',
          background: open ? 'var(--acs, #ffe3d8)' : 'transparent',
          color: 'inherit',
          cursor: disabled ? 'not-allowed' : 'pointer',
          borderRadius: '0 5px 5px 0',
          transition: 'background 0.15s ease',
        }}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          className="copy-prompt-menu"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: 0,
            zIndex: 100,
            background: 'var(--pbg, #fffbf0)',
            border: '1.5px solid var(--bd, #2a2622)',
            borderRadius: '12px',
            boxShadow: '3px 3px 0 var(--bd, #2a2622)',
            padding: '4px',
            minWidth: '185px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            boxSizing: 'border-box',
          }}
        >
          {modules.map((m) => {
            const isItemCopied = copiedId === m.id;
            const isItemActive = activeModuleId === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => handleCopyModule(m, e)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isItemCopied
                    ? 'var(--ub, #ffd45e)'
                    : isItemActive
                    ? 'var(--acs, #ffe3d8)'
                    : 'transparent',
                  color: isItemCopied
                    ? 'var(--ubf, #2a2622)'
                    : isItemActive
                    ? 'var(--act, #d9532f)'
                    : 'var(--fg, #2a2622)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s, color 0.12s',
                  userSelect: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                  width: '100%',
                }}
                onMouseEnter={(e) => {
                  if (!isItemCopied && !isItemActive) {
                    (e.currentTarget as HTMLElement).style.background = 'var(--acs, #ffe3d8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isItemCopied && !isItemActive) {
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }
                }}
              >
                {getModuleIcon(m.id)}
                <span style={{ flex: 1 }}>{m.label}</span>
                {isItemCopied && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
