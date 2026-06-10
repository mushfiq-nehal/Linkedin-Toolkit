import { useState, useCallback } from 'react';

interface AboutTemplate {
  id: string;
  role: string;
  template: string;
}

const ABOUT_TEMPLATES: AboutTemplate[] = [
  {
    id: 'student',
    role: 'Student',
    template: `I'm a [Year] student at [University], studying [Major] with a focus on [Specialization].

I'm passionate about [Topic/Field] and actively building my skills through [Coursework/Projects/Internships]. Outside the classroom, I've worked on [Personal Project or Extracurricular] which taught me [Key Skill/Lesson].

Currently, I'm looking for [Internship/Full-time/Part-time opportunities] in [Industry/Role] where I can contribute and grow.

Feel free to connect — I'm always open to conversations about [Topic] and opportunities to collaborate.`,
  },
  {
    id: 'software-engineer',
    role: 'Software Engineer',
    template: `I'm a software engineer with [X] years of experience building [Type of Systems/Products] that scale.

My core stack: [Languages/Frameworks]. I specialize in [Backend/Frontend/Full-stack] development and have led projects that [Impact — e.g., reduced latency by X%, served X million users].

Currently at [Company], where I'm working on [Project/Area]. Previously at [Company], where I [Key Achievement].

What drives me: [What you care about — e.g., elegant systems, DX, performance, open source].

If you're building something interesting in [Domain], I'd love to connect.`,
  },
  {
    id: 'product-manager',
    role: 'Product Manager',
    template: `I build products at the intersection of [User Problem] and [Technology/Business].

Currently: [Current Role] at [Company], where I own [Product Area]. I've shipped [X features/products] that [Impact] — including [Specific Achievement].

My approach: I believe great products start with [Customer Insight/Research/Fast iteration]. I work closely with engineering, design, and data to move from insight to impact quickly.

Background: [Previous experience — e.g., engineering, design, consulting] gives me an edge in [Technical understanding/User empathy/Business strategy].

Always interested in conversations about [Product Strategy/0→1 Building/Specific Domain].`,
  },
  {
    id: 'recruiter',
    role: 'Recruiter',
    template: `I connect great people with great opportunities — specifically in [Industry/Function].

[X] years in talent acquisition across [Industries/Company types]. My specialty is [Engineering/Executive/Sales/Technical recruiting].

At [Company], I help build the team by hiring for [Types of roles]. I care deeply about [Candidate experience/Diversity/Speed/Quality].

What I look for: beyond skills — I look for people who [Values/Mindset you value in candidates].

If you're a [Target Candidate Profile] open to new opportunities, or a company building in [Space], let's talk.`,
  },
  {
    id: 'marketing',
    role: 'Marketing Professional',
    template: `I help [B2B/B2C] companies grow through [Content/Demand Generation/Brand/Growth] marketing.

[X] years building and executing marketing programs that drive [Revenue/Pipeline/Brand awareness] for [Industry] companies.

Currently at [Company], leading [Marketing Function]. Notable wins: [Specific Campaign/Result, e.g., "grew organic traffic 3x in 6 months", "launched a content program that generated 40% of pipeline"].

My expertise: [Channel 1], [Channel 2], [Channel 3]. Strong opinions about [SEO/Storytelling/Data-driven marketing/etc.].

Open to connecting with marketers, founders, and people who think carefully about [Your Marketing Passion Area].`,
  },
];

export default function AboutSectionTool() {
  const [activeRole, setActiveRole] = useState('software-engineer');
  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);

  const template = ABOUT_TEMPLATES.find((t) => t.id === activeRole);
  const displayText = customText || template?.template || '';
  const charCount = displayText.length;

  const selectRole = (id: string) => {
    setActiveRole(id);
    setCustomText('');
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(displayText);
    } catch {
      const el = document.createElement('textarea');
      el.value = displayText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [displayText]);

  return (
    <div className="flex flex-col gap-6">
      {/* Role selector */}
      <div>
        <p className="text-body-sm-strong text-[var(--color-ink)] mb-3">Select your role</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Select role template">
          {ABOUT_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => selectRole(t.id)}
              className={`px-4 py-2 rounded-full border text-body-sm transition-all ${
                activeRole === t.id
                  ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
                  : 'bg-[var(--color-canvas)] text-[var(--color-body)] border-[var(--color-hairline)] hover:border-[var(--color-hairline-strong)]'
              }`}
              aria-pressed={activeRole === t.id}
            >
              {t.role}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-[var(--radius-sm)] bg-[var(--color-canvas-soft)] border border-[var(--color-hairline)] px-4 py-3">
        <p className="text-body-sm text-[var(--color-body)]">
          <strong className="text-[var(--color-ink)] font-medium">How to use:</strong> Edit the template below.
          Replace <code className="text-code bg-[var(--color-canvas-soft-2)] px-1 rounded text-xs">[bracketed text]</code> with your specific details.
          Write in first person. Be specific — specific numbers and achievements outperform generic claims.
        </p>
      </div>

      {/* Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="about-editor" className="text-body-sm-strong text-[var(--color-ink)]">
            Your About section
          </label>
          <span
            className={`text-caption ${charCount > 2600 ? 'text-[var(--color-error)]' : 'text-[var(--color-mute)]'}`}
            aria-live="polite"
          >
            {charCount} / 2,600
          </span>
        </div>
        <textarea
          id="about-editor"
          value={displayText}
          onChange={(e) => setCustomText(e.target.value)}
          rows={14}
          className="w-full rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-[var(--color-ink)] text-body-sm px-4 py-3 resize-y focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] font-[var(--font-sans)] leading-relaxed"
          placeholder="Select a role template above..."
          aria-label="About section editor"
        />

        {/* Character progress bar */}
        <div className="mt-2">
          <div
            className="w-full h-1 bg-[var(--color-canvas-soft-2)] rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={charCount}
            aria-valuemin={0}
            aria-valuemax={2600}
          >
            <div
              className={`h-full rounded-full transition-all ${
                charCount > 2600 ? 'bg-[var(--color-error)]' :
                charCount > 2300 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-ink)]'
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

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleCopy}
          disabled={!displayText}
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
        <button
          onClick={() => setCustomText('')}
          className="btn-secondary"
          style={{ borderRadius: 'var(--radius-pill)' }}
          aria-label="Reset to template"
        >
          Reset template
        </button>
      </div>
    </div>
  );
}
