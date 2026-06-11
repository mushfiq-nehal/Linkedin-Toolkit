import { useState } from 'react';
import { analyzeHeadline } from '../../lib/tools/headline-analyzer';

async function fetchAIHeadlines(content: string): Promise<string[]> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: 'headline', content }),
  });
  const data = await res.json() as { result?: string; error?: string };
  if (!res.ok || data.error) throw new Error(data.error ?? 'AI request failed');
  // Parse numbered lines: "1. ...", "2. ...", "3. ..."
  return (data.result ?? '')
    .split('\n')
    .map(l => l.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);
}

function SparkleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
  B: 'text-[var(--color-ink)]',
  C: 'text-[var(--color-warning-deep)]',
  D: 'text-[var(--color-warning-deep)]',
  F: 'text-[var(--color-error)]',
};

const GRADE_BG: Record<string, string> = {
  A: 'bg-[var(--color-link-bg-soft)]',
  B: 'bg-[var(--color-canvas-soft-2)]',
  C: 'bg-[var(--color-warning-soft)]',
  D: 'bg-[var(--color-warning-soft)]',
  F: 'bg-[var(--color-error-soft)]',
};

const EXAMPLE_HEADLINES = [
  'Software Engineer | React & TypeScript | Building scalable web apps',
  'Product Manager at Stripe | Previously Google | 0→1 Products',
  'Marketing Director | B2B SaaS | Revenue Growth & Brand Building',
  'Senior Recruiter | Tech & Engineering | Connecting talent with opportunity',
];

export default function HeadlineAnalyzerTool() {
  const [headline, setHeadline] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiDone, setAiDone] = useState(false);
  const result = headline.trim() ? analyzeHeadline(headline) : null;

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
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="e.g. Software Engineer | React & TypeScript | 5+ years"
          maxLength={220}
          className="w-full rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-[var(--color-ink)] text-body-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] placeholder:text-[var(--color-mute)] transition-shadow"
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
              onClick={() => setHeadline(ex)}
              className="text-caption text-[var(--color-body)] bg-[var(--color-canvas-soft)] border border-[var(--color-hairline)] rounded-full px-3 py-1 hover:border-[var(--color-hairline-strong)] hover:text-[var(--color-ink)] transition-colors text-left"
            >
              {ex.length > 50 ? ex.slice(0, 50) + '…' : ex}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="flex flex-col gap-5">
          {/* Overall score */}
          <div className="flex items-center gap-6 rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-6">
            <div className={`flex items-center justify-center w-20 h-20 rounded-[var(--radius-lg)] ${GRADE_BG[result.grade]} shrink-0`}>
              <span className={`text-[48px] font-semibold leading-none ${GRADE_COLORS[result.grade]}`}>
                {result.grade}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-body-sm text-[var(--color-mute)] mb-1">Overall score</p>
              <p className="text-display-md text-[var(--color-ink)]">
                {result.total} <span className="text-body-sm text-[var(--color-mute)] font-normal">/ {result.max}</span>
              </p>
              <div
                className="w-full h-2 bg-[var(--color-canvas-soft-2)] rounded-full mt-3 overflow-hidden"
                role="progressbar"
                aria-valuenow={result.total}
                aria-valuemin={0}
                aria-valuemax={result.max}
              >
                <div
                  className={`h-full rounded-full transition-all ${
                    result.total >= 85 ? 'bg-[var(--color-success)]' :
                    result.total >= 55 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-error)]'
                  }`}
                  style={{ width: `${result.total}%` }}
                />
              </div>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['clarity', 'length', 'keywords', 'specificity'] as const).map((key) => {
              const score = result[key];
              const pct = (score / 25) * 100;
              return (
                <div
                  key={key}
                  className="rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-4"
                >
                  <p className="text-caption text-[var(--color-mute)] mb-2">{SCORE_LABELS[key]}</p>
                  <p className="text-display-sm text-[var(--color-ink)] mb-3">
                    {score}<span className="text-caption text-[var(--color-mute)] font-normal">/25</span>
                  </p>
                  <div className="w-full h-1 bg-[var(--color-canvas-soft-2)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pct >= 80 ? 'bg-[var(--color-success)]' : pct >= 50 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-error)]'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Strengths */}
          {result.strengths.length > 0 && (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-5">
              <h3 className="text-body-sm-strong text-[var(--color-ink)] mb-3 flex items-center gap-2">
                <span className="text-[var(--color-success)]" aria-hidden="true">✓</span>
                What's working
              </h3>
              <ul className="flex flex-col gap-2 list-none p-0 m-0">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-body-sm text-[var(--color-body)] flex items-start gap-2">
                    <span className="text-[var(--color-success)] mt-0.5 shrink-0" aria-hidden="true">—</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-5">
              <h3 className="text-body-sm-strong text-[var(--color-ink)] mb-3">Recommendations</h3>
              <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="text-body-sm text-[var(--color-body)] flex items-start gap-2">
                    <span className="text-[var(--color-warning)] mt-0.5 shrink-0 text-xs font-bold" aria-hidden="true">!</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI rewrite */}
          <div className="rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-body-sm-strong text-[var(--color-ink)] flex items-center gap-1.5">
                <SparkleIcon />
                AI headline rewrites
              </h3>
              <button
                onClick={handleAIRewrite}
                disabled={aiLoading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-[var(--radius-sm)] bg-[var(--color-ink)] text-white text-body-sm-strong transition-opacity disabled:opacity-40"
              >
                <SparkleIcon />
                {aiLoading ? 'Writing…' : aiDone ? 'Regenerate' : 'Generate'}
              </button>
            </div>

            {aiError && (
              <p className="text-body-sm text-[var(--color-error)] mb-3">{aiError}</p>
            )}

            {aiLoading && (
              <div className="flex flex-col gap-3" aria-busy="true">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 rounded-[var(--radius-sm)] bg-[var(--color-canvas-soft-2)] animate-pulse" />
                ))}
              </div>
            )}

            {!aiLoading && aiSuggestions.length > 0 && (
              <ol className="flex flex-col gap-3 list-none p-0 m-0">
                {aiSuggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-canvas-soft)] px-4 py-3">
                    <span className="text-caption-mono text-[var(--color-mute)] shrink-0 mt-0.5">{i + 1}.</span>
                    <span className="text-body-sm text-[var(--color-ink)] flex-1">{s}</span>
                    <button
                      onClick={() => setHeadline(s)}
                      className="shrink-0 text-caption text-[var(--color-body)] hover:text-[var(--color-ink)] border border-[var(--color-hairline)] rounded-[var(--radius-xs)] px-2 py-0.5 transition-colors whitespace-nowrap"
                      title="Use this headline"
                    >
                      Use this
                    </button>
                  </li>
                ))}
              </ol>
            )}

            {!aiLoading && !aiDone && !aiError && (
              <p className="text-body-sm text-[var(--color-mute)]">
                Click "Generate" to get 3 AI-written versions of your headline — optimised for keywords and impact.
              </p>
            )}
          </div>

          {/* Keyword suggestions */}
          <div className="rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-5">
            <h3 className="text-body-sm-strong text-[var(--color-ink)] mb-4">Keyword suggestions by role</h3>
            <div className="flex flex-col gap-4">
              {result.suggestions.slice(0, 4).map((cat) => (
                <div key={cat.category}>
                  <p className="text-caption-mono text-[var(--color-mute)] uppercase tracking-wider mb-2">{cat.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {cat.keywords.map((kw) => (
                      <button
                        key={kw}
                        onClick={() => setHeadline((prev) => prev ? `${prev} | ${kw}` : kw)}
                        className="text-caption text-[var(--color-body)] bg-[var(--color-canvas-soft)] border border-[var(--color-hairline)] rounded-full px-3 py-1 hover:border-[var(--color-hairline-strong)] hover:text-[var(--color-ink)] transition-colors"
                        title={`Add "${kw}" to your headline`}
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
      )}

      {!headline.trim() && (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-hairline)] p-8 text-center">
          <p className="text-body-sm text-[var(--color-mute)]">
            Enter your LinkedIn headline above to get your score.
          </p>
        </div>
      )}
    </div>
  );
}
