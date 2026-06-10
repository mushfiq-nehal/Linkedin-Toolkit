import { useState } from 'react';
import { countCharacters, CHARACTER_LIMITS } from '../../lib/tools/character-counter';

export default function CharacterCounterTool() {
  const [texts, setTexts] = useState<Record<string, string>>({});

  const updateText = (id: string, value: string) => {
    setTexts((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="flex flex-col gap-8">
      {CHARACTER_LIMITS.map((limit) => {
        const text = texts[limit.id] ?? '';
        const result = countCharacters(text, limit.id);
        const pct = result.percentage;

        const barColor =
          result.status === 'error'
            ? 'bg-[var(--color-error)]'
            : result.status === 'warning'
            ? 'bg-[var(--color-warning)]'
            : 'bg-[var(--color-ink)]';

        const remainingColor =
          result.status === 'error'
            ? 'text-[var(--color-error)]'
            : result.status === 'warning'
            ? 'text-[var(--color-warning-deep)]'
            : 'text-[var(--color-mute)]';

        const isTextarea = limit.limit > 100;

        return (
          <div
            key={limit.id}
            className="rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--color-hairline)] bg-[var(--color-canvas-soft)] flex items-start justify-between gap-4">
              <div>
                <h3 className="text-body-sm-strong text-[var(--color-ink)]">{limit.label}</h3>
                <p className="text-caption text-[var(--color-mute)] mt-0.5">{limit.description}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-display-sm font-mono ${result.status === 'error' ? 'text-[var(--color-error)]' : 'text-[var(--color-ink)]'}`}>
                  {result.count}
                </span>
                <span className="text-body-sm text-[var(--color-mute)]"> / {limit.limit}</span>
              </div>
            </div>

            {/* Input */}
            <div className="p-4">
              {isTextarea ? (
                <textarea
                  value={text}
                  onChange={(e) => updateText(limit.id, e.target.value)}
                  placeholder={`Enter your ${limit.label.toLowerCase()} here...`}
                  rows={limit.id === 'post' || limit.id === 'about' || limit.id === 'recommendation' ? 5 : 3}
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-canvas-soft)] text-[var(--color-ink)] text-body-sm px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] placeholder:text-[var(--color-mute)] transition-shadow"
                  aria-label={`Enter ${limit.label}`}
                />
              ) : (
                <input
                  type="text"
                  value={text}
                  onChange={(e) => updateText(limit.id, e.target.value)}
                  placeholder={`Enter your ${limit.label.toLowerCase()} here...`}
                  className="w-full rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-canvas-soft)] text-[var(--color-ink)] text-body-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] placeholder:text-[var(--color-mute)] transition-shadow"
                  aria-label={`Enter ${limit.label}`}
                />
              )}

              {/* Progress bar */}
              <div className="mt-3">
                <div
                  className="w-full h-1.5 bg-[var(--color-canvas-soft-2)] rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={result.count}
                  aria-valuemin={0}
                  aria-valuemax={limit.limit}
                  aria-label={`${result.count} of ${limit.limit} characters used`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Stats row */}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-4">
                    <span className="text-caption text-[var(--color-mute)]">
                      {result.words} {result.words === 1 ? 'word' : 'words'}
                    </span>
                    {result.lines > 1 && (
                      <span className="text-caption text-[var(--color-mute)]">
                        {result.lines} lines
                      </span>
                    )}
                  </div>
                  <span className={`text-caption ${remainingColor}`}>
                    {result.status === 'error'
                      ? `${Math.abs(result.remaining)} over limit`
                      : `${result.remaining} remaining`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
