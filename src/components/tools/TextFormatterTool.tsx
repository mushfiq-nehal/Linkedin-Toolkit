import React, { useState, useRef, useEffect } from 'react';
import { formatText, STYLES } from '../../lib/tools/text-formatter';

async function fetchAIHooks(content: string): Promise<string[]> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: 'hooks', content }),
  });
  const data = await res.json() as { result?: string; error?: string };
  if (!res.ok || data.error) throw new Error(data.error ?? 'AI request failed');
  return (data.result ?? '')
    .split('\n')
    .map(l => l.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);
}

type Device = 'desktop' | 'mobile';
type StyleKey = Parameters<typeof formatText>[1];

const MAX_CHARS = 3000;

const EMOJI_CATEGORIES = [
  {
    id: 'bullets',
    label: 'Bullets',
    emojis: ['▶️', '▸', '◆', '◇', '•', '✅', '☑️', '✔️', '➡️', '🔹', '🔸', '💠', '🔘', '📌', '📍'],
  },
  {
    id: 'positive',
    label: 'Motivation',
    emojis: ['🚀', '💡', '⭐', '🌟', '✨', '🎯', '🏆', '🎉', '💪', '🙌', '👏', '🤝', '❤️', '🔥', '⚡'],
  },
  {
    id: 'business',
    label: 'Business',
    emojis: ['💼', '📊', '📈', '📉', '💰', '🏢', '🤝', '📋', '🗓️', '⏰', '📧', '💻', '🖥️', '📱', '🔑'],
  },
  {
    id: 'education',
    label: 'Learning',
    emojis: ['📚', '📖', '🎓', '✏️', '📝', '💭', '🧠', '🔬', '💡', '🌱', '📘', '📗', '📙', '🏫', '🎒'],
  },
  {
    id: 'actions',
    label: 'Actions',
    emojis: ['👇', '👆', '👉', '👈', '⬇️', '⬆️', '➕', '➖', '❓', '❗', '‼️', '⚠️', '🔔', '📢', '💬'],
  },
];

const TOOLBAR_FORMATS: Array<{ key: StyleKey; label: string; glyph: string }> = [
  { key: 'bold', label: 'Bold', glyph: '𝐁' },
  { key: 'italic', label: 'Italic', glyph: '𝐼' },
  { key: 'bold-italic', label: 'Bold Italic', glyph: '𝑩' },
  { key: 'sans-bold', label: 'Sans Bold', glyph: '𝗕' },
  { key: 'monospace', label: 'Monospace', glyph: '𝙼' },
  { key: 'strikethrough', label: 'Strikethrough', glyph: 'S̶' },
];

// Render LinkedIn post text: highlight #hashtags and @mentions in blue
function renderLinkedInText(raw: string): React.ReactNode[] {
  const parts = raw.split(/(#\w+|@\w+)/g);
  return parts.map((part, i) =>
    part.startsWith('#') || part.startsWith('@') ? (
      <span key={i} style={{ color: '#0a66c2', fontWeight: 600 }}>{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// Line-clamp based truncation — matches LinkedIn's actual "3 lines then see more" behaviour.
// forceExpanded: controlled by the parent's Collapsed/Expanded toggle.
// onTruncationChange: lifts truncation state to parent for the hook analyzer.
function PostPreviewText({
  text,
  forceExpanded,
  onTruncationChange,
}: {
  text: string;
  forceExpanded: boolean;
  onTruncationChange: (v: boolean) => void;
}) {
  const [userExpanded, setUserExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // Keep callback ref stable to avoid re-running effects on every render
  const callbackRef = useRef(onTruncationChange);
  callbackRef.current = onTruncationChange;

  const isExpanded = forceExpanded || userExpanded;

  // Reset user-click expansion whenever text changes
  useEffect(() => {
    setUserExpanded(false);
  }, [text]);

  // Measure overflow whenever text changes or collapsed state changes
  useEffect(() => {
    if (isExpanded) return;
    const el = ref.current;
    if (!el) return;
    const check = () => {
      const truncated = el.scrollHeight > el.clientHeight + 2;
      setIsTruncated(truncated);
      callbackRef.current(truncated);
    };
    check();
    const t = setTimeout(check, 60);
    return () => clearTimeout(t);
  }, [text, isExpanded]);

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={ref}
        style={{
          display: '-webkit-box',
          WebkitLineClamp: isExpanded ? 'unset' : '3',
          WebkitBoxOrient: 'vertical' as const,
          overflow: isExpanded ? 'visible' : 'hidden',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {renderLinkedInText(text)}
      </div>
      {!isExpanded && isTruncated && (
        /* Gradient overlay so "…more" sits inline at the right edge of line 3 */
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            paddingLeft: '3rem',
            background: 'linear-gradient(to right, transparent, #ffffff 40%)',
          }}
        >
          <button
            onClick={() => setUserExpanded(true)}
            style={{
              color: '#0a66c2',
              fontWeight: 600,
              fontSize: '14px',
              background: '#ffffff',
            }}
            className="hover:underline"
          >
            …more
          </button>
        </div>
      )}
    </div>
  );
}

// ── Hook Analyzer ──────────────────────────────────────────────────────────────

type HookRating = 'excellent' | 'good' | 'weak' | 'short' | null;

interface HookResult {
  rating: HookRating;
  label: string;
  description: string;
}

function analyzeHook(text: string, truncated: boolean): HookResult | null {
  if (!text.trim()) return null;

  if (!truncated) {
    return {
      rating: 'short',
      label: 'All content visible',
      description: 'Post fits in 3 lines — no "see more" triggered. Great for short-form content.',
    };
  }

  const lines = text.split('\n');
  const firstLine = lines.find(l => l.trim().length > 0)?.trim() ?? '';

  if (!firstLine) {
    return {
      rating: 'weak',
      label: 'Weak hook',
      description: 'Your post opens with a blank line. Move your strongest sentence to line 1.',
    };
  }

  if (firstLine.length < 28) {
    return {
      rating: 'weak',
      label: 'Weak hook',
      description: 'Opening line is too short. Give readers a compelling reason to click "see more".',
    };
  }

  const hasQuestion = firstLine.includes('?');
  const hasNumber = /\d/.test(firstLine);
  // Detect Unicode math alphanumeric bold/italic characters (our formatter output)
  const hasBoldStyle = [...firstLine].some(c => {
    const cp = c.codePointAt(0) ?? 0;
    return cp >= 0x1d400 && cp <= 0x1d7ff;
  });
  const isSubstantial = firstLine.length >= 55;

  const score = [hasQuestion, hasNumber, hasBoldStyle, isSubstantial].filter(Boolean).length;

  if (score >= 2) {
    return {
      rating: 'excellent',
      label: 'Strong hook',
      description: 'Clear, specific, and attention-grabbing. "See more" is likely to be clicked.',
    };
  }
  if (score >= 1) {
    return {
      rating: 'good',
      label: 'Decent hook',
      description: 'Solid start. A question, number, or bold claim would increase curiosity further.',
    };
  }
  return {
    rating: 'good',
    label: 'Decent hook',
    description: 'Consider opening with a bold statement, a specific number, or a question.',
  };
}

const HOOK_STYLES: Record<NonNullable<HookRating>, { dot: string; text: string; bg: string; border: string }> = {
  excellent: {
    dot: '#16a34a',
    text: '#15803d',
    bg: '#f0fdf4',
    border: '#bbf7d0',
  },
  good: {
    dot: '#2563eb',
    text: '#1d4ed8',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  weak: {
    dot: '#dc2626',
    text: '#b91c1c',
    bg: '#fef2f2',
    border: '#fecaca',
  },
  short: {
    dot: '#6b7280',
    text: '#4b5563',
    bg: '#f9fafb',
    border: '#e5e7eb',
  },
};

function HookAnalyzer({ text, truncated }: { text: string; truncated: boolean }) {
  const result = analyzeHook(text, truncated);
  if (!result || !result.rating) return null;

  const style = HOOK_STYLES[result.rating];

  return (
    <div
      className="mt-3 rounded-lg px-3 py-2.5 flex items-start gap-2.5"
      style={{ background: style.bg, border: `1px solid ${style.border}` }}
    >
      {/* Status dot */}
      <span
        className="mt-0.5 w-2 h-2 rounded-full shrink-0"
        style={{ background: style.dot, marginTop: '5px' }}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs font-semibold"
            style={{ color: style.text }}
          >
            {result.label}
          </span>
          {truncated && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ background: style.border, color: style.text }}
            >
              "see more" triggered
            </span>
          )}
        </div>
        <p className="text-xs mt-0.5" style={{ color: '#6b7280', lineHeight: '1.4' }}>
          {result.description}
        </p>
      </div>
    </div>
  );
}

// LinkedIn globe icon — exact path from LinkedIn's production SVG sprite
function IconGlobe() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" focusable="false" aria-hidden="true">
      <path d="M8 1a7 7 0 107 7 7 7 0 00-7-7zM3 8a5 5 0 011-3l.55.55A1.5 1.5 0 015 6.62v1.07a.75.75 0 00.22.53l.56.56a.75.75 0 00.53.22H7v.69a.75.75 0 00.22.53l.56.56a.75.75 0 01.22.53V13a5 5 0 01-5-5zm6.24 4.83l2-2.46a.75.75 0 00.09-.8l-.58-1.16A.76.76 0 0010 8H7v-.19a.51.51 0 01.28-.45l.38-.19a.74.74 0 01.68 0L9 7.5l.38-.7a1 1 0 00.12-.48v-.85a.78.78 0 01.21-.53l1.07-1.09a5 5 0 01-1.54 9z" />
    </svg>
  );
}

// LinkedIn reaction bubbles (like the actual stacked reaction icons)
function ReactionBubbles() {
  return (
    <span className="inline-flex items-center" aria-hidden="true">
      {/* Like - blue circle with thumb */}
      <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] -ml-0 z-10" style={{ background: '#0a66c2' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
          <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/>
        </svg>
      </span>
      {/* Heart - red circle */}
      <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] -ml-1 z-0" style={{ background: '#df704d' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </span>
    </span>
  );
}

// Action bar icons
function IconLike() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
      <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
    </svg>
  );
}

function IconComment() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  );
}

function IconRepost() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="17 1 21 5 17 9"/>
      <path d="M3 11V9a4 4 0 014-4h14"/>
      <polyline points="7 23 3 19 7 15"/>
      <path d="M21 13v2a4 4 0 01-4 4H3"/>
    </svg>
  );
}

function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}

// SVG icons for toolbar
function IconBulletList() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="9" y1="6" x2="20" y2="6" />
      <line x1="9" y1="12" x2="20" y2="12" />
      <line x1="9" y1="18" x2="20" y2="18" />
      <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconNumberedList() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <path d="M4 6h1v4" strokeWidth="1.8" />
      <path d="M4 10h2" strokeWidth="1.8" />
      <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" strokeWidth="1.8" />
    </svg>
  );
}

function IconUndo() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7v6h6" />
      <path d="M3 13C5.5 6.5 13 3.5 19 7a9 9 0 11-8 15" />
    </svg>
  );
}

function IconRedo() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 7v6h-6" />
      <path d="M21 13C18.5 6.5 11 3.5 5 7a9 9 0 108 15" />
    </svg>
  );
}

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

export default function TextFormatterTool() {
  const [text, setText] = useState('');

  const AUTHOR_NAME = 'Sarah Mitchell';
  const AUTHOR_TITLE = 'Personal Branding | Helping professionals stand out on LinkedIn';
  const [device, setDevice] = useState<Device>('desktop');
  const [previewMode, setPreviewMode] = useState<'collapsed' | 'expanded'>('collapsed');
  const [isTruncated, setIsTruncated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('bullets');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const [copiedStyleKey, setCopiedStyleKey] = useState<string | null>(null);

  // AI hook suggestions
  const [aiHooks, setAiHooks] = useState<string[]>([]);
  const [aiHooksLoading, setAiHooksLoading] = useState(false);
  const [aiHooksError, setAiHooksError] = useState('');
  const [aiHooksDone, setAiHooksDone] = useState(false);

  // AI hashtag nudge
  const [nudgeHashtags, setNudgeHashtags] = useState<string[]>([]);
  const [nudgeLoading, setNudgeLoading] = useState(false);
  const [nudgeError, setNudgeError] = useState('');
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Undo / redo history — stored in refs to avoid stale closures
  const historyRef = useRef<string[]>(['']);
  const historyIndexRef = useRef(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function pushHistory(value: string) {
    // Discard any future states when a new change is made
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push(value);
    historyIndexRef.current = historyRef.current.length - 1;
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }

  function undo() {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const val = historyRef.current[historyIndexRef.current];
    setText(val);
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(true);
  }

  function redo() {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current++;
    const val = historyRef.current[historyIndexRef.current];
    setText(val);
    setCanUndo(true);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }

  const charCount = text.length;
  const overLimit = charCount > MAX_CHARS;

  // Close emoji picker when clicking outside
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handler = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmojiPicker]);

  function applyFormat(style: StyleKey) {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start === end) {
      el.focus();
      return;
    }
    const before = text.slice(0, start);
    const selected = text.slice(start, end);
    const after = text.slice(end);
    const transformed = formatText(selected, style);
    const newText = before + transformed + after;
    setText(newText);
    pushHistory(newText);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start, start + transformed.length);
    });
  }

  function toggleList(type: 'bullet' | 'numbered') {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;

    // Expand to full line boundaries
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const afterEnd = text.indexOf('\n', end);
    const lineEnd = afterEnd === -1 ? text.length : afterEnd;

    const before = text.slice(0, lineStart);
    const block = text.slice(lineStart, lineEnd);
    const after = text.slice(lineEnd);

    const lines = block.split('\n');
    let newLines: string[];

    if (type === 'bullet') {
      const allBulleted = lines.every(l => l.startsWith('• '));
      newLines = allBulleted ? lines.map(l => l.slice(2)) : lines.map(l => '• ' + l);
    } else {
      const allNumbered = lines.every((l, i) => l.startsWith(`${i + 1}. `));
      newLines = allNumbered
        ? lines.map((l, i) => l.slice(`${i + 1}. `.length))
        : lines.map((l, i) => `${i + 1}. ` + l);
    }

    const newText = before + newLines.join('\n') + after;
    setText(newText);
    pushHistory(newText);
    requestAnimationFrame(() => el.focus());
  }

  function insertEmoji(emoji: string) {
    const el = textareaRef.current;
    const pos = el ? el.selectionStart : text.length;
    const newText = text.slice(0, pos) + emoji + text.slice(pos);
    setText(newText);
    pushHistory(newText);
    setRecentEmojis(prev => {
      const filtered = prev.filter(e => e !== emoji);
      return [emoji, ...filtered].slice(0, 15);
    });
    requestAnimationFrame(() => {
      if (el) {
        const newPos = pos + emoji.length;
        el.setSelectionRange(newPos, newPos);
        el.focus();
      }
    });
  }

  async function copyText() {
    if (!text) return;
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
  }

  async function copyStyleText(styleText: string, key: string) {
    try {
      await navigator.clipboard.writeText(styleText);
    } catch {
      const el = document.createElement('textarea');
      el.value = styleText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedStyleKey(key);
    setTimeout(() => setCopiedStyleKey(null), 2000);
  }

  async function handleAIHooks() {
    if (!text.trim()) return;
    setAiHooksLoading(true);
    setAiHooksError('');
    setAiHooks([]);
    setAiHooksDone(false);
    try {
      const hooks = await fetchAIHooks(text);
      setAiHooks(hooks);
      setAiHooksDone(true);
    } catch (err) {
      setAiHooksError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setAiHooksLoading(false);
    }
  }

  async function handleNudgeHashtags() {
    if (!text.trim()) return;
    setNudgeLoading(true);
    setNudgeError('');
    setNudgeHashtags([]);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'hashtags', content: text }),
      });
      const data = await res.json() as { result?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? 'AI request failed');
      const tags = (data.result ?? '')
        .split('\n')
        .map((l: string) => l.trim())
        .filter((l: string) => l.startsWith('#'));
      setNudgeHashtags(tags);
    } catch (err) {
      setNudgeError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setNudgeLoading(false);
    }
  }

  function appendHashtagToPost(tag: string) {
    const newText = text.trimEnd() + '\n\n' + tag;
    setText(newText);
    pushHistory(newText);
    setNudgeHashtags(prev => prev.filter(t => t !== tag));
  }

  function useHookAsOpener(hook: string) {
    const rest = text.split('\n').slice(1).join('\n').trimStart();
    const newText = rest ? `${hook}\n\n${rest}` : hook;
    setText(newText);
    pushHistory(newText);
  }

  const emojiCategoriesWithRecent =
    recentEmojis.length > 0
      ? [{ id: 'recent', label: 'Recent', emojis: recentEmojis }, ...EMOJI_CATEGORIES]
      : EMOJI_CATEGORIES;

  const currentEmojis =
    emojiCategoriesWithRecent.find(c => c.id === activeEmojiCategory)?.emojis ??
    EMOJI_CATEGORIES[0].emojis;

  // Progress bar width for char count (capped at 100%)
  const progressPct = Math.min((charCount / MAX_CHARS) * 100, 100);
  const progressColor =
    charCount > MAX_CHARS
      ? 'var(--color-error)'
      : charCount > 2700
        ? 'var(--color-warning)'
        : 'var(--color-ink)';

  return (
    <div className="flex flex-col gap-8">
      {/* ── Main tool: editor + preview ── */}
      <div
        className="rounded-[var(--radius-md)] border border-[var(--color-hairline)] overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_520px]"
        style={{ boxShadow: 'var(--shadow-card-lg)' }}
      >
        {/* ────────────── Left: Editor ────────────── */}
        <div className="flex flex-col border-b lg:border-b-0 lg:border-r border-[var(--color-hairline)]">
          {/* Toolbar */}
          <div
            className="flex items-center flex-wrap gap-x-0.5 gap-y-1 px-3 py-2 border-b border-[var(--color-hairline)] bg-[var(--color-canvas-soft)]"
            role="toolbar"
            aria-label="Text formatting toolbar"
          >
            {/* Format buttons */}
            <div className="flex items-center gap-0.5" role="group" aria-label="Text styles">
              {TOOLBAR_FORMATS.map(f => (
                <button
                  key={f.key}
                  onClick={() => applyFormat(f.key)}
                  title={`${f.label} — select text first`}
                  aria-label={f.label}
                  className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-xs)] text-[var(--color-body)] hover:bg-[var(--color-canvas-soft-2)] hover:text-[var(--color-ink)] active:bg-[var(--color-canvas-soft-2)] transition-colors text-[15px] leading-none select-none"
                >
                  {f.glyph}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-[var(--color-hairline)] mx-1 shrink-0" aria-hidden="true" />

            {/* List buttons */}
            <div className="flex items-center gap-0.5" role="group" aria-label="List formatting">
              <button
                onClick={() => toggleList('bullet')}
                title="Bullet list — prefix lines with •"
                aria-label="Toggle bullet list"
                className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-xs)] text-[var(--color-body)] hover:bg-[var(--color-canvas-soft-2)] hover:text-[var(--color-ink)] active:bg-[var(--color-canvas-soft-2)] transition-colors"
              >
                <IconBulletList />
              </button>
              <button
                onClick={() => toggleList('numbered')}
                title="Numbered list — prefix lines with 1. 2. 3."
                aria-label="Toggle numbered list"
                className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-xs)] text-[var(--color-body)] hover:bg-[var(--color-canvas-soft-2)] hover:text-[var(--color-ink)] active:bg-[var(--color-canvas-soft-2)] transition-colors"
              >
                <IconNumberedList />
              </button>
            </div>

            <div className="w-px h-5 bg-[var(--color-hairline)] mx-1 shrink-0" aria-hidden="true" />

            {/* Emoji picker trigger */}
            <button
              onClick={() => setShowEmojiPicker(v => !v)}
              title="Insert emoji"
              aria-label="Toggle emoji picker"
              aria-expanded={showEmojiPicker}
              className={`flex items-center justify-center w-8 h-8 rounded-[var(--radius-xs)] transition-colors text-[15px] leading-none ${
                showEmojiPicker
                  ? 'bg-[var(--color-canvas-soft-2)] text-[var(--color-ink)]'
                  : 'text-[var(--color-body)] hover:bg-[var(--color-canvas-soft-2)] hover:text-[var(--color-ink)]'
              }`}
            >
              😊
            </button>

            <div className="w-px h-5 bg-[var(--color-hairline)] mx-1 shrink-0" aria-hidden="true" />

            {/* Undo / Redo */}
            <div className="flex items-center gap-0.5" role="group" aria-label="Undo and redo">
              <button
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
                className={`flex items-center justify-center w-8 h-8 rounded-[var(--radius-xs)] transition-colors ${
                  canUndo
                    ? 'text-[var(--color-body)] hover:bg-[var(--color-canvas-soft-2)] hover:text-[var(--color-ink)]'
                    : 'text-[var(--color-hairline-strong)] cursor-not-allowed'
                }`}
              >
                <IconUndo />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
                aria-label="Redo"
                className={`flex items-center justify-center w-8 h-8 rounded-[var(--radius-xs)] transition-colors ${
                  canRedo
                    ? 'text-[var(--color-body)] hover:bg-[var(--color-canvas-soft-2)] hover:text-[var(--color-ink)]'
                    : 'text-[var(--color-hairline-strong)] cursor-not-allowed'
                }`}
              >
                <IconRedo />
              </button>
            </div>

            {/* Right-aligned usage hint */}
            <span className="ml-auto text-caption text-[var(--color-mute)] hidden sm:block select-none" aria-hidden="true">
              Select text → apply style
            </span>
          </div>

          {/* Emoji picker panel */}
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="border-b border-[var(--color-hairline)] bg-[var(--color-canvas)]"
            >
              {/* Category tabs */}
              <div className="flex items-center gap-1 px-3 pt-2.5 pb-2 overflow-x-auto" role="tablist" aria-label="Emoji categories">
                {emojiCategoriesWithRecent.map(cat => (
                  <button
                    key={cat.id}
                    role="tab"
                    aria-selected={activeEmojiCategory === cat.id}
                    onClick={() => setActiveEmojiCategory(cat.id)}
                    className={`shrink-0 px-2.5 py-1 rounded-full text-caption transition-all ${
                      activeEmojiCategory === cat.id
                        ? 'bg-[var(--color-ink)] text-white'
                        : 'bg-[var(--color-canvas-soft-2)] text-[var(--color-body)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              {/* Emoji grid */}
              <div
                role="tabpanel"
                aria-label={emojiCategoriesWithRecent.find(c => c.id === activeEmojiCategory)?.label}
                className="grid grid-cols-10 sm:grid-cols-12 gap-0.5 px-3 pb-3"
              >
                {currentEmojis.map((emoji, i) => (
                  <button
                    key={`${emoji}-${i}`}
                    onClick={() => insertEmoji(emoji)}
                    title={`Insert ${emoji}`}
                    aria-label={`Insert ${emoji}`}
                    className="text-xl py-1.5 rounded-[var(--radius-xs)] hover:bg-[var(--color-canvas-soft-2)] hover:scale-110 transition-all leading-none aspect-square flex items-center justify-center"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            id="formatter-input"
            value={text}
            onChange={e => {
              const val = e.target.value;
              setText(val);
              if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
              typingTimerRef.current = setTimeout(() => pushHistory(val), 600);
            }}
            placeholder="Write your LinkedIn post here. Select text, then click a format button to apply bold, italic, or other styles."
            className="flex-1 w-full min-h-[280px] bg-[var(--color-canvas)] text-[var(--color-ink)] text-body-sm px-4 py-4 resize-none focus:outline-none placeholder:text-[var(--color-mute)] leading-relaxed"
            aria-label="LinkedIn post content"
            aria-describedby="char-count-info"
          />

          {/* Character count + progress */}
          <div
            id="char-count-info"
            className="border-t border-[var(--color-hairline)] bg-[var(--color-canvas-soft)]"
          >
            {/* Progress bar */}
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
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
                {overLimit && ' — over limit'}
              </span>
              <span className="text-caption text-[var(--color-mute)]">
                "…see more" after 3 lines
              </span>
            </div>
          </div>

          {/* Hashtag nudge */}
          {text.length > 60 && !/#\w+/.test(text) && !nudgeDismissed && (
            <div className="border-t border-[var(--color-hairline)] px-4 py-3 bg-[var(--color-canvas-soft)]">
              {nudgeHashtags.length === 0 && !nudgeLoading && !nudgeError && (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-caption text-[var(--color-ink)]">
                    <span className="font-semibold">No hashtags detected</span>
                    <span className="text-[var(--color-body)]"> — add some for better reach?</span>
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleNudgeHashtags}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-xs)] text-caption-strong text-white bg-[var(--color-ink)] hover:opacity-90 transition-opacity"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                      Generate
                    </button>
                    <button
                      onClick={() => setNudgeDismissed(true)}
                      className="text-caption text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
                      aria-label="Dismiss"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {nudgeLoading && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-[var(--color-ink)] border-t-transparent animate-spin" aria-hidden="true" />
                  <span className="text-caption text-[var(--color-mute)]">Generating hashtags…</span>
                </div>
              )}

              {nudgeError && (
                <p className="text-caption text-[var(--color-error)]">{nudgeError}</p>
              )}

              {nudgeHashtags.length > 0 && (
                <div>
                  <p className="text-caption text-[var(--color-mute)] mb-2">Click to add to your post:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {nudgeHashtags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => appendHashtagToPost(tag)}
                        className="px-2.5 py-1 rounded-full border border-[var(--color-hairline)] text-caption text-[var(--color-body)] bg-[var(--color-canvas-soft)] hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] hover:bg-[var(--color-canvas)] transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Copy button */}
          <div className="px-4 py-3 border-t border-[var(--color-hairline)]">
            <button
              onClick={copyText}
              disabled={!text}
              aria-live="polite"
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-sm)] text-body-sm-strong transition-all ${
                !text
                  ? 'bg-[var(--color-canvas-soft-2)] text-[var(--color-mute)] cursor-not-allowed'
                  : copied
                    ? 'bg-[var(--color-link)] text-white'
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
                  Copy formatted text
                </>
              )}
            </button>
          </div>
        </div>

        {/* ────────────── Right: Preview ────────────── */}
        <div className="flex flex-col bg-[var(--color-canvas-soft)]">
          {/* Preview header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-hairline)] gap-2 flex-wrap">
            <span className="text-caption-mono text-[var(--color-mute)] uppercase tracking-wider">
              Post Preview
            </span>

            <div className="flex items-center gap-2">
              {/* Collapsed / Expanded toggle */}
              <div
                className="flex items-center rounded-[var(--radius-xs)] border border-[var(--color-hairline)] overflow-hidden"
                role="group"
                aria-label="Preview mode"
              >
                {(['collapsed', 'expanded'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setPreviewMode(mode)}
                    aria-pressed={previewMode === mode}
                    title={mode === 'collapsed' ? 'Show how post looks in feed (3 lines)' : 'Show fully expanded post'}
                    className={`px-2.5 py-1 text-caption transition-all capitalize ${
                      previewMode === mode
                        ? 'bg-[var(--color-ink)] text-white'
                        : 'bg-[var(--color-canvas)] text-[var(--color-mute)] hover:text-[var(--color-ink)]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="w-px h-4 bg-[var(--color-hairline)]" aria-hidden="true" />

              {/* Device toggle */}
              <div className="flex items-center gap-1" role="group" aria-label="Preview device">
                {(['desktop', 'mobile'] as Device[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setDevice(d)}
                    aria-pressed={device === d}
                    aria-label={`Preview on ${d}`}
                    title={d === 'desktop' ? 'Desktop preview' : 'Mobile preview'}
                    className={`w-7 h-7 flex items-center justify-center rounded-[var(--radius-xs)] transition-all ${
                      device === d
                        ? 'bg-[var(--color-ink)] text-white'
                        : 'text-[var(--color-mute)] hover:text-[var(--color-ink)] hover:bg-[var(--color-canvas-soft-2)]'
                    }`}
                  >
                    {d === 'desktop' ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <rect x="1" y="2" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
                        <path d="M5 12h4M7 10v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <rect x="3" y="1" width="8" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                        <circle cx="7" cy="11" r="0.75" fill="currentColor" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* LinkedIn post mock */}
          <div className="flex-1 p-3 overflow-auto" style={{ background: '#f3f2ef' }}>
            <div
              className={`mx-auto w-full transition-all duration-200 ${
                device === 'mobile' ? 'max-w-[390px]' : 'max-w-full'
              }`}
            >
              {/* Card — matches: bg-white border shadow-sm px-4 py-3 rounded-lg */}
              <div
                className="bg-white px-4 py-3 rounded-lg"
                style={{
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
                  fontFamily: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Fira Sans", Ubuntu, Oxygen, "Oxygen Sans", Cantarell, "Droid Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Lucida Grande", Helvetica, Arial, sans-serif',
                }}
                role="region"
                aria-label={`LinkedIn post preview — ${device}`}
              >
                {/* Header — flex items-center */}
                <div className="flex items-center">
                  {/* Avatar */}
                  <img
                    src="/avatar.png"
                    alt={AUTHOR_NAME}
                    className="h-14 w-14 rounded-full shrink-0 object-cover"
                  />

                  {/* Meta — ml-2 */}
                  <div className="ml-2 min-w-0 flex-1">
                    {/* Name row */}
                    <div className="text-sm flex items-baseline gap-1 truncate">
                      <span className="font-semibold" style={{ color: '#111827' }}>
                        {AUTHOR_NAME}
                      </span>
                      <span style={{ color: '#6b7280' }}>• 1st</span>
                    </div>
                    {/* Headline */}
                    <div className="text-xs truncate" style={{ color: '#6b7280' }}>
                      {AUTHOR_TITLE}
                    </div>
                    {/* Timestamp + globe */}
                    <div className="text-xs flex items-center gap-0.5" style={{ color: '#6b7280' }}>
                      <span>12h •</span>
                      <IconGlobe />
                    </div>
                  </div>
                </div>

                {/* Post body — text-gray-800 text-sm mt-2 leading-normal */}
                <div className="text-sm mt-2" style={{ color: '#1f2937', lineHeight: '1.5' }}>
                  {text ? (
                    <PostPreviewText
                      text={text}
                      forceExpanded={previewMode === 'expanded'}
                      onTruncationChange={setIsTruncated}
                    />
                  ) : (
                    <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                      Start writing and your post will appear here..
                    </span>
                  )}
                </div>

                {/* Reactions — text-gray-500 text-xs flex items-center mt-3 */}
                <div className="text-xs flex items-center justify-between mt-3" style={{ color: '#6b7280' }}>
                  <div className="flex items-center">
                    <ReactionBubbles />
                    <span className="ml-1">47</span>
                  </div>
                  <span>24 comments · 6 reposts</span>
                </div>

                {/* Action bar */}
                <div className="flex items-center justify-around mt-2 pt-2" style={{ borderTop: '1px solid #f3f4f6' }}>
                  {[
                    { label: 'Like', icon: <IconLike /> },
                    { label: 'Comment', icon: <IconComment /> },
                    { label: 'Repost', icon: <IconRepost /> },
                    { label: 'Send', icon: <IconSend /> },
                  ].map(({ label, icon }) => (
                    <button
                      key={label}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-gray-100 transition-colors"
                      style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}
                      aria-label={`${label} (preview only)`}
                      tabIndex={-1}
                    >
                      {icon}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hook analyzer */}
              {text && <HookAnalyzer text={text} truncated={isTruncated} />}

              {/* AI Hook Suggestions */}
              {text && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold flex items-center gap-1" style={{ color: '#374151' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                      AI hook ideas
                    </span>
                    <button
                      onClick={handleAIHooks}
                      disabled={aiHooksLoading}
                      className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-opacity disabled:opacity-40"
                      style={{ background: '#111827', color: '#fff' }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                      {aiHooksLoading ? 'Writing…' : aiHooksDone ? 'Regenerate' : 'Generate'}
                    </button>
                  </div>

                  {aiHooksError && (
                    <p className="text-xs rounded px-3 py-2" style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca' }}>
                      {aiHooksError}
                    </p>
                  )}

                  {aiHooksLoading && (
                    <div className="flex flex-col gap-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-7 rounded animate-pulse" style={{ background: '#f3f4f6' }} />
                      ))}
                    </div>
                  )}

                  {!aiHooksLoading && aiHooks.length > 0 && (
                    <ol className="flex flex-col gap-2 list-none p-0 m-0">
                      {aiHooks.map((hook, i) => (
                        <li key={i} className="flex items-start gap-2 rounded px-3 py-2" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                          <span className="text-xs shrink-0" style={{ color: '#9ca3af', marginTop: '2px' }}>{i + 1}.</span>
                          <span className="text-xs flex-1 leading-snug" style={{ color: '#111827' }}>{hook}</span>
                          <button
                            onClick={() => useHookAsOpener(hook)}
                            className="shrink-0 text-xs px-2 py-0.5 rounded transition-colors hover:bg-white whitespace-nowrap"
                            style={{ color: '#0a66c2', border: '1px solid #e5e7eb' }}
                            title="Replace first line with this hook"
                          >
                            Use
                          </button>
                        </li>
                      ))}
                    </ol>
                  )}

                  {!aiHooksLoading && !aiHooksDone && !aiHooksError && (
                    <p className="text-xs" style={{ color: '#374151' }}>
                      Get 3 AI-written opening lines — click <strong>Generate</strong> to replace your hook.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── All styles: quick copy ── */}
      {text && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-body-sm-strong text-[var(--color-ink)]">
              Apply a style to your entire post
            </p>
            <p className="text-caption text-[var(--color-mute)] hidden sm:block">
              Copy and paste any version directly into LinkedIn
            </p>
          </div>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-hairline)] overflow-hidden">
            {STYLES.map((style, i) => {
              const result = formatText(text, style.key as StyleKey);
              return (
                <div
                  key={style.key}
                  className={`flex items-center justify-between px-4 py-3 gap-4 ${
                    i % 2 === 0 ? 'bg-[var(--color-canvas)]' : 'bg-[var(--color-canvas-soft)]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-caption text-[var(--color-mute)] block mb-0.5">
                      {style.label}
                    </span>
                    <p className="text-body-sm text-[var(--color-ink)] truncate">{result}</p>
                  </div>
                  <button
                    onClick={() => copyStyleText(result, style.key)}
                    aria-label={`Copy ${style.label} version`}
                    className={`shrink-0 flex items-center gap-1.5 text-caption px-2.5 py-1 rounded-[var(--radius-xs)] transition-all ${
                      copiedStyleKey === style.key
                        ? 'text-[var(--color-link)] bg-[var(--color-link-bg-soft)]'
                        : 'text-[var(--color-mute)] hover:text-[var(--color-ink)] hover:bg-[var(--color-canvas-soft-2)]'
                    }`}
                  >
                    {copiedStyleKey === style.key ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state hint */}
      {!text && (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-hairline)] p-8 text-center">
          <p className="text-body-sm text-[var(--color-mute)]">
            Start typing your post above to see all formatting styles and a live preview.
          </p>
        </div>
      )}
    </div>
  );
}
