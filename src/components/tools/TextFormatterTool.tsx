import { useState, useCallback } from 'react';
import { formatText, STYLES } from '../../lib/tools/text-formatter';

export default function TextFormatterTool() {
  const [input, setInput] = useState('');
  const [activeStyle, setActiveStyle] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const formatted = activeStyle
    ? formatText(input, activeStyle as Parameters<typeof formatText>[1])
    : '';

  const handleCopy = useCallback(
    async (text: string, key: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
      } catch {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
      }
    },
    []
  );

  const handleCopyAll = () => {
    if (formatted) handleCopy(formatted, 'all');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Input */}
      <div>
        <label
          htmlFor="formatter-input"
          className="block text-body-sm-strong text-[var(--color-ink)] mb-2"
        >
          Your text
        </label>
        <textarea
          id="formatter-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste your LinkedIn text here..."
          rows={5}
          className="w-full rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-[var(--color-ink)] text-body-sm px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] focus:ring-offset-0 placeholder:text-[var(--color-mute)] transition-shadow"
          aria-describedby="formatter-help"
        />
        <p id="formatter-help" className="text-caption text-[var(--color-mute)] mt-1.5">
          {input.length} characters
        </p>
      </div>

      {/* Style picker */}
      <div>
        <p className="text-body-sm-strong text-[var(--color-ink)] mb-3">Choose a style</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Text format styles">
          {STYLES.map((style) => (
            <button
              key={style.key}
              onClick={() => setActiveStyle(activeStyle === style.key ? null : style.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] border text-body-sm transition-all ${
                activeStyle === style.key
                  ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
                  : 'bg-[var(--color-canvas)] text-[var(--color-body)] border-[var(--color-hairline)] hover:border-[var(--color-hairline-strong)] hover:text-[var(--color-ink)]'
              }`}
              aria-pressed={activeStyle === style.key}
              title={style.description}
            >
              <span aria-hidden="true">{style.preview}</span>
              <span>{style.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview + copy */}
      {activeStyle && input && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-hairline)] bg-[var(--color-canvas-soft)]">
            <span className="text-caption-mono text-[var(--color-mute)] uppercase tracking-wider">
              Preview — {STYLES.find((s) => s.key === activeStyle)?.label}
            </span>
            <button
              onClick={handleCopyAll}
              className={`flex items-center gap-1.5 text-body-sm-strong px-3 py-1 rounded-[var(--radius-sm)] transition-all ${
                copiedKey === 'all'
                  ? 'text-[var(--color-success)] bg-[var(--color-link-bg-soft)]'
                  : 'text-[var(--color-ink)] hover:bg-[var(--color-canvas-soft-2)]'
              }`}
              aria-label="Copy formatted text to clipboard"
            >
              {copiedKey === 'all' ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M2 9V3a1 1 0 011-1h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="p-4">
            <p className="text-body-md text-[var(--color-ink)] whitespace-pre-wrap break-words min-h-[60px]">
              {formatted}
            </p>
          </div>
        </div>
      )}

      {/* Quick copy all styles */}
      {input && (
        <div>
          <p className="text-body-sm-strong text-[var(--color-ink)] mb-3">All styles — quick copy</p>
          <div className="flex flex-col gap-1.5 rounded-[var(--radius-md)] border border-[var(--color-hairline)] overflow-hidden">
            {STYLES.map((style, i) => {
              const result = formatText(input, style.key as Parameters<typeof formatText>[1]);
              return (
                <div
                  key={style.key}
                  className={`flex items-center justify-between px-4 py-3 gap-4 ${
                    i % 2 === 0 ? 'bg-[var(--color-canvas)]' : 'bg-[var(--color-canvas-soft)]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-caption text-[var(--color-mute)] block mb-0.5">{style.label}</span>
                    <p className="text-body-sm text-[var(--color-ink)] truncate">{result}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(result, style.key)}
                    className={`shrink-0 flex items-center gap-1.5 text-caption px-2.5 py-1 rounded-[var(--radius-xs)] transition-all ${
                      copiedKey === style.key
                        ? 'text-[var(--color-success)] bg-[var(--color-link-bg-soft)]'
                        : 'text-[var(--color-mute)] hover:text-[var(--color-ink)] hover:bg-[var(--color-canvas-soft-2)]'
                    }`}
                    aria-label={`Copy ${style.label} formatted text`}
                  >
                    {copiedKey === style.key ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!input && (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-hairline)] p-8 text-center">
          <p className="text-body-sm text-[var(--color-mute)]">
            Type your text above to see formatting styles.
          </p>
        </div>
      )}
    </div>
  );
}
