import React, { useState, useEffect } from 'react';
import type { ParsedAIAction, ValidationResult } from '../utils/actionExecutor';
import { validateAndParseAIResponse } from '../utils/actionExecutor';

interface PasteResponseModalProps {
  open: boolean;
  onClose: () => void;
  targetScope?: 'tab_groups' | 'bookmarks' | 'chat' | 'auto';
  onExecuteAction: (action: ParsedAIAction) => Promise<void> | void;
}

export const PasteResponseModal: React.FC<PasteResponseModalProps> = ({
  open,
  onClose,
  targetScope = 'auto',
  onExecuteAction,
}) => {
  const [inputText, setInputText] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [executing, setExecuting] = useState(false);
  const [mode, setMode] = useState<'tab_groups' | 'bookmarks' | 'chat' | 'auto'>(targetScope);

  useEffect(() => {
    setMode(targetScope);
  }, [targetScope]);

  useEffect(() => {
    if (!open) {
      setInputText('');
      setValidation(null);
      setExecuting(false);
    }
  }, [open]);

  // Validate whenever text or mode changes
  useEffect(() => {
    if (!inputText.trim()) {
      setValidation(null);
      return;
    }
    const res = validateAndParseAIResponse(inputText, mode);
    setValidation(res);
  }, [inputText, mode]);

  if (!open) return null;

  const handleExecute = async () => {
    if (!validation?.success || !validation.action || executing) return;
    setExecuting(true);
    try {
      await onExecuteAction(validation.action);
      onClose();
    } catch (err: any) {
      setValidation({
        success: false,
        error: `Execution failed: ${err?.message || String(err)}`,
        actionableHint: 'Please check browser permissions or active tab state.'
      });
    } finally {
      setExecuting(false);
    }
  };

  const getActionSummary = () => {
    if (!validation?.action) return null;
    if (validation.action.type === 'tab_groups') {
      const cats = validation.action.categories;
      const totalTabs = cats.reduce((acc, c) => acc + c.tabIds.length, 0);
      return `✓ Valid Tab Grouping: ${cats.length} groups for ${totalTabs} tabs`;
    }
    if (validation.action.type === 'bookmarks') {
      const moves = validation.action.plan.moves.length;
      const folders = validation.action.plan.createFolders.length;
      return `✓ Valid Bookmark Plan: ${moves} moves, ${folders} folders to create`;
    }
    if (validation.action.type === 'chat') {
      return `✓ Assistant response: ${validation.action.content.length} characters`;
    }
    return null;
  };

  return (
    <div
      className="askpage-tab-picker-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(42, 38, 34, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px',
        backdropFilter: 'blur(2px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="askpage-tab-picker"
        style={{
          background: 'var(--pbg, #fffbf0)',
          border: '2px solid var(--bd, #2a2622)',
          borderRadius: '18px',
          boxShadow: '6px 6px 0 var(--bd, #2a2622)',
          padding: '20px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ margin: 0, font: '700 24px/1 var(--hfont, Caveat, cursive)', color: 'var(--fg, #2a2622)' }}>
            Paste AI Response
          </h4>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: 'var(--mute, #645c52)',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ margin: 0, fontSize: '13px', color: 'var(--mute, #645c52)', lineHeight: 1.4 }}>
          Paste the structured response from ChatGPT, Claude, Gemini, or any LLM. Code blocks and conversational text are automatically extracted.
        </p>

        {/* Mode selector */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'auto', label: 'Auto-detect' },
            { id: 'tab_groups', label: 'Tab Groups' },
            { id: 'bookmarks', label: 'Bookmarks' },
            { id: 'chat', label: 'Chat Response' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id as any)}
              style={{
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1.5px solid var(--bd, #2a2622)',
                background: mode === item.id ? 'var(--ac, #e0482c)' : 'var(--sub, #fff3d6)',
                color: mode === item.id ? 'var(--acfg, #fff)' : 'var(--fg, #2a2622)',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste AI response here (e.g. ```json { ... } ``` or direct text)..."
          rows={8}
          autoFocus
          style={{
            width: '100%',
            padding: '10px',
            background: 'var(--cb, #fffbf0)',
            border: '1.5px solid var(--bd, #2a2622)',
            borderRadius: '12px',
            fontFamily: 'monospace',
            fontSize: '12.5px',
            lineHeight: 1.4,
            color: 'var(--fg, #2a2622)',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />

        {/* Validation Status Banner */}
        {validation && !validation.success && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              background: '#fee2e2',
              border: '1.5px solid #ef4444',
              color: '#991b1b',
              fontSize: '12.5px',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: '4px' }}>⚠️ {validation.error}</div>
            {validation.actionableHint && (
              <pre
                style={{
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  opacity: 0.9,
                  background: 'rgba(255, 255, 255, 0.5)',
                  padding: '6px',
                  borderRadius: '6px',
                }}
              >
                {validation.actionableHint}
              </pre>
            )}
          </div>
        )}

        {validation && validation.success && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              background: '#ecfdf5',
              border: '1.5px solid #10b981',
              color: '#065f46',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{getActionSummary()}</span>
          </div>
        )}

        {/* Modal actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
          <button
            type="button"
            className="askpage-tab-picker-btn cancel"
            onClick={onClose}
            disabled={executing}
            style={{ cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="askpage-tab-picker-btn confirm"
            onClick={handleExecute}
            disabled={!validation?.success || executing}
            style={{
              cursor: validation?.success && !executing ? 'pointer' : 'not-allowed',
              opacity: validation?.success && !executing ? 1 : 0.5,
            }}
          >
            {executing ? 'Executing…' : 'Execute Action'}
          </button>
        </div>
      </div>
    </div>
  );
};
