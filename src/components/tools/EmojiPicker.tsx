import { useState, useRef, useEffect, useMemo } from 'react';
import { EMOJI_CATEGORIES, type EmojiCategory } from '../../lib/tools/emoji-data';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  recentEmojis?: string[];
  /** compact = inline panel inside TextFormatter toolbar area */
  compact?: boolean;
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function EmojiPicker({ onSelect, recentEmojis = [], compact = false }: EmojiPickerProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(
    recentEmojis.length > 0 ? 'recent' : 'smileys'
  );
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Build category list including recent if non-empty
  const categories: EmojiCategory[] = useMemo(() => {
    const base = EMOJI_CATEGORIES;
    if (recentEmojis.length === 0) return base;
    return [
      { id: 'recent', label: 'Recently Used', icon: '🕐', emojis: recentEmojis },
      ...base,
    ];
  }, [recentEmojis]);

  // Search across all categories
  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.trim().toLowerCase();
    const all = EMOJI_CATEGORIES.flatMap(c => c.emojis);
    // Simple: return emojis that "match" — since we don't have names, filter by Unicode code point or just show all
    // For basic matching, try to find emojis by their visible text
    return all.filter(e => e.toLowerCase().includes(q) || matchEmojiName(e, q));
  }, [search]);

  // Reset category when recent emojis appear/disappear
  useEffect(() => {
    if (recentEmojis.length > 0 && activeCategory !== 'recent' && !search) {
      // don't auto-switch, user might be browsing
    }
    if (recentEmojis.length === 0 && activeCategory === 'recent') {
      setActiveCategory('smileys');
    }
  }, [recentEmojis.length, activeCategory, search]);

  const currentEmojis = useMemo(() => {
    if (searchResults !== null) return searchResults;
    return categories.find(c => c.id === activeCategory)?.emojis ?? EMOJI_CATEGORIES[0].emojis;
  }, [searchResults, categories, activeCategory]);

  const currentCategoryLabel = useMemo(() => {
    if (searchResults !== null) return `Results for "${search}"`;
    return categories.find(c => c.id === activeCategory)?.label ?? '';
  }, [searchResults, search, categories, activeCategory]);

  function handleEmojiClick(emoji: string) {
    onSelect(emoji);
  }

  const gridCols = compact ? 'grid-cols-8 sm:grid-cols-9' : 'grid-cols-8 sm:grid-cols-10';
  const emojiSize = compact ? 'text-xl' : 'text-2xl';
  const emojiPad = compact ? 'p-1.5' : 'p-2';

  return (
    <div className="flex flex-col" style={{ minWidth: 0 }}>
      {/* Search bar */}
      <div className="px-3 pt-2.5 pb-2">
        <div className="relative flex items-center">
          <span className="absolute left-2.5 text-[var(--color-mute)] pointer-events-none">
            <SearchIcon />
          </span>
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search emoji…"
            className="w-full pl-8 pr-7 py-1.5 text-caption bg-[var(--color-canvas-soft-2)] border border-[var(--color-hairline)] rounded-[var(--radius-sm)] text-[var(--color-ink)] placeholder:text-[var(--color-mute)] focus:outline-none focus:border-[var(--color-hairline-strong)] transition-colors"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); searchRef.current?.focus(); }}
              className="absolute right-2 text-[var(--color-mute)] hover:text-[var(--color-ink)] transition-colors"
              aria-label="Clear search"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>

      {/* Category tabs — icon buttons like WhatsApp */}
      {!search && (
        <div
          className="flex items-center gap-0.5 px-2 pb-1 overflow-x-auto scrollbar-none border-b border-[var(--color-hairline)]"
          role="tablist"
          aria-label="Emoji categories"
        >
          {categories.map(cat => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeCategory === cat.id}
              aria-label={cat.label}
              title={cat.label}
              onClick={() => {
                setActiveCategory(cat.id);
                gridRef.current?.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-[var(--radius-xs)] text-base leading-none transition-all ${
                activeCategory === cat.id
                  ? 'bg-[var(--color-canvas-soft-2)]'
                  : 'hover:bg-[var(--color-canvas-soft-2)] opacity-60 hover:opacity-100'
              }`}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Category label + emoji count */}
      <div className="px-3 pt-2 pb-1 flex items-center justify-between">
        <span className="text-caption text-[var(--color-mute)] font-medium uppercase tracking-wide" style={{ fontSize: '10px' }}>
          {currentCategoryLabel}
        </span>
        {searchResults !== null && (
          <span className="text-caption text-[var(--color-mute)]" style={{ fontSize: '10px' }}>
            {searchResults.length} found
          </span>
        )}
      </div>

      {/* Emoji grid */}
      <div
        ref={gridRef}
        role="tabpanel"
        aria-label={currentCategoryLabel}
        className={`grid ${gridCols} gap-0.5 px-2 pb-2 overflow-y-auto`}
        style={{ maxHeight: compact ? '180px' : '240px' }}
      >
        {currentEmojis.length === 0 ? (
          <div className="col-span-full py-6 text-center text-caption text-[var(--color-mute)]">
            No emojis found
          </div>
        ) : (
          currentEmojis.map((emoji, i) => (
            <button
              key={`${emoji}-${i}`}
              onClick={() => handleEmojiClick(emoji)}
              onMouseEnter={() => setHoveredEmoji(emoji)}
              onMouseLeave={() => setHoveredEmoji(null)}
              title={emoji}
              aria-label={`Insert ${emoji}`}
              className={`${emojiSize} ${emojiPad} rounded-[var(--radius-xs)] leading-none aspect-square flex items-center justify-center transition-all hover:bg-[var(--color-canvas-soft-2)] hover:scale-110 active:scale-95 ${
                hoveredEmoji === emoji ? 'bg-[var(--color-canvas-soft-2)] scale-110' : ''
              }`}
            >
              {emoji}
            </button>
          ))
        )}
      </div>

      {/* Hovered emoji preview bar */}
      <div
        className="border-t border-[var(--color-hairline)] px-3 py-1.5 flex items-center gap-2 min-h-[30px]"
        aria-live="polite"
        aria-atomic="true"
      >
        {hoveredEmoji ? (
          <>
            <span className="text-xl leading-none">{hoveredEmoji}</span>
            <span className="text-caption text-[var(--color-mute)] truncate">
              Click to insert
            </span>
          </>
        ) : (
          <span className="text-caption text-[var(--color-mute)]">
            Hover an emoji to preview
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Very basic emoji name matcher for search — maps some common emoji to keywords.
 * Covers the most searched-for emoji by keyword so search feels useful.
 */
function matchEmojiName(emoji: string, query: string): boolean {
  const keywords: Record<string, string[]> = {
    '😀': ['happy','smile','grin','face'],
    '😃': ['happy','smile','grin','big','face'],
    '😄': ['happy','smile','laugh','face'],
    '😁': ['grin','teeth','smile'],
    '😆': ['laugh','haha','funny'],
    '😅': ['sweat','nervous','relief'],
    '🤣': ['rofl','laugh','funny','lol'],
    '😂': ['joy','tears','laugh','lol','funny'],
    '🙂': ['smile','slight'],
    '🙃': ['upside','sarcasm','irony'],
    '😉': ['wink','joke'],
    '😊': ['blush','happy','smile'],
    '😇': ['angel','halo','innocent'],
    '🥰': ['love','hearts','crush','adore'],
    '😍': ['heart eyes','love','crush'],
    '🤩': ['star struck','excited','celebrity'],
    '😘': ['kiss','love','heart'],
    '😗': ['kiss'],
    '😋': ['yummy','tongue','food'],
    '😛': ['tongue','tease'],
    '😜': ['wink','tongue','joke'],
    '🤪': ['crazy','wild','zany'],
    '😝': ['tongue','disgust','tease'],
    '🤑': ['money','rich','dollar'],
    '🤗': ['hug','happy','warm'],
    '🤭': ['oops','secret','giggle'],
    '🤫': ['shush','quiet','secret'],
    '🤔': ['thinking','hmm','idea'],
    '🤐': ['zip','quiet','sealed'],
    '🤨': ['raised eyebrow','suspicious'],
    '😐': ['neutral','meh','blank'],
    '😑': ['expressionless','blank'],
    '😶': ['no mouth','silent'],
    '😏': ['smirk','confident'],
    '😒': ['unamused','meh'],
    '🙄': ['eye roll','whatever'],
    '😬': ['grimace','awkward'],
    '🤥': ['lying','pinocchio'],
    '😌': ['relieved','peaceful'],
    '😔': ['pensive','sad','thoughtful'],
    '😪': ['sleepy','tired'],
    '🤤': ['drool','hungry','yummy'],
    '😴': ['sleep','zzz','tired'],
    '😷': ['mask','sick','covid'],
    '🤒': ['sick','thermometer','ill'],
    '🤕': ['hurt','bandage','injured'],
    '🤢': ['nausea','sick','green'],
    '🤮': ['vomit','sick','disgusting'],
    '🤧': ['sneeze','cold','sick'],
    '🥵': ['hot','heat','fire'],
    '🥶': ['cold','freeze','ice'],
    '🥴': ['dizzy','drunk','confused'],
    '😵': ['dizzy','shocked'],
    '🤯': ['explode','mind blown','shocked'],
    '🤠': ['cowboy','yeehaw'],
    '🥳': ['party','celebrate','birthday'],
    '🥸': ['disguise','glasses'],
    '😎': ['cool','sunglasses'],
    '🤓': ['nerd','glasses'],
    '🧐': ['monocle','curious','rich'],
    '😕': ['confused','unsure'],
    '😟': ['worried','concerned'],
    '🙁': ['frown','sad'],
    '☹️': ['frown','sad'],
    '😮': ['surprised','open mouth'],
    '😯': ['hushed','surprised'],
    '😲': ['astonished','shocked'],
    '😳': ['flushed','embarrassed'],
    '🥺': ['pleading','puppy eyes','cute'],
    '😦': ['frowning','surprised'],
    '😧': ['anguished','pain'],
    '😨': ['fearful','scared'],
    '😰': ['anxious','sweat','worried'],
    '😥': ['disappointed','relieved'],
    '😢': ['cry','sad','tear'],
    '😭': ['cry','sob','sad','weep'],
    '😱': ['scream','shock','horror'],
    '😖': ['confounded','frustrated'],
    '😣': ['persevere','struggle'],
    '😞': ['disappointed','sad'],
    '😓': ['downcast','hard work'],
    '😩': ['weary','tired'],
    '😫': ['tired','exhausted'],
    '🥱': ['yawn','bored','tired'],
    '😤': ['triumph','huff','angry'],
    '😡': ['angry','mad','red'],
    '😠': ['angry','mad'],
    '🤬': ['cursing','swear','angry'],
    '😈': ['devil','evil','smile'],
    '👿': ['devil','angry','evil'],
    '💀': ['skull','death','dead'],
    '☠️': ['skull','crossbones','danger','pirate'],
    '💩': ['poop','poo','shit'],
    '🤡': ['clown','joker'],
    '👹': ['ogre','monster'],
    '👺': ['goblin','monster'],
    '👻': ['ghost','boo','halloween'],
    '👽': ['alien','ufo'],
    '👾': ['alien','space','game'],
    '🤖': ['robot','bot','machine'],
    '❤️': ['heart','love','red'],
    '🧡': ['heart','orange','love'],
    '💛': ['heart','yellow','love'],
    '💚': ['heart','green','love'],
    '💙': ['heart','blue','love'],
    '💜': ['heart','purple','love'],
    '🖤': ['heart','black','love'],
    '🤍': ['heart','white','love'],
    '🤎': ['heart','brown','love'],
    '💔': ['broken heart','heartbreak'],
    '💯': ['100','perfect','score'],
    '💥': ['boom','explosion'],
    '💫': ['dizzy','star','sparkle'],
    '💦': ['water','sweat','splash'],
    '💨': ['wind','air','fast'],
    '💬': ['speech','chat','bubble'],
    '💭': ['thought','thinking','bubble'],
    '🔥': ['fire','hot','flame','lit'],
    '⭐': ['star'],
    '🌟': ['star','glow','shine'],
    '✨': ['sparkle','shine','stars'],
    '🎉': ['party','celebrate','confetti'],
    '🎊': ['celebrate','confetti'],
    '🎁': ['gift','present','birthday'],
    '🎈': ['balloon','party'],
    '🎯': ['target','bullseye','goal'],
    '🏆': ['trophy','winner','award'],
    '🥇': ['gold','first','winner'],
    '🥈': ['silver','second'],
    '🥉': ['bronze','third'],
    '🚀': ['rocket','launch','space','fast'],
    '💡': ['idea','light','bulb'],
    '🔔': ['bell','notification','alert'],
    '📢': ['announce','speaker','loud'],
    '📣': ['cheer','megaphone'],
    '⚡': ['lightning','electric','fast','power'],
    '💪': ['strong','muscle','flex','strength'],
    '🙌': ['celebrate','praise','hands'],
    '👏': ['clap','applause','bravo'],
    '👍': ['thumbs up','like','good','yes'],
    '👎': ['thumbs down','dislike','bad','no'],
    '✌️': ['peace','victory','two'],
    '🤝': ['handshake','deal','agreement'],
    '🙏': ['pray','thanks','please','namaste'],
    '💼': ['briefcase','work','business'],
    '📊': ['chart','graph','data','stats'],
    '📈': ['chart','up','growth','increase'],
    '📉': ['chart','down','decrease','drop'],
    '💰': ['money','cash','wealth','rich'],
    '🏢': ['office','building','company'],
    '📱': ['phone','mobile','smartphone'],
    '💻': ['laptop','computer','tech'],
    '🖥️': ['desktop','monitor','computer'],
    '📧': ['email','mail','letter'],
    '⏰': ['alarm','clock','time'],
    '📅': ['calendar','date','schedule'],
    '🔑': ['key','unlock','access'],
    '🧠': ['brain','mind','smart','think'],
    '📚': ['books','study','read','learn'],
    '📖': ['book','read','open'],
    '🎓': ['graduation','graduate','degree','education'],
    '✏️': ['pencil','write','edit'],
    '📝': ['memo','note','write'],
    '🌱': ['plant','grow','seedling','nature'],
    '🌍': ['earth','world','globe','planet'],
    '🌎': ['earth','world','globe','americas'],
    '🌏': ['earth','world','globe','asia'],
    '🐶': ['dog','puppy','pet'],
    '🐱': ['cat','kitten','pet'],
    '🐔': ['chicken','hen','bird'],
    '🐸': ['frog','green'],
    '🦋': ['butterfly','spring'],
    '🌹': ['rose','flower','love'],
    '🌺': ['flower','hibiscus','tropical'],
    '🌻': ['sunflower','yellow','happy'],
    '🍎': ['apple','red','fruit'],
    '🍕': ['pizza','food','italian'],
    '🍔': ['burger','hamburger','food'],
    '🍟': ['fries','french fries','fast food'],
    '🍣': ['sushi','japanese','fish'],
    '🍰': ['cake','birthday','dessert'],
    '🎂': ['birthday cake','celebrate'],
    '☕': ['coffee','hot','drink'],
    '🍵': ['tea','hot','drink'],
    '🍺': ['beer','drink','cheers'],
    '🍷': ['wine','red','drink'],
    '🥂': ['champagne','celebrate','toast'],
    '✅': ['check','done','correct','yes'],
    '❌': ['cross','no','wrong','cancel'],
    '❓': ['question','ask','help'],
    '❗': ['exclamation','important','alert'],
    '‼️': ['double exclamation','important'],
    '⚠️': ['warning','caution','danger'],
    '🚫': ['no','forbidden','banned'],
    '♻️': ['recycle','green','environment'],
    '➡️': ['arrow','right','next'],
    '⬅️': ['arrow','left','back'],
    '⬆️': ['arrow','up'],
    '⬇️': ['arrow','down'],
    '🔍': ['search','magnify','find'],
    '🔎': ['search','zoom','find'],
    '📌': ['pin','location','mark'],
    '📍': ['pin','location','place'],
    '🗓️': ['calendar','schedule','date'],
    '⏳': ['hourglass','time','wait'],
    '⌚': ['watch','time','clock'],
    '🌈': ['rainbow','colorful','hope'],
    '☀️': ['sun','sunny','warm','day'],
    '🌙': ['moon','night','sleep'],
    '⛅': ['cloud','partly','weather'],
    '🌧️': ['rain','weather','shower'],
    '❄️': ['snow','cold','winter','ice'],
  };
  const words = keywords[emoji] ?? [];
  return words.some(w => w.includes(query));
}
