import { useState, useCallback } from 'react';
import { HASHTAG_CATEGORIES, generateHashtagsFromText } from '../../lib/tools/hashtag-generator';

export default function HashtagGeneratorTool() {
  const [mode, setMode] = useState<'category' | 'text'>('category');
  const [activeCategory, setActiveCategory] = useState<string>('career');
  const [topic, setTopic] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const currentHashtags =
    mode === 'category'
      ? (HASHTAG_CATEGORIES.find((c) => c.id === activeCategory)?.hashtags ?? [])
      : generateHashtagsFromText(topic);

  const toggleHashtag = (tag: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(currentHashtags));
  };

  const clearAll = () => {
    setSelected(new Set());
  };

  const copySelected = useCallback(async () => {
    const text = Array.from(selected).join(' ');
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [selected]);

  return (
    <div className="flex flex-col gap-6">
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <span className="text-body-sm-strong text-[var(--color-ink)] mr-2">Generate by:</span>
        {(['category', 'text'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setSelected(new Set()); }}
            className={`px-4 py-2 rounded-[var(--radius-sm)] border text-body-sm capitalize transition-all ${
              mode === m
                ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
                : 'bg-[var(--color-canvas)] text-[var(--color-body)] border-[var(--color-hairline)] hover:border-[var(--color-hairline-strong)]'
            }`}
            aria-pressed={mode === m}
          >
            {m === 'category' ? 'Category' : 'Topic text'}
          </button>
        ))}
      </div>

      {/* Category selector */}
      {mode === 'category' && (
        <div>
          <p className="text-body-sm-strong text-[var(--color-ink)] mb-3">Choose a category</p>
          <div className="flex flex-wrap gap-2">
            {HASHTAG_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setSelected(new Set()); }}
                className={`px-4 py-2 rounded-full border text-body-sm transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
                    : 'bg-[var(--color-canvas)] text-[var(--color-body)] border-[var(--color-hairline)] hover:border-[var(--color-hairline-strong)]'
                }`}
                aria-pressed={activeCategory === cat.id}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text input */}
      {mode === 'text' && (
        <div>
          <label htmlFor="hashtag-topic" className="block text-body-sm-strong text-[var(--color-ink)] mb-2">
            What is your post about?
          </label>
          <input
            id="hashtag-topic"
            type="text"
            value={topic}
            onChange={(e) => { setTopic(e.target.value); setSelected(new Set()); }}
            placeholder="e.g. leadership tips for new managers, AI in marketing..."
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-[var(--color-ink)] text-body-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] placeholder:text-[var(--color-mute)]"
          />
        </div>
      )}

      {/* Hashtag grid */}
      {(mode === 'category' || topic.trim()) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-body-sm-strong text-[var(--color-ink)]">
              {currentHashtags.length} hashtags
              {selected.size > 0 && (
                <span className="text-[var(--color-mute)] font-normal"> — {selected.size} selected</span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button onClick={selectAll} className="text-caption text-[var(--color-body)] hover:text-[var(--color-ink)] transition-colors">
                Select all
              </button>
              <span className="text-[var(--color-hairline)]" aria-hidden="true">|</span>
              <button onClick={clearAll} className="text-caption text-[var(--color-body)] hover:text-[var(--color-ink)] transition-colors">
                Clear
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Hashtags — click to select">
            {currentHashtags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleHashtag(tag)}
                className={`px-3 py-1.5 rounded-full border text-body-sm transition-all ${
                  selected.has(tag)
                    ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
                    : 'bg-[var(--color-canvas)] text-[var(--color-body)] border-[var(--color-hairline)] hover:border-[var(--color-hairline-strong)]'
                }`}
                aria-pressed={selected.has(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected hashtags + copy */}
      {selected.size > 0 && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-hairline)] bg-[var(--color-canvas-soft)]">
            <span className="text-caption-mono text-[var(--color-mute)] uppercase tracking-wider">
              {selected.size} selected
            </span>
            <button
              onClick={copySelected}
              className={`flex items-center gap-1.5 text-body-sm-strong px-3 py-1 rounded-[var(--radius-sm)] transition-all ${
                copied
                  ? 'text-[var(--color-success)] bg-[var(--color-link-bg-soft)]'
                  : 'text-[var(--color-ink)] hover:bg-[var(--color-canvas-soft-2)]'
              }`}
              aria-label="Copy selected hashtags"
            >
              {copied ? '✓ Copied!' : 'Copy all'}
            </button>
          </div>
          <div className="p-4">
            <p className="text-body-sm text-[var(--color-ink)] break-words">
              {Array.from(selected).join(' ')}
            </p>
          </div>
        </div>
      )}

      {mode === 'text' && !topic.trim() && (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-hairline)] p-8 text-center">
          <p className="text-body-sm text-[var(--color-mute)]">
            Describe your post topic above to generate relevant hashtags.
          </p>
        </div>
      )}
    </div>
  );
}
