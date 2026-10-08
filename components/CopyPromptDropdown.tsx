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

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleCopyModule = async (module: CopyModule, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (disabled || copying) return;
    setCopying(true);
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

  const defaultModule = modules[0] || { id: 'full_prompt', label: 'Full Prompt' };
  const isCopied = Boolean(copiedId);

  if (variant === 'popup') {
    return (
      <div
        ref={dropdownRef}
        className={`popup-split-btn-group ${isCopied ? 'copied' : ''} ${className}`}
      >
        <button
          type="button"
          className="popup-split-main-btn"
          disabled={disabled || copying}
          onClick={(e) => handleCopyModule(defaultModule, e)}
          title={`Copy ${defaultModule.label} to clipboard`}
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copy Prompt</span>
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
          title="More copy options"
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
          <div className="popup-split-menu">
            {modules.map((m) => {
              const isItemCopied = copiedId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`popup-split-menu-item ${isItemCopied ? 'active' : ''}`}
                  onClick={(e) => handleCopyModule(m, e)}
                >
                  <span>{m.label}</span>
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
    <div ref={dropdownRef} className={`copy-prompt-dropdown-wrapper ${className}`} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        className="askpage-att copy-prompt-main-btn"
        disabled={disabled || copying}
        onClick={(e) => handleCopyModule(defaultModule, e)}
        title={`Copy ${defaultModule.label} to clipboard`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: isCopied ? 'var(--ub, #ffd45e)' : undefined,
          color: isCopied ? 'var(--ubf, #2a2622)' : undefined,
          transition: 'all 0.15s ease',
          border: 'none',
          cursor: disabled || copying ? 'not-allowed' : 'pointer',
        }}
      >
        {isCopied ? (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Copied!</span>
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>Copy Prompt</span>
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
        title="More copy options"
        style={{
          padding: '3px 4px',
          marginLeft: '1px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          background: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        <svg
          width="12"
          height="12"
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
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: 0,
            zIndex: 50,
            background: 'var(--pbg, #fffbf0)',
            border: '1.5px solid var(--bd, #2a2622)',
            borderRadius: '12px',
            boxShadow: '3px 3px 0 var(--bd, #2a2622)',
            padding: '4px',
            minWidth: '170px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}
        >
          {modules.map((m) => {
            const isItemCopied = copiedId === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={(e) => handleCopyModule(m, e)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: isItemCopied ? 'var(--ub, #ffd45e)' : 'transparent',
                  color: isItemCopied ? 'var(--ubf, #2a2622)' : 'var(--fg, #2a2622)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => {
                  if (!isItemCopied) (e.currentTarget as HTMLElement).style.background = 'var(--acs, #ffe3d8)';
                }}
                onMouseLeave={(e) => {
                  if (!isItemCopied) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <span>{m.label}</span>
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
