import { useState, useCallback } from 'react';

const EMOJI_CATEGORIES = [
  {
    id: 'bullets',
    label: 'Bullets & Lists',
    emojis: ['▶️', '▸', '◆', '◇', '•', '✅', '☑️', '✔️', '➡️', '🔹', '🔸', '💠', '🔘', '📌', '📍'],
  },
  {
    id: 'positive',
    label: 'Positive & Motivational',
    emojis: ['🚀', '💡', '⭐', '🌟', '✨', '🎯', '🏆', '🎉', '💪', '🙌', '👏', '🤝', '❤️', '🔥', '⚡'],
  },
  {
    id: 'business',
    label: 'Business & Work',
    emojis: ['💼', '📊', '📈', '📉', '💰', '🏢', '🤝', '📋', '🗓️', '⏰', '📧', '💻', '🖥️', '📱', '🔑'],
  },
  {
    id: 'education',
    label: 'Education & Learning',
    emojis: ['📚', '📖', '🎓', '✏️', '📝', '💭', '🧠', '🔬', '💡', '🌱', '📘', '📗', '📙', '🏫', '🎒'],
  },
  {
    id: 'people',
    label: 'People & Roles',
    emojis: ['👨‍💻', '👩‍💻', '👨‍🎓', '👩‍🎓', '👨‍💼', '👩‍💼', '🧑‍💻', '🤵', '👔', '👥', '🧑‍🤝‍🧑', '👤', '🙋', '🙋‍♂️', '🙋‍♀️'],
  },
  {
    id: 'actions',
    label: 'Actions & Emphasis',
    emojis: ['👇', '👆', '👉', '👈', '⬇️', '⬆️', '➕', '➖', '❓', '❗', '‼️', '⚠️', '🔔', '📢', '💬'],
  },
];

export default function EmojiAdderTool() {
  const [activeCategory, setActiveCategory] = useState('bullets');
  const [postText, setPostText] = useState('');
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const [copiedEmoji, setCopiedEmoji] = useState<string | null>(null);

  const insertEmoji = useCallback(
    (emoji: string) => {
      setPostText((prev) => prev + emoji);
      setRecentEmojis((prev) => {
        const filtered = prev.filter((e) => e !== emoji);
        return [emoji, ...filtered].slice(0, 10);
      });
    },
    []
  );

  const copyEmoji = useCallback(async (emoji: string) => {
    try {
      await navigator.clipboard.writeText(emoji);
    } catch {
      const el = document.createElement('textarea');
      el.value = emoji;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedEmoji(emoji);
    setTimeout(() => setCopiedEmoji(null), 1500);
  }, []);

  const copyPost = useCallback(async () => {
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
    setCopiedEmoji('__post__');
    setTimeout(() => setCopiedEmoji(null), 2000);
  }, [postText]);

  const currentEmojis = EMOJI_CATEGORIES.find((c) => c.id === activeCategory)?.emojis ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Category tabs */}
      <div>
        <p className="text-body-sm-strong text-[var(--color-ink)] mb-3">Emoji category</p>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Emoji categories">
          {EMOJI_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              role="tab"
              aria-selected={activeCategory === cat.id}
              className={`px-4 py-2 rounded-full border text-body-sm transition-all ${
                activeCategory === cat.id
                  ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
                  : 'bg-[var(--color-canvas)] text-[var(--color-body)] border-[var(--color-hairline)] hover:border-[var(--color-hairline-strong)]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recent emojis */}
      {recentEmojis.length > 0 && (
        <div>
          <p className="text-caption text-[var(--color-mute)] mb-2">Recently used</p>
          <div className="flex flex-wrap gap-2">
            {recentEmojis.map((emoji) => (
              <button
                key={`recent-${emoji}`}
                onClick={() => insertEmoji(emoji)}
                onContextMenu={(e) => { e.preventDefault(); copyEmoji(emoji); }}
                className="text-2xl p-2 rounded-[var(--radius-sm)] hover:bg-[var(--color-canvas-soft-2)] transition-colors leading-none"
                title={`Insert ${emoji} (right-click to copy)`}
                aria-label={`Insert emoji ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Emoji grid */}
      <div
        role="tabpanel"
        aria-label={EMOJI_CATEGORIES.find((c) => c.id === activeCategory)?.label}
      >
        <p className="text-caption text-[var(--color-mute)] mb-3">
          Click to insert into post · Right-click to copy emoji only
        </p>
        <div className="grid grid-cols-8 sm:grid-cols-10 gap-1 rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-4">
          {currentEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => insertEmoji(emoji)}
              onContextMenu={(e) => { e.preventDefault(); copyEmoji(emoji); }}
              className={`relative text-2xl p-2 rounded-[var(--radius-sm)] transition-all leading-none aspect-square flex items-center justify-center hover:bg-[var(--color-canvas-soft-2)] hover:scale-110 ${
                copiedEmoji === emoji ? 'bg-[var(--color-link-bg-soft)] scale-110' : ''
              }`}
              title={`Insert ${emoji}`}
              aria-label={`Insert emoji ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Post composer */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="emoji-post" className="text-body-sm-strong text-[var(--color-ink)]">
            Your post
          </label>
          {postText && (
            <button
              onClick={copyPost}
              className={`flex items-center gap-1.5 text-body-sm-strong px-3 py-1 rounded-[var(--radius-sm)] transition-all ${
                copiedEmoji === '__post__'
                  ? 'text-[var(--color-success)] bg-[var(--color-success-soft)]'
                  : 'text-[var(--color-ink)] hover:bg-[var(--color-canvas-soft-2)]'
              }`}
            >
              {copiedEmoji === '__post__' ? '✓ Copied!' : 'Copy post'}
            </button>
          )}
        </div>
        <textarea
          id="emoji-post"
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          placeholder="Emojis will be inserted here. You can also type your post directly."
          rows={6}
          className="w-full rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-[var(--color-ink)] text-body-md px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] placeholder:text-[var(--color-mute)]"
        />
        <p className="text-caption text-[var(--color-mute)] mt-1.5">{postText.length} characters</p>
      </div>
    </div>
  );
}
