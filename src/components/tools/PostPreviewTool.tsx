import { useState } from 'react';

type Device = 'desktop' | 'mobile';

const TRUNCATE_DESKTOP = 210;
const TRUNCATE_MOBILE = 140;

function TruncatedText({ text, limit }: { text: string; limit: number }) {
  const [expanded, setExpanded] = useState(false);
  const shouldTruncate = text.length > limit && !expanded;
  const displayed = shouldTruncate ? text.slice(0, limit) : text;

  return (
    <span>
      <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{displayed}</span>
      {shouldTruncate && (
        <>
          <span>…</span>
          <button
            onClick={() => setExpanded(true)}
            className="text-[#0077B5] font-semibold ml-0.5 text-sm hover:underline"
          >
            see more
          </button>
        </>
      )}
    </span>
  );
}

export default function PostPreviewTool() {
  const [text, setText] = useState('');
  const [device, setDevice] = useState<Device>('desktop');
  const [authorName, setAuthorName] = useState('Your Name');
  const [authorTitle, setAuthorTitle] = useState('Your LinkedIn Headline');

  const truncateLimit = device === 'mobile' ? TRUNCATE_MOBILE : TRUNCATE_DESKTOP;
  const charCount = text.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Author customization */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="preview-name" className="block text-body-sm-strong text-[var(--color-ink)] mb-2">
            Display name
          </label>
          <input
            id="preview-name"
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your Name"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-[var(--color-ink)] text-body-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] placeholder:text-[var(--color-mute)]"
          />
        </div>
        <div>
          <label htmlFor="preview-title" className="block text-body-sm-strong text-[var(--color-ink)] mb-2">
            Headline
          </label>
          <input
            id="preview-title"
            type="text"
            value={authorTitle}
            onChange={(e) => setAuthorTitle(e.target.value)}
            placeholder="Your LinkedIn Headline"
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-[var(--color-ink)] text-body-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] placeholder:text-[var(--color-mute)]"
          />
        </div>
      </div>

      {/* Post text input */}
      <div>
        <label htmlFor="preview-text" className="block text-body-sm-strong text-[var(--color-ink)] mb-2">
          Post content
        </label>
        <textarea
          id="preview-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your LinkedIn post here..."
          rows={6}
          className="w-full rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-[var(--color-ink)] text-body-sm px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] placeholder:text-[var(--color-mute)]"
        />
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-caption text-[var(--color-mute)]">{charCount} / 3000 characters</p>
          {charCount > 3000 && (
            <p className="text-caption text-[var(--color-error)]">Over LinkedIn's 3,000 character limit</p>
          )}
        </div>
      </div>

      {/* Device toggle */}
      <div className="flex items-center gap-2">
        <span className="text-body-sm-strong text-[var(--color-ink)] mr-2">Preview on:</span>
        {(['desktop', 'mobile'] as Device[]).map((d) => (
          <button
            key={d}
            onClick={() => setDevice(d)}
            className={`flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] border text-body-sm capitalize transition-all ${
              device === d
                ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
                : 'bg-[var(--color-canvas)] text-[var(--color-body)] border-[var(--color-hairline)] hover:border-[var(--color-hairline-strong)]'
            }`}
            aria-pressed={device === d}
          >
            {d === 'desktop' ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="1" y="2" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M5 12h4M7 10v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <rect x="3" y="1" width="8" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
                <circle cx="7" cy="11" r="0.75" fill="currentColor"/>
              </svg>
            )}
            {d}
          </button>
        ))}
      </div>

      {/* LinkedIn post mock */}
      <div className={`mx-auto w-full ${device === 'mobile' ? 'max-w-[375px]' : 'max-w-[552px]'}`}>
        <div
          className="rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] overflow-hidden"
          style={{ boxShadow: 'var(--shadow-card-lg)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
          role="region"
          aria-label={`LinkedIn post preview — ${device}`}
        >
          {/* Post header */}
          <div className="flex items-start gap-3 p-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0077B5] to-[#00A0DC] flex items-center justify-center text-white font-semibold text-lg shrink-0 select-none" aria-hidden="true">
              {(authorName || 'Y')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[14px] text-[#191919] leading-tight">{authorName || 'Your Name'}</p>
              <p className="text-[12px] text-[#666666] leading-snug mt-0.5 line-clamp-2">
                {authorTitle || 'Your LinkedIn Headline'}
              </p>
              <p className="text-[12px] text-[#888888] mt-0.5">1m • 🌐</p>
            </div>
            <button className="text-[#0077B5] text-[13px] font-semibold shrink-0 hover:text-[#005582]" aria-label="Follow author (preview only)">
              + Follow
            </button>
          </div>

          {/* Post body */}
          <div className="px-4 pb-3">
            {text ? (
              <p className="text-[14px] text-[#191919] leading-relaxed">
                <TruncatedText text={text} limit={truncateLimit} />
              </p>
            ) : (
              <p className="text-[14px] text-[#888888] italic">Your post will appear here...</p>
            )}
          </div>

          {/* Engagement bar */}
          <div className="px-4 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-xs" aria-hidden="true">👍❤️💡</span>
              <span className="text-[12px] text-[#888888]">42 reactions</span>
            </div>
            <span className="text-[12px] text-[#888888]">8 comments</span>
          </div>

          {/* Action bar */}
          <div className="border-t border-gray-200 px-2 py-1 flex items-center justify-around">
            {['Like', 'Comment', 'Repost', 'Send'].map((action) => (
              <button
                key={action}
                className="flex items-center gap-1.5 px-3 py-2 rounded text-[12px] font-semibold text-[#666666] hover:bg-gray-100 transition-colors"
                aria-label={`${action} (preview only)`}
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Helper text */}
        <p className="text-caption text-[var(--color-mute)] text-center mt-3">
          "See more" appears after {truncateLimit} characters on {device}
        </p>
      </div>
    </div>
  );
}
