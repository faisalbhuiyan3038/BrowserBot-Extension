import React from 'react';
import type { SlashMode, SlashOption } from '../types';

interface SlashMenuProps {
  menuRef: React.RefObject<HTMLDivElement | null>;
  slashMode: SlashMode;
  slashOptions: SlashOption[];
  slashIndex: number;
  currentModelShort: string;
  onSetSlashIndex: (idx: number) => void;
  onBackToRoot: () => void;
  onSelectOption: (opt: SlashOption) => void;
}

export const SlashMenu: React.FC<SlashMenuProps> = ({
  menuRef,
  slashMode,
  slashOptions,
  slashIndex,
  currentModelShort,
  onSetSlashIndex,
  onBackToRoot,
  onSelectOption,
}) => {
  return (
    <div className="askpage-slash" ref={menuRef} role="listbox" aria-label="Commands">
      <div className="askpage-slash-head">
        {slashMode === 'root' ? (
          'Commands — type to filter, ↑↓ + Enter'
        ) : (
          <button className="askpage-slash-back" onClick={onBackToRoot}>
            ← {slashMode}
          </button>
        )}
        <span className="askpage-slash-model">{currentModelShort}</span>
      </div>
      {slashOptions.length === 0 && (
        <div className="askpage-slash-empty">No matches — Esc to close</div>
      )}
      {slashOptions.map((opt, idx) => (
        <button
          key={opt.key}
          role="option"
          aria-selected={idx === slashIndex}
          data-active={idx === slashIndex}
          className={`askpage-slash-item ${idx === slashIndex ? 'active' : ''}`}
          onMouseEnter={() => onSetSlashIndex(idx)}
          onClick={() => onSelectOption(opt)}
        >
          <span className="askpage-slash-title">
            {opt.title}
            {opt.active ? ' ✓' : ''}
          </span>
          <span className="askpage-slash-desc">{opt.desc}</span>
          {opt.hint && <span className="askpage-slash-hint">{opt.hint}</span>}
        </button>
      ))}
      <div className="askpage-slash-foot">/model · /prompt · /page · /tab — Esc to close</div>
    </div>
  );
};
