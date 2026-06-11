import React, { useState } from 'react';
import {
  LI_FONT,
  PostPreviewText,
  HookAnalyzer,
  IconGlobe,
  LinkedInReactionBar,
} from './LinkedInPostMock';

type Device = 'desktop' | 'mobile';

const MAX_CHARS = 3000;

const AUTHOR_NAME = 'Sarah Mitchell';
const AUTHOR_TITLE = 'Personal Branding | Helping professionals stand out on LinkedIn';

export default function PostPreviewTool() {
  const [text, setText] = useState('');
  const [device, setDevice] = useState<Device>('desktop');
  const [previewMode, setPreviewMode] = useState<'collapsed' | 'expanded'>('collapsed');
  const [isTruncated, setIsTruncated] = useState(false);

  const charCount = text.length;
  const overLimit = charCount > MAX_CHARS;
  const progressPct = Math.min((charCount / MAX_CHARS) * 100, 100);
  const progressColor = overLimit ? 'var(--color-error)' : charCount > 2700 ? 'var(--color-warning)' : 'var(--color-ink)';

  return (
    <div className="flex flex-col gap-8">
      <div
        className="rounded-[var(--radius-md)] border border-[var(--color-hairline)] overflow-hidden grid grid-cols-1 lg:grid-cols-[1fr_520px]"
        style={{ boxShadow: 'var(--shadow-card-lg)' }}
      >
        {/* Left: Editor */}
        <div className="flex flex-col border-b lg:border-b-0 lg:border-r border-[var(--color-hairline)]">
          <div className="px-4 py-2.5 border-b border-[var(--color-hairline)] bg-[var(--color-canvas-soft)]">
            <span className="text-caption-mono text-[var(--color-mute)] uppercase tracking-wider">
              Post Content
            </span>
          </div>

          <textarea
            id="preview-text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write or paste your LinkedIn post here to preview it..."
            className="flex-1 w-full min-h-[280px] bg-[var(--color-canvas)] text-[var(--color-ink)] text-body-sm px-4 py-4 resize-none focus:outline-none placeholder:text-[var(--color-mute)] leading-relaxed"
            aria-label="LinkedIn post content"
            aria-describedby="preview-char-count"
          />

          <div
            id="preview-char-count"
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
                {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
                {overLimit && ' — over limit'}
              </span>
              <span className="text-caption text-[var(--color-mute)]">
                "…see more" after 3 lines
              </span>
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="flex flex-col bg-[var(--color-canvas-soft)]">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-hairline)] gap-2 flex-wrap">
            <span className="text-caption-mono text-[var(--color-mute)] uppercase tracking-wider">
              Post Preview
            </span>

            <div className="flex items-center gap-2">
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

          <div className="flex-1 p-3 overflow-auto" style={{ background: '#f3f2ef' }}>
            <div
              className={`mx-auto w-full transition-all duration-200 ${
                device === 'mobile' ? 'max-w-[390px]' : 'max-w-full'
              }`}
            >
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
                <div className="flex items-center">
                  <img
                    src="/avatar.png"
                    alt={AUTHOR_NAME}
                    className="h-14 w-14 rounded-full shrink-0 object-cover"
                  />
                  <div className="ml-2 min-w-0 flex-1">
                    <div className="text-sm flex items-baseline gap-1 truncate">
                      <span className="font-semibold" style={{ color: '#111827' }}>{AUTHOR_NAME}</span>
                      <span style={{ color: '#6b7280' }}>• 1st</span>
                    </div>
                    <div className="text-xs truncate" style={{ color: '#6b7280' }}>{AUTHOR_TITLE}</div>
                    <div className="text-xs flex items-center gap-0.5" style={{ color: '#6b7280' }}>
                      <span>12h •</span>
                      <IconGlobe />
                    </div>
                  </div>
                  <button
                    className="shrink-0 ml-2 font-semibold hover:underline whitespace-nowrap"
                    style={{ fontSize: '14px', color: '#0a66c2' }}
                    aria-label="Follow (preview only)"
                    tabIndex={-1}
                  >
                    + Follow
                  </button>
                </div>

                <div className="text-sm mt-2" style={{ color: '#1f2937', lineHeight: '1.5' }}>
                  {text ? (
                    <PostPreviewText
                      text={text}
                      forceExpanded={previewMode === 'expanded'}
                      onTruncationChange={setIsTruncated}
                    />
                  ) : (
                    <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                      Your post will appear here as you type…
                    </span>
                  )}
                </div>

                <LinkedInReactionBar />
              </div>

              {text && <HookAnalyzer text={text} truncated={isTruncated} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
