import { useState, useCallback, useRef, useEffect } from 'react';

const ROLES = [
  { id: 'software-engineer', label: 'Software Engineer' },
  { id: 'product-manager', label: 'Product Manager' },
  { id: 'marketing', label: 'Marketing Pro' },
  { id: 'recruiter', label: 'Recruiter' },
  { id: 'student', label: 'Student' },
];

const ABOUT_TEMPLATES: Record<string, string> = {
  student: `I'm a [Year] student at [University], studying [Major] with a focus on [Specialization].

I'm passionate about [Topic/Field] and actively building my skills through [Coursework/Projects/Internships]. Outside the classroom, I've worked on [Personal Project or Extracurricular] which taught me [Key Skill/Lesson].

Currently, I'm looking for [Internship/Full-time/Part-time opportunities] in [Industry/Role] where I can contribute and grow.

Feel free to connect — I'm always open to conversations about [Topic] and opportunities to collaborate.`,
  'software-engineer': `I'm a software engineer with [X] years of experience building [Type of Systems/Products] that scale.

My core stack: [Languages/Frameworks]. I specialize in [Backend/Frontend/Full-stack] development and have led projects that [Impact — e.g., reduced latency by X%, served X million users].

Currently at [Company], where I'm working on [Project/Area]. Previously at [Company], where I [Key Achievement].

What drives me: [What you care about — e.g., elegant systems, DX, performance, open source].

If you're building something interesting in [Domain], I'd love to connect.`,
  'product-manager': `I build products at the intersection of [User Problem] and [Technology/Business].

Currently: [Current Role] at [Company], where I own [Product Area]. I've shipped [X features/products] that [Impact] — including [Specific Achievement].

My approach: I believe great products start with [Customer Insight/Research/Fast iteration]. I work closely with engineering, design, and data to move from insight to impact quickly.

Background: [Previous experience — e.g., engineering, design, consulting] gives me an edge in [Technical understanding/User empathy/Business strategy].

Always interested in conversations about [Product Strategy/0→1 Building/Specific Domain].`,
  recruiter: `I connect great people with great opportunities — specifically in [Industry/Function].

[X] years in talent acquisition across [Industries/Company types]. My specialty is [Engineering/Executive/Sales/Technical recruiting].

At [Company], I help build the team by hiring for [Types of roles]. I care deeply about [Candidate experience/Diversity/Speed/Quality].

What I look for: beyond skills — I look for people who [Values/Mindset you value in candidates].

If you're a [Target Candidate Profile] open to new opportunities, or a company building in [Space], let's talk.`,
  marketing: `I help [B2B/B2C] companies grow through [Content/Demand Generation/Brand/Growth] marketing.

[X] years building and executing marketing programs that drive [Revenue/Pipeline/Brand awareness] for [Industry] companies.

Currently at [Company], leading [Marketing Function]. Notable wins: [Specific Campaign/Result, e.g., "grew organic traffic 3x in 6 months", "launched a content program that generated 40% of pipeline"].

My expertise: [Channel 1], [Channel 2], [Channel 3]. Strong opinions about [SEO/Storytelling/Data-driven marketing/etc.].

Open to connecting with marketers, founders, and people who think carefully about [Your Marketing Passion Area].`,
};

async function fetchAIAbout(content: string): Promise<string> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: 'about', content }),
  });
  const data = await res.json() as { result?: string; error?: string };
  if (!res.ok || data.error) throw new Error(data.error ?? 'AI request failed');
  return (data.result ?? '').trim();
}

function SparkleIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    </svg>
  );
}

export default function AboutSectionTool() {
  const [role, setRole] = useState('software-engineer');
  const [contextInput, setContextInput] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [copied, setCopied] = useState(false);

  // Secondary template mode
  const [showTemplates, setShowTemplates] = useState(false);

  // Track whether user has manually edited the generated text
  const [hasEdited, setHasEdited] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(280, el.scrollHeight)}px`;
  }, [generatedText]);

  const charCount = generatedText.length;

  const handleGenerate = async () => {
    if (!contextInput.trim()) return;
    setAiLoading(true);
    setAiError('');
    setGeneratedText('');
    setHasEdited(false);
    try {
      const text = await fetchAIAbout(contextInput);
      setGeneratedText(text);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const loadTemplate = (roleId: string) => {
    setRole(roleId);
    setGeneratedText(ABOUT_TEMPLATES[roleId] ?? '');
    setHasEdited(false);
    setShowTemplates(false);
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedText);
    } catch {
      const el = document.createElement('textarea');
      el.value = generatedText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedText]);

  return (
    <div className="flex flex-col gap-5">
      {/* ── AI Card — primary ── */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] overflow-hidden shadow-[var(--shadow-card-md)]">
        <div className="flex items-center gap-2 px-5 py-3" style={{ background: 'linear-gradient(135deg, var(--color-ink), #333)' }}>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/15 text-white shrink-0">
            <SparkleIcon size={14} />
          </div>
          <div>
            <h3 className="text-body-sm-strong text-white leading-tight">AI About section writer</h3>
            <p className="text-caption text-white/60 leading-tight">Describe your background — get a polished About section</p>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <textarea
            value={contextInput}
            onChange={(e) => setContextInput(e.target.value)}
            placeholder="Tell the AI about yourself — your role, years of experience, key achievements, skills, what you do, and what kind of opportunities you're looking for. Be specific."
            rows={3}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-[var(--color-ink)] text-body-sm px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-hairline-strong)] placeholder:text-[var(--color-mute)] transition-shadow"
          />

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleGenerate}
              disabled={!contextInput.trim() || aiLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-full font-medium text-sm bg-[var(--color-ink)] text-white transition-opacity disabled:opacity-40"
            >
              <SparkleIcon size={12} />
              {aiLoading ? 'Writing…' : 'Generate About section'}
            </button>

            {aiError && (
              <p className="text-body-sm text-[var(--color-error)]">{aiError}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Loading skeleton ── */}
      {aiLoading && (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] p-5">
          <div className="flex flex-col gap-3" aria-busy="true">
            <div className="h-4 rounded bg-[var(--color-canvas-soft-2)] animate-pulse" style={{ width: '70%' }} />
            <div className="h-4 rounded bg-[var(--color-canvas-soft-2)] animate-pulse" style={{ width: '90%' }} />
            <div className="h-4 rounded bg-[var(--color-canvas-soft-2)] animate-pulse" style={{ width: '60%' }} />
            <div className="h-4 rounded bg-[var(--color-canvas-soft-2)] animate-pulse" style={{ width: '85%' }} />
            <div className="h-4 rounded bg-[var(--color-canvas-soft-2)] animate-pulse" style={{ width: '45%' }} />
          </div>
        </div>
      )}

      {/* ── Browse templates (secondary) ── */}
      {!aiLoading && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="w-full h-px bg-[var(--color-hairline)] flex-1" aria-hidden="true" />
            <span className="text-caption-mono text-[var(--color-mute)] uppercase tracking-wider shrink-0">Or browse by</span>
            <span className="w-full h-px bg-[var(--color-hairline)] flex-1" aria-hidden="true" />
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className={`flex items-center gap-1.5 self-start px-4 py-1.5 rounded-full border text-body-sm transition-all ${
                showTemplates
                  ? 'bg-[var(--color-canvas-soft-2)] text-[var(--color-ink)] border-[var(--color-hairline-strong)]'
                  : 'bg-[var(--color-canvas)] text-[var(--color-body)] border-[var(--color-hairline)] hover:border-[var(--color-hairline-strong)]'
              }`}
              aria-pressed={showTemplates}
            >
              Role templates
            </button>

            {showTemplates && (
              <div>
                <p className="text-caption text-[var(--color-mute)] mb-2">Select a role to load a starter template</p>
                <div className="flex flex-wrap gap-1.5">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => loadTemplate(r.id)}
                      className={`px-3 py-1.5 rounded-full border text-caption transition-all ${
                        role === r.id
                          ? 'bg-[var(--color-canvas-soft-2)] text-[var(--color-ink)] border-[var(--color-hairline-strong)]'
                          : 'bg-[var(--color-canvas)] text-[var(--color-body)] border-[var(--color-hairline)] hover:border-[var(--color-hairline-strong)]'
                      }`}
                      aria-pressed={role === r.id}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Generated About section editor ── */}
      {!aiLoading && generatedText && (
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="about-editor" className="text-body-sm-strong text-[var(--color-ink)]">
                Your About section
              </label>
              <span className={`text-caption ${charCount > 2600 ? 'text-[var(--color-error)]' : 'text-[var(--color-mute)]'}`} aria-live="polite">
                {charCount} / 2,600
              </span>
            </div>
            <textarea
              ref={textareaRef}
              id="about-editor"
              value={generatedText}
              onChange={(e) => { setGeneratedText(e.target.value); setHasEdited(true); }}
              className="w-full rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-[var(--color-ink)] text-body-sm px-4 py-3 resize-y focus:outline-none focus:ring-2 focus:ring-[var(--color-hairline-strong)] font-[var(--font-sans)] leading-relaxed transition-shadow min-h-[280px]"
              aria-label="About section editor"
            />

            <div className="mt-2">
              <div className="w-full h-1 bg-[var(--color-canvas-soft-2)] rounded-full overflow-hidden" role="progressbar" aria-valuenow={charCount} aria-valuemin={0} aria-valuemax={2600}>
                <div
                  className={`h-full rounded-full transition-all ${
                    charCount > 2600 ? 'bg-[var(--color-error)]' : charCount > 2300 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-hairline-strong)]'
                  }`}
                  style={{ width: `${Math.min(100, (charCount / 2600) * 100)}%` }}
                />
              </div>
              {charCount > 2600 && (
                <p className="text-caption text-[var(--color-error)] mt-1">
                  {charCount - 2600} characters over the 2,600 character limit.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              disabled={!generatedText}
              className="flex items-center gap-2 btn-primary"
              style={{ borderRadius: 'var(--radius-pill)' }}
              aria-label="Copy About section to clipboard"
            >
              {copied ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="4" y="4" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M3 10V3a1 1 0 011-1h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                  Copy to clipboard
                </>
              )}
            </button>
            {hasEdited && (
              <button
                onClick={handleGenerate}
                className="btn-secondary"
                style={{ borderRadius: 'var(--radius-pill)' }}
              >
                Regenerate from AI
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!aiLoading && !generatedText && (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-hairline)] p-8 text-center">
          <p className="text-body-sm text-[var(--color-mute)]">
            Describe your background above and click <span className="text-[var(--color-ink)] font-medium">Generate About section</span> — the AI will write a complete, keyword-optimised LinkedIn About section for you.
          </p>
        </div>
      )}
    </div>
  );
}
