import { useState } from 'react';
import { analyzeHeadline } from '../../lib/tools/headline-analyzer';

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
  const result = headline.trim() ? analyzeHeadline(headline) : null;

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
