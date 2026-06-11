import { useState, useCallback, useRef, useEffect } from 'react';
import { HASHTAG_CATEGORIES, generateHashtagsFromText } from '../../lib/tools/hashtag-generator';

async function fetchAIHashtags(content: string): Promise<string[]> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: 'hashtags', content }),
  });
  const data = await res.json() as { result?: string; error?: string };
  if (!res.ok || data.error) throw new Error(data.error ?? 'AI request failed');
  return (data.result ?? '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('#'));
}

function SparkleIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  );
}

export default function HashtagGeneratorTool() {
  // AI mode (primary, always visible)
  const [aiPost, setAiPost] = useState('');
  const [aiHashtags, setAiHashtags] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const aiTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = aiTextareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [aiPost]);

  // Secondary browse modes
  const [browseMode, setBrowseMode] = useState<'category' | 'topic' | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('career');
  const [topic, setTopic] = useState('');

  // Shared selection state
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  // Determine source of current hashtags
  const browseHashtags =
    browseMode === 'category'
      ? (HASHTAG_CATEGORIES.find((c) => c.id === activeCategory)?.hashtags ?? [])
      : browseMode === 'topic'
        ? generateHashtagsFromText(topic)
        : [];

  const currentHashtags = aiHashtags.length > 0 ? aiHashtags : browseHashtags;
  const hasResults = currentHashtags.length > 0;

  const clearAI = () => {
    setAiHashtags([]);
    setAiError('');
  };

  const switchBrowse = (mode: 'category' | 'topic' | null) => {
    setBrowseMode(mode);
    setSelected(new Set());
    clearAI();
  };

  const toggleHashtag = (tag: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(currentHashtags));
  const clearAll = () => setSelected(new Set());

  const handleAIGenerate = async () => {
    if (!aiPost.trim()) return;
    setAiLoading(true);
    setAiError('');
    setAiHashtags([]);
    setSelected(new Set());
    setBrowseMode(null);
    try {
      const tags = await fetchAIHashtags(aiPost);
      setAiHashtags(tags);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setAiLoading(false);
    }
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
    <div className="flex flex-col gap-5">
      {/* ── AI Card — primary, prominent ── */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] overflow-hidden shadow-[var(--shadow-card-md)]">
        {/* AI header strip — ink gradient */}
        <div className="flex items-center gap-2 px-5 py-3" style={{ background: 'linear-gradient(135deg, var(--color-ink), #333)' }}>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 text-white shrink-0">
            <SparkleIcon size={14} />
          </div>
          <div>
            <h3 className="text-body-sm-strong text-white leading-tight">AI hashtag generator</h3>
            <p className="text-caption text-white/60 leading-tight">Paste your post — get 8 smart hashtags</p>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <textarea
            ref={aiTextareaRef}
            id="hashtag-ai-post"
            value={aiPost}
            onChange={(e) => setAiPost(e.target.value)}
            placeholder="Paste the full text of your LinkedIn post here and the AI will suggest the most relevant hashtags…"
            rows={4}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-[var(--color-ink)] text-body-sm px-4 py-3 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-[var(--color-hairline-strong)] placeholder:text-[var(--color-mute)] transition-shadow"
          />

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleAIGenerate}
              disabled={!aiPost.trim() || aiLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm bg-[var(--color-ink)] text-white transition-opacity disabled:opacity-40"
            >
              <SparkleIcon size={12} />
              {aiLoading ? 'Generating…' : 'Generate hashtags'}
            </button>

            {aiError && (
              <p className="text-body-sm text-[var(--color-error)]">{aiError}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Loading skeleton ── */}
      {aiLoading && (
        <div className="flex flex-wrap gap-2" aria-busy="true" aria-label="Generating hashtags…">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 rounded-full bg-[var(--color-canvas-soft-2)] animate-pulse" style={{ width: `${70 + (i % 3) * 20}px` }} />
          ))}
        </div>
      )}

      {/* ── Browse section (secondary, compact) ── */}
      {!aiLoading && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="w-full h-px bg-[var(--color-hairline)] flex-1" aria-hidden="true" />
            <span className="text-caption-mono text-[var(--color-mute)] uppercase tracking-wider shrink-0">Or browse by</span>
            <span className="w-full h-px bg-[var(--color-hairline)] flex-1" aria-hidden="true" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => switchBrowse(browseMode === 'category' ? null : 'category')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-body-sm transition-all ${
                browseMode === 'category'
                  ? 'bg-[var(--color-canvas-soft-2)] text-[var(--color-ink)] border-[var(--color-hairline-strong)]'
                  : 'bg-[var(--color-canvas)] text-[var(--color-body)] border-[var(--color-hairline)] hover:border-[var(--color-hairline-strong)]'
              }`}
              aria-pressed={browseMode === 'category'}
            >
              Category
            </button>
            <button
              onClick={() => switchBrowse(browseMode === 'topic' ? null : 'topic')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-body-sm transition-all ${
                browseMode === 'topic'
                  ? 'bg-[var(--color-canvas-soft-2)] text-[var(--color-ink)] border-[var(--color-hairline-strong)]'
                  : 'bg-[var(--color-canvas)] text-[var(--color-body)] border-[var(--color-hairline)] hover:border-[var(--color-hairline-strong)]'
              }`}
              aria-pressed={browseMode === 'topic'}
            >
              Topic text
            </button>
          </div>
        </div>
      )}

      {/* ── Category selector ── */}
      {browseMode === 'category' && (
        <div>
          <p className="text-caption text-[var(--color-mute)] mb-2">Choose a category</p>
          <div className="flex flex-wrap gap-1.5">
            {HASHTAG_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setSelected(new Set()); }}
                className={`px-3 py-1.5 rounded-full border text-caption transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[var(--color-canvas-soft-2)] text-[var(--color-ink)] border-[var(--color-hairline-strong)]'
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

      {/* ── Topic text input ── */}
      {browseMode === 'topic' && (
        <div>
          <label htmlFor="hashtag-topic" className="block text-caption text-[var(--color-mute)] mb-2">
            What is your post about?
          </label>
          <input
            id="hashtag-topic"
            type="text"
            value={topic}
            onChange={(e) => { setTopic(e.target.value); setSelected(new Set()); }}
            placeholder="e.g. leadership tips for new managers, AI in marketing..."
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-[var(--color-ink)] text-body-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-hairline-strong)] placeholder:text-[var(--color-mute)] transition-shadow"
          />
        </div>
      )}

      {/* ── Hashtag results grid ── */}
      {!aiLoading && hasResults && (
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
                    ? 'bg-[var(--color-canvas-soft-2)] text-[var(--color-ink)] border-[var(--color-hairline-strong)]'
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

      {/* ── Selected hashtags + copy ── */}
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

      {/* ── Empty states ── */}
      {!aiLoading && !hasResults && !aiPost.trim() && browseMode === null && (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-hairline)] p-8 text-center">
          <p className="text-body-sm text-[var(--color-mute)]">
            Paste your post above and click <span className="text-[var(--color-ink)] font-medium">Generate hashtags</span> — the AI will suggest 8 targeted hashtags based on your content.
          </p>
        </div>
      )}

      {browseMode === 'topic' && !topic.trim() && (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-hairline)] p-6 text-center">
          <p className="text-body-sm text-[var(--color-mute)]">
            Describe your post topic above to generate relevant hashtags.
          </p>
        </div>
      )}
    </div>
  );
}
