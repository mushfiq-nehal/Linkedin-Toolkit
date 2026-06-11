import { useState, useCallback, useEffect, useRef } from 'react';
import EmojiPicker from './EmojiPicker';
import { loadRecentEmojis, saveRecentEmoji } from '../../lib/tools/emoji-data';

function IconCopy() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 9V3a1 1 0 011-1h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v4M8.5 6v4M3.5 3.5l.5 8h6l.5-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function EmojiAdderTool() {
  const [postText, setPostText] = useState('');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setRecentEmojis(loadRecentEmojis());
  }, []);

  const insertEmoji = useCallback((emoji: string) => {
    const el = textareaRef.current;
    const pos = el ? el.selectionStart : postText.length;
    const newText = postText.slice(0, pos) + emoji + postText.slice(pos);
    setPostText(newText);
    setRecentEmojis(prev => saveRecentEmoji(emoji, prev));
    requestAnimationFrame(() => {
      if (el) {
        const newPos = pos + emoji.length;
        el.setSelectionRange(newPos, newPos);
        el.focus();
      }
    });
  }, [postText]);

  const copyPost = useCallback(async () => {
    if (!postText) return;
    try {
      await navigator.clipboard.writeText(postText);
    } catch {
      const el = document.createElement('textarea');
      el.value = postText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [postText]);

  const charCount = postText.length;
  const overLimit = charCount > 3000;
  const progressPct = Math.min((charCount / 3000) * 100, 100);
  const progressColor = overLimit
    ? 'var(--color-error)'
    : charCount > 2700
      ? 'var(--color-warning)'
      : 'var(--color-ink)';

  return (
    <div className="flex flex-col gap-6">
      {/* Layout: emoji picker left + composer right on large screens */}
      <div
        className="rounded-[var(--radius-md)] border border-[var(--color-hairline)] overflow-hidden grid grid-cols-1 lg:grid-cols-[380px_1fr]"
        style={{ boxShadow: 'var(--shadow-card-lg)' }}
      >
        {/* ── Left: Emoji Picker ── */}
        <div className="border-b lg:border-b-0 lg:border-r border-[var(--color-hairline)] bg-[var(--color-canvas)] flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--color-hairline)] bg-[var(--color-canvas-soft)]">
            <p className="text-body-sm-strong text-[var(--color-ink)]">Emoji picker</p>
            <p className="text-caption text-[var(--color-mute)] mt-0.5">
              Click an emoji to insert it at the cursor
            </p>
          </div>

          {/* Picker */}
          <EmojiPicker
            onSelect={insertEmoji}
            recentEmojis={recentEmojis}
          />
        </div>

        {/* ── Right: Post Composer ── */}
        <div className="flex flex-col bg-[var(--color-canvas)]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--color-hairline)] bg-[var(--color-canvas-soft)] flex items-center justify-between gap-2">
            <div>
              <p className="text-body-sm-strong text-[var(--color-ink)]">Your post</p>
              <p className="text-caption text-[var(--color-mute)] mt-0.5">
                Type or paste your text, then click emojis to insert
              </p>
            </div>
            {postText && (
              <button
                onClick={() => {
                  setPostText('');
                  textareaRef.current?.focus();
                }}
                title="Clear post"
                aria-label="Clear post"
                className="shrink-0 flex items-center gap-1.5 text-caption px-2.5 py-1.5 rounded-[var(--radius-xs)] text-[var(--color-mute)] hover:text-[var(--color-error)] hover:bg-[var(--color-canvas-soft-2)] transition-colors"
              >
                <IconTrash />
                Clear
              </button>
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            id="emoji-adder-post"
            value={postText}
            onChange={e => setPostText(e.target.value)}
            placeholder="Write or paste your LinkedIn post here. Click emojis on the left to insert them at the cursor position."
            className="flex-1 w-full min-h-[260px] bg-[var(--color-canvas)] text-[var(--color-ink)] text-body-sm px-4 py-4 resize-none focus:outline-none placeholder:text-[var(--color-mute)] leading-relaxed"
            aria-label="Post content"
            aria-describedby="emoji-char-count"
          />

          {/* Character count + progress */}
          <div
            id="emoji-char-count"
            className="border-t border-[var(--color-hairline)] bg-[var(--color-canvas-soft)]"
          >
            <div className="h-0.5 bg-[var(--color-hairline)]" aria-hidden="true">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${progressPct}%`, backgroundColor: progressColor }}
              />
            </div>
            <div className="flex items-center justify-between px-4 py-2.5">
              <span
                className={`text-caption ${overLimit ? 'text-[var(--color-error)] font-medium' : 'text-[var(--color-mute)]'}`}
              >
                {charCount.toLocaleString()} / 3,000 characters
                {overLimit && ' — over limit'}
              </span>
              <span className="text-caption text-[var(--color-mute)]">
                LinkedIn limit: 3,000 chars
              </span>
            </div>
          </div>

          {/* Copy button */}
          <div className="px-4 py-3 border-t border-[var(--color-hairline)]">
            <button
              onClick={copyPost}
              disabled={!postText}
              aria-live="polite"
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-sm)] text-body-sm-strong transition-all ${
                !postText
                  ? 'bg-[var(--color-canvas-soft-2)] text-[var(--color-mute)] cursor-not-allowed'
                  : copied
                    ? 'bg-[var(--color-success)] text-white'
                    : 'bg-[var(--color-ink)] text-white hover:opacity-90 active:opacity-80'
              }`}
            >
              {copied ? (
                <>
                  <IconCheck />
                  Copied to clipboard!
                </>
              ) : (
                <>
                  <IconCopy />
                  Copy post text
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-canvas-soft)] px-4 py-3">
        <p className="text-caption-mono text-[var(--color-mute)] uppercase tracking-wider mb-2" style={{ fontSize: '10px' }}>Tips</p>
        <ul className="flex flex-col gap-1.5">
          {[
            'Click any emoji to insert it at your cursor position in the post.',
            'Use the search bar to find emojis by name (e.g. "fire", "heart", "rocket").',
            'Recently used emojis appear in the 🕐 tab for quick access.',
            'Paste your existing LinkedIn draft and enrich it with emojis.',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-caption text-[var(--color-body)]">
              <span className="shrink-0 mt-px text-[var(--color-mute)]">·</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
