import React, { useState, useRef, useEffect } from 'react';

export const LI_FONT =
  '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Fira Sans", Ubuntu, Oxygen, "Oxygen Sans", Cantarell, "Droid Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Lucida Grande", Helvetica, Arial, sans-serif';

// Render LinkedIn post text: highlight #hashtags and @mentions in blue
export function renderLinkedInText(raw: string): React.ReactNode[] {
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
export function PostPreviewText({
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
  const callbackRef = useRef(onTruncationChange);
  callbackRef.current = onTruncationChange;

  const isExpanded = forceExpanded || userExpanded;

  useEffect(() => {
    setUserExpanded(false);
  }, [text]);

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

export function HookAnalyzer({ text, truncated }: { text: string; truncated: boolean }) {
  const result = analyzeHook(text, truncated);
  if (!result || !result.rating) return null;

  const style = HOOK_STYLES[result.rating];

  return (
    <div
      className="mt-3 rounded-lg px-3 py-2.5 flex items-start gap-2.5"
      style={{ background: style.bg, border: `1px solid ${style.border}` }}
    >
      <span
        className="mt-0.5 w-2 h-2 rounded-full shrink-0"
        style={{ background: style.dot, marginTop: '5px' }}
        aria-hidden="true"
      />
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold" style={{ color: style.text }}>
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

export function IconGlobe() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" focusable="false" aria-hidden="true">
      <path d="M8 1a7 7 0 107 7 7 7 0 00-7-7zM3 8a5 5 0 011-3l.55.55A1.5 1.5 0 015 6.62v1.07a.75.75 0 00.22.53l.56.56a.75.75 0 00.53.22H7v.69a.75.75 0 00.22.53l.56.56a.75.75 0 01.22.53V13a5 5 0 01-5-5zm6.24 4.83l2-2.46a.75.75 0 00.09-.8l-.58-1.16A.76.76 0 0010 8H7v-.19a.51.51 0 01.28-.45l.38-.19a.74.74 0 01.68 0L9 7.5l.38-.7a1 1 0 00.12-.48v-.85a.78.78 0 01.21-.53l1.07-1.09a5 5 0 01-1.54 9z" />
    </svg>
  );
}

function ReactionBubbles() {
  return (
    <span className="inline-flex items-center" aria-hidden="true">
      <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] -ml-0 z-10" style={{ background: '#0a66c2' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
          <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
        </svg>
      </span>
      <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] -ml-1 z-0" style={{ background: '#df704d' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </span>
    </span>
  );
}

function IconLike() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
      <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
    </svg>
  );
}

function IconComment() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function IconRepost() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 014-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export function LinkedInReactionBar() {
  return (
    <>
      <div className="text-xs flex items-center justify-between mt-3" style={{ color: '#6b7280' }}>
        <div className="flex items-center">
          <ReactionBubbles />
          <span className="ml-1">47</span>
        </div>
        <span>24 comments · 6 reposts</span>
      </div>

      <div className="flex items-center mt-2 pt-2" style={{ borderTop: '1px solid #f3f4f6' }}>
        {[
          { label: 'Like', icon: <IconLike /> },
          { label: 'Comment', icon: <IconComment /> },
          { label: 'Repost', icon: <IconRepost /> },
          { label: 'Send', icon: <IconSend /> },
        ].map(({ label, icon }) => (
          <button
            key={label}
            className="flex flex-1 items-center justify-center gap-1 py-1.5 rounded hover:bg-gray-100 transition-colors min-w-0"
            style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}
            aria-label={`${label} (preview only)`}
            tabIndex={-1}
          >
            {icon}
            <span className="truncate">{label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
