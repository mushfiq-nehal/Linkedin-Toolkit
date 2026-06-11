import { useState } from 'react';
import { analyzeHeadline, type HeadlineScore } from '../../lib/tools/headline-analyzer';

async function fetchAIHeadlines(content: string): Promise<string[]> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: 'headline', content }),
  });
  const data = await res.json() as { result?: string; error?: string };
  if (!res.ok || data.error) throw new Error(data.error ?? 'AI request failed');
  return (data.result ?? '')
    .split('\n')
    .map(l => l.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);
}

function SparkleIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  );
}

const SCORE_LABELS: Record<string, string> = {
  clarity: 'Clarity',
  length: 'Length',
  keywords: 'Keywords',
  specificity: 'Specificity',
};

const GRADE_COLORS: Record<string, string> = {
  A: 'text-[var(--color-success)]',
  B: 'text-[var(--color-cyan-deep)]',
  C: 'text-[var(--color-warning-deep)]',
  D: 'text-[var(--color-warning-deep)]',
  F: 'text-[var(--color-error)]',
};

const GRADE_BG: Record<string, string> = {
  A: 'bg-[var(--color-success-soft)]',
  B: 'bg-[var(--color-cyan-soft)]',
  C: 'bg-[var(--color-warning-soft)]',
  D: 'bg-[var(--color-warning-soft)]',
  F: 'bg-[var(--color-error-soft)]',
};

const BAR_COLOR = (pct: number) =>
  pct >= 80 ? 'bg-[var(--color-success)]' :
  pct >= 50 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-error)]';

const EXAMPLE_HEADLINES = [
  'Software Engineer | React & TypeScript | Building scalable web apps',
  'Product Manager at Stripe | Previously Google | 0→1 Products',
  'Marketing Director | B2B SaaS | Revenue Growth & Brand Building',
  'Senior Recruiter | Tech & Engineering | Connecting talent with opportunity',
];

export default function HeadlineAnalyzerTool() {
  const [headline, setHeadline] = useState('');
  const [result, setResult] = useState<HeadlineScore | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiDone, setAiDone] = useState(false);

  const resetResults = () => {
    setResult(null);
    setAiSuggestions([]);
    setAiDone(false);
    setAiError('');
  };

  const handleHeadlineChange = (value: string) => {
    setHeadline(value);
    if (result) resetResults();
  };

  const handleAnalyze = () => {
    if (!headline.trim()) return;
    setResult(analyzeHeadline(headline));
  };

  const handleUseHeadline = (s: string) => {
    setHeadline(s);
    setResult(analyzeHeadline(s));
    setAiSuggestions([]);
    setAiDone(false);
    setAiError('');
  };

  const handleAIRewrite = async () => {
    if (!headline.trim()) return;
    setAiLoading(true);
    setAiError('');
    setAiSuggestions([]);
    setAiDone(false);
    try {
      const suggestions = await fetchAIHeadlines(headline);
      setAiSuggestions(suggestions);
      setAiDone(true);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const hasHeadline = headline.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Input */}
      <div>
        <label htmlFor="headline-input" className="block text-body-sm-strong text-[var(--color-ink)] mb-2">
          Your LinkedIn headline
        </label>
        <input
          id="headline-input"
          type="text"
          name="headline"
          autoComplete="off"
          value={headline}
          onChange={(e) => handleHeadlineChange(e.target.value)}
          placeholder="e.g. Software Engineer | React & TypeScript | 5+ years…"
          maxLength={220}
          className="w-full rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-[var(--color-ink)] text-body-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-hairline-strong)] placeholder:text-[var(--color-mute)] transition-shadow"
          aria-describedby="headline-meta"
        />
        <p id="headline-meta" className="text-caption text-[var(--color-mute)] mt-1.5">
          {headline.length} / 220 characters
        </p>
      </div>

      {/* Examples */}
      <div>
        <p className="text-caption text-[var(--color-mute)] mb-2">Try an example:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_HEADLINES.map((ex) => (
            <button
              key={ex}
              onClick={() => handleHeadlineChange(ex)}
              className="text-caption text-[var(--color-body)] bg-[var(--color-canvas-soft)] border border-[var(--color-hairline)] rounded-full px-3 py-1 hover:border-[var(--color-hairline-strong)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] transition-colors text-left"
            >
              {ex.length > 50 ? ex.slice(0, 50) + '…' : ex}
            </button>
          ))}
        </div>
      </div>

      {/* Analyze CTA — shown when headline typed but not yet analyzed */}
      {hasHeadline && !result && (
        <button
          onClick={handleAnalyze}
          className="w-full rounded-[var(--radius-sm)] bg-[var(--color-ink)] text-[var(--color-on-primary)] text-body-md-strong px-4 py-3 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] focus-visible:ring-offset-2 transition-opacity"
        >
          Analyze headline
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">

          {/* Top-left: overall score + breakdown */}
          <div className="flex flex-col gap-4 min-w-0 lg:col-start-1 lg:row-start-1 lg:self-start">
            {/* Overall score */}
            <div className="flex items-center gap-4 rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-5 py-4">
              <div className={`flex items-center justify-center w-14 h-14 rounded-[var(--radius-md)] ${GRADE_BG[result.grade]} shrink-0`}>
                <span className={`text-[36px] font-semibold leading-none ${GRADE_COLORS[result.grade]}`}>
                  {result.grade}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-caption text-[var(--color-mute)] mb-0.5">Overall score</p>
                <p className="text-display-sm text-[var(--color-ink)] mb-2">
                  {result.total}<span className="text-caption text-[var(--color-mute)] font-normal"> / {result.max}</span>
                </p>
                <div
                  className="w-full h-2 bg-[var(--color-canvas-soft-2)] rounded-full overflow-hidden"
                  role="progressbar"
                  aria-valuenow={result.total}
                  aria-valuemin={0}
                  aria-valuemax={result.max}
                  aria-label={`Score: ${result.total} out of ${result.max}`}
                >
                  <div className={`h-full rounded-full transition-all ${BAR_COLOR(result.total)}`} style={{ width: `${result.total}%` }} />
                </div>
              </div>
            </div>

            {/* Breakdown 2×2 */}
            <div className="grid grid-cols-2 gap-3">
              {(['clarity', 'length', 'keywords', 'specificity'] as const).map((key) => {
                const score = result[key];
                const pct = (score / 25) * 100;
                return (
                  <div key={key} className="rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] px-4 py-3">
                    <p className="text-body-sm-strong text-[var(--color-ink)] mb-1">{SCORE_LABELS[key]}</p>
                    <p className="text-body-md-strong text-[var(--color-ink)] mb-2">{score}<span className="text-caption text-[var(--color-mute)] font-normal">/25</span></p>
                    <div
                      className="w-full h-2 bg-[var(--color-canvas-soft-2)] rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={score}
                      aria-valuemin={0}
                      aria-valuemax={25}
                      aria-label={`${SCORE_LABELS[key]}: ${score} out of 25`}
                    >
                      <div className={`h-full rounded-full ${BAR_COLOR(pct)}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI rewrite panel — second in mobile stack, right column spanning both rows on desktop */}
          <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-6">
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] overflow-hidden shadow-[var(--shadow-card-lg)]">
              {/* AI header */}
              <div className="flex items-center gap-2 px-5 py-3" style={{ background: 'linear-gradient(135deg, var(--color-ink), #333)' }}>
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 text-white">
                  <SparkleIcon size={14} />
                </div>
                <div>
                  <h3 className="text-body-sm-strong text-white leading-tight">AI headline rewrites</h3>
                  <p className="text-caption text-white/60 leading-tight">Optimised for impact &amp; discoverability</p>
                </div>
                {aiDone && (
                  <button
                    onClick={handleAIRewrite}
                    disabled={aiLoading}
                    aria-label="Regenerate AI suggestions"
                    className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-full font-medium text-sm bg-white text-[var(--color-ink)] hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-[#333] transition-opacity disabled:opacity-40"
                  >
                    <SparkleIcon size={12} />
                    Regenerate
                  </button>
                )}
              </div>

              {/* AI body */}
              <div className="p-5">
                {aiError && (
                  <p className="text-body-sm text-[var(--color-error)] mb-3">{aiError}</p>
                )}

                {aiLoading && (
                  <div className="flex flex-col gap-3" aria-busy="true" aria-label="Generating AI rewrites">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-10 rounded-[var(--radius-sm)] bg-[var(--color-canvas-soft-2)] motion-safe:animate-pulse" />
                    ))}
                  </div>
                )}

                {!aiLoading && aiSuggestions.length > 0 && (
                  <ol className="flex flex-col gap-3 list-none p-0 m-0">
                    {aiSuggestions.map((s, i) => (
                      <li key={i} className="flex flex-col gap-2.5 rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-canvas-soft)] px-4 py-3">
                        <div className="flex items-start gap-2">
                          <span className="text-caption-mono text-[var(--color-mute)] shrink-0 mt-0.5" aria-hidden="true">{i + 1}.</span>
                          <span className="text-body-sm text-[var(--color-ink)] flex-1">{s}</span>
                        </div>
                        <button
                          onClick={() => handleUseHeadline(s)}
                          className="w-full text-body-sm font-medium text-[var(--color-ink)] border border-[var(--color-hairline)] rounded-[var(--radius-xs)] px-3 py-1.5 hover:bg-[var(--color-canvas-soft-2)] hover:border-[var(--color-hairline-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] transition-colors"
                        >
                          Use this headline
                        </button>
                      </li>
                    ))}
                  </ol>
                )}

                {!aiLoading && !aiDone && !aiError && (
                  <div className="flex flex-col items-center gap-3 py-3">
                    <button
                      onClick={handleAIRewrite}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-sm)] bg-[var(--color-ink)] text-[var(--color-on-primary)] text-body-sm-strong hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] focus-visible:ring-offset-2 transition-opacity"
                    >
                      <SparkleIcon size={14} />
                      Generate AI rewrites
                    </button>
                    <p className="text-caption text-[var(--color-mute)] text-center">
                      3 AI-optimised versions of your headline
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom-left: strengths + recommendations + keyword suggestions */}
          <div className="flex flex-col gap-4 min-w-0 lg:col-start-1 lg:row-start-2 lg:self-start">
            {/* Strengths + Recommendations — visually differentiated */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.strengths.length > 0 && (
                <div className="rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-success-soft)] p-4">
                  <h3 className="text-body-sm-strong text-[var(--color-ink)] mb-2.5 flex items-center gap-1.5">
                    <span className="text-[var(--color-success)] text-sm" aria-hidden="true">✓</span>
                    What's working
                  </h3>
                  <ul className="flex flex-col gap-1.5 list-none p-0 m-0">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="text-body-sm text-[var(--color-body)] flex items-start gap-1.5">
                        <span className="text-[var(--color-success)] mt-0.5 shrink-0" aria-hidden="true">—</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations.length > 0 && (
                <div className="rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-warning-soft)] p-4">
                  <h3 className="text-body-sm-strong text-[var(--color-ink)] mb-2.5">Recommendations</h3>
                  <ul className="flex flex-col gap-1.5 list-none p-0 m-0">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="text-body-sm text-[var(--color-body)] flex items-start gap-1.5">
                        <span className="text-[var(--color-warning-deep)] mt-0.5 shrink-0 text-xs font-bold" aria-hidden="true">!</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Keyword suggestions */}
            <div className="rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-4">
              <h3 className="text-body-sm-strong text-[var(--color-ink)] mb-3">Keyword suggestions by role</h3>
              <div className="flex flex-col gap-3">
                {result.suggestions.slice(0, 4).map((cat) => (
                  <div key={cat.category}>
                    <p className="text-caption-mono text-[var(--color-mute)] uppercase tracking-wider mb-1.5">{cat.category}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.keywords.map((kw) => (
                        <button
                          key={kw}
                          onClick={() => handleHeadlineChange(headline ? `${headline} | ${kw}` : kw)}
                          aria-label={`Add "${kw}" to your headline`}
                          className="text-caption text-[var(--color-body)] bg-[var(--color-canvas-soft)] border border-[var(--color-hairline)] rounded-full px-2.5 py-1 hover:border-[var(--color-hairline-strong)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] transition-colors"
                        >
                          + {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Empty state */}
      {!hasHeadline && (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-hairline)] p-8 text-center">
          <p className="text-body-sm text-[var(--color-mute)]">
            Paste your headline above — get a score out of 100 with specific fixes for clarity, keywords, and length.
          </p>
        </div>
      )}
    </div>
  );
}
