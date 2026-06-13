import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { formatText, unformatText, STYLES } from '../../lib/tools/text-formatter';
import {
  LI_FONT,
  PostPreviewText,
  HookAnalyzer,
  IconGlobe,
  LinkedInReactionBar,
} from './LinkedInPostMock';
import EmojiPicker from './EmojiPicker';
import { loadRecentEmojis, saveRecentEmoji } from '../../lib/tools/emoji-data';

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
const DRAFT_KEY = 'linkedin-toolkit:text-formatter-draft';


const TOOLBAR_FORMATS: Array<{ key: StyleKey; label: string; glyph: string }> = [
  { key: 'bold', label: 'Bold', glyph: '𝐁' },
  { key: 'italic', label: 'Italic', glyph: '𝐼' },
  { key: 'bold-italic', label: 'Bold Italic', glyph: '𝑩' },
  { key: 'sans-bold', label: 'Sans Bold', glyph: '𝗕' },
  { key: 'monospace', label: 'Monospace', glyph: '𝙼' },
  { key: 'strikethrough', label: 'Strikethrough', glyph: 'S̶' },
];

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
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const [pickerPos, setPickerPos] = useState<{ top: number; left: number } | null>(null);

  // Undo / redo history — stored in refs to avoid stale closures
  const historyRef = useRef<string[]>(['']);
  const historyIndexRef = useRef(0);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore saved draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        setText(saved);
        historyRef.current = [saved];
        historyIndexRef.current = 0;
      }
    } catch {
      // localStorage unavailable (e.g. private browsing) — ignore
    }
    setRecentEmojis(loadRecentEmojis());
  }, []);

  // Auto-save draft to localStorage (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        if (text) {
          localStorage.setItem(DRAFT_KEY, text);
        } else {
          localStorage.removeItem(DRAFT_KEY);
        }
      } catch {
        // ignore storage errors
      }
    }, 400);
    return () => clearTimeout(t);
  }, [text]);

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

  // Calculate picker position anchored to the emoji button
  const updatePickerPos = useCallback(() => {
    if (!emojiButtonRef.current) return;
    const PICKER_W = 340;
    const PICKER_H = 390;
    const GAP = 6;
    const rect = emojiButtonRef.current.getBoundingClientRect();
    let top = rect.bottom + GAP;
    let left = rect.left;
    // Flip upward if not enough space below
    if (top + PICKER_H > window.innerHeight - 8) {
      top = rect.top - PICKER_H - GAP;
    }
    // Clamp horizontally inside viewport
    if (left + PICKER_W > window.innerWidth - 8) {
      left = window.innerWidth - PICKER_W - 8;
    }
    if (left < 8) left = 8;
    setPickerPos({ top, left });
  }, []);

  // Open/close: compute position, attach outside-click, Escape, scroll listeners
  useEffect(() => {
    if (!showEmojiPicker) {
      setPickerPos(null);
      return;
    }
    updatePickerPos();
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const insidePicker = emojiPickerRef.current?.contains(target);
      const insideButton = emojiButtonRef.current?.contains(target);
      if (!insidePicker && !insideButton) setShowEmojiPicker(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowEmojiPicker(false);
    };
    const onScroll = (e: Event) => {
      // Don't close when scrolling inside the picker itself
      if (emojiPickerRef.current?.contains(e.target as Node)) return;
      setShowEmojiPicker(false);
    };
    const onResize = () => updatePickerPos();
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScroll, { capture: true });
      window.removeEventListener('resize', onResize);
    };
  }, [showEmojiPicker, updatePickerPos]);

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

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;
    const key = e.key.toLowerCase();
    if (key === 'b') {
      e.preventDefault();
      applyFormat('bold');
    } else if (key === 'i') {
      e.preventDefault();
      applyFormat('italic');
    } else if (key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    } else if (key === 'y' || (key === 'z' && e.shiftKey)) {
      e.preventDefault();
      redo();
    }
  }

  function clearFormatting() {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const hasSelection = start !== end;
    const target = hasSelection ? text.slice(start, end) : text;
    const cleaned = unformatText(target);
    const newText = hasSelection
      ? text.slice(0, start) + cleaned + text.slice(end)
      : cleaned;
    if (newText === text) return;
    setText(newText);
    pushHistory(newText);
    requestAnimationFrame(() => {
      el.focus();
      if (hasSelection) el.setSelectionRange(start, start + cleaned.length);
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
    setRecentEmojis(prev => saveRecentEmoji(emoji, prev));
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
    const newText = text.trimEnd() + ' ' + tag;
    setText(newText);
    pushHistory(newText);
    // Keep the list intact so the user can add more hashtags
  }

  function appendAllHashtagsToPost() {
    if (nudgeHashtags.length === 0) return;
    const newText = text.trimEnd() + '\n\n' + nudgeHashtags.join(' ');
    setText(newText);
    pushHistory(newText);
  }

  function useHookAsOpener(hook: string) {
    const cleanHook = stripMarkdownBold(hook);
    const rest = text.split('\n').slice(1).join('\n').trimStart();
    const newText = rest ? `${cleanHook}\n\n${rest}` : cleanHook;
    setText(newText);
    pushHistory(newText);
  }

  /** Strip **bold** markers from a string, returning plain text */
  function stripMarkdownBold(str: string): string {
    return str.replace(/\*\*(.*?)\*\*/g, '$1');
  }

  /** Render a hook string with **bold** segments as <strong> elements */
  function renderHookText(str: string): React.ReactNode {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  }

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
              <button
                onClick={clearFormatting}
                title="Clear formatting — applies to selection, or the whole post"
                aria-label="Clear formatting"
                className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-xs)] text-[var(--color-body)] hover:bg-[var(--color-canvas-soft-2)] hover:text-[var(--color-ink)] active:bg-[var(--color-canvas-soft-2)] transition-colors text-[12px] font-semibold leading-none select-none"
              >
                Tx
              </button>
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
              ref={emojiButtonRef}
              onClick={() => setShowEmojiPicker(v => !v)}
              title="Insert emoji"
              aria-label="Toggle emoji picker"
              aria-expanded={showEmojiPicker}
              aria-haspopup="dialog"
              className={`flex items-center justify-center w-8 h-8 rounded-[var(--radius-xs)] transition-colors text-[15px] leading-none ${
                showEmojiPicker
                  ? 'bg-[var(--color-canvas-soft-2)] text-[var(--color-ink)] ring-1 ring-[var(--color-hairline-strong)]'
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
              Select text → apply style · Ctrl+B bold · Ctrl+I italic
            </span>
          </div>

          {/* Floating emoji picker — rendered via portal so it overlays without pushing content */}
          {showEmojiPicker && pickerPos && createPortal(
            <div
              ref={emojiPickerRef}
              role="dialog"
              aria-label="Emoji picker"
              style={{
                position: 'fixed',
                top: pickerPos.top,
                left: pickerPos.left,
                width: 340,
                zIndex: 9999,
                boxShadow: 'var(--shadow-modal)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-hairline)',
                background: 'var(--color-canvas)',
                overflow: 'hidden',
              }}
            >
              <EmojiPicker
                onSelect={insertEmoji}
                recentEmojis={recentEmojis}
                compact
              />
            </div>,
            document.body
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
            onKeyDown={handleKeyDown}
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
          {text.length > 60 && !nudgeDismissed && (
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
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="text-caption text-[var(--color-mute)]">Click a hashtag to add, or add all at once:</p>
                    <button
                      onClick={appendAllHashtagsToPost}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-xs)] text-caption-strong text-white bg-[var(--color-ink)] hover:opacity-90 transition-opacity"
                    >
                      + Add All
                    </button>
                  </div>
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

          {/* Copy + clear */}
          <div className="px-4 py-3 border-t border-[var(--color-hairline)] flex items-center gap-2">
            <button
              onClick={copyText}
              disabled={!text}
              aria-live="polite"
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius-sm)] text-body-sm-strong transition-all ${
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
            <button
              onClick={() => {
                setText('');
                pushHistory('');
                try {
                  localStorage.removeItem(DRAFT_KEY);
                } catch {
                  // ignore storage errors
                }
              }}
              disabled={!text}
              title="Clear post and saved draft"
              aria-label="Clear post and saved draft"
              className={`shrink-0 px-4 py-2.5 rounded-[var(--radius-sm)] text-body-sm border transition-colors ${
                !text
                  ? 'border-[var(--color-hairline)] text-[var(--color-mute)] cursor-not-allowed'
                  : 'border-[var(--color-hairline)] text-[var(--color-body)] hover:text-[var(--color-error)] hover:border-[var(--color-error)]'
              }`}
            >
              Clear
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
                  fontFamily: LI_FONT,
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

                <LinkedInReactionBar />
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
                          <span className="text-xs flex-1 leading-snug" style={{ color: '#111827' }}>{renderHookText(hook)}</span>
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

      {/* Accessibility + draft note */}
      <p className="text-caption text-[var(--color-mute)]">
        Your draft is saved automatically in this browser. Note: Unicode-styled text may be
        read letter-by-letter by some screen readers — use formatting for emphasis, not for
        entire posts.
      </p>
    </div>
  );
}
