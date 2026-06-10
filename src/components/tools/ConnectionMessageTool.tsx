import { useState, useCallback } from 'react';

interface Template {
  id: string;
  label: string;
  situation: string;
  template: string;
}

const TEMPLATES: Template[] = [
  // Networking
  {
    id: 'networking-general',
    label: 'General Networking',
    situation: 'Connecting with someone in your industry',
    template: `Hi [Name],

I came across your profile and was impressed by your work at [Company]. I'm also in [Industry/Field] and would love to connect and exchange ideas.

Looking forward to connecting!`,
  },
  {
    id: 'networking-mutual',
    label: 'Mutual Connection',
    situation: 'Connecting through a shared contact',
    template: `Hi [Name],

[Mutual Connection] suggested I reach out — they thought we'd have a lot to talk about given our shared background in [Field].

Would love to connect!`,
  },
  {
    id: 'networking-event',
    label: 'Post-Event Connection',
    situation: 'After meeting at an event or conference',
    template: `Hi [Name],

Great meeting you at [Event]! I really enjoyed our conversation about [Topic]. 

Would love to stay in touch and continue the conversation here.`,
  },
  {
    id: 'networking-content',
    label: 'Admired Their Content',
    situation: 'Connecting after engaging with their posts',
    template: `Hi [Name],

I've been following your posts on [Topic] and genuinely find your perspective valuable — especially your recent piece on [Specific Post/Topic].

Would love to connect with more people thinking deeply about this space.`,
  },
  // Recruiter outreach
  {
    id: 'recruiter-inbound',
    label: 'Recruiter to Candidate',
    situation: 'Reaching out to a potential candidate',
    template: `Hi [Name],

I'm recruiting for a [Role] role at [Company] and your background in [Skill/Industry] caught my attention. 

I'd love to share more details if you're open to hearing about it — no pressure at all.`,
  },
  {
    id: 'recruiter-passive',
    label: 'Passive Candidate Outreach',
    situation: 'Reaching out to someone not actively looking',
    template: `Hi [Name],

I know you may not be actively looking, but I'm hiring for a [Role] at [Company] and your experience in [Specific Skill] is a strong match.

Would you be open to a brief conversation? Happy to make it worth your time.`,
  },
  // Job seeking
  {
    id: 'job-seeker-company',
    label: 'Reaching Out About a Company',
    situation: 'Connecting with someone at a target company',
    template: `Hi [Name],

I'm very interested in [Company] and noticed you work there. I've been following [Company]'s work on [Project/Area] and would love to learn more about your experience on the team.

Would you be open to a 15-minute call?`,
  },
  {
    id: 'job-seeker-hiring-manager',
    label: 'Connecting with a Hiring Manager',
    situation: 'After applying for a role',
    template: `Hi [Name],

I recently applied for the [Role] position at [Company] and wanted to connect directly. I'm particularly excited about [Specific Aspect] and believe my background in [Relevant Skill] would be a strong fit.

Would love to connect!`,
  },
  // Follow-up
  {
    id: 'followup-interview',
    label: 'Post-Interview Follow-up',
    situation: 'After a job interview',
    template: `Hi [Name],

Thank you again for taking the time to speak with me about the [Role] position. I really enjoyed learning about [Specific Topic from Interview].

I remain very excited about the opportunity and look forward to hearing from you.`,
  },
  {
    id: 'followup-meeting',
    label: 'Post-Meeting Follow-up',
    situation: 'After a networking or informational meeting',
    template: `Hi [Name],

Thank you for the conversation earlier — I really appreciated you sharing your perspective on [Topic]. 

I'll definitely take your advice on [Specific Advice]. Hope we can stay in touch!`,
  },
];

const CATEGORIES = [
  { id: 'networking', label: 'Networking', ids: ['networking-general', 'networking-mutual', 'networking-event', 'networking-content'] },
  { id: 'recruiter', label: 'Recruiter Outreach', ids: ['recruiter-inbound', 'recruiter-passive'] },
  { id: 'job-seeker', label: 'Job Seeking', ids: ['job-seeker-company', 'job-seeker-hiring-manager'] },
  { id: 'followup', label: 'Follow-up', ids: ['followup-interview', 'followup-meeting'] },
];

export default function ConnectionMessageTool() {
  const [activeCategory, setActiveCategory] = useState('networking');
  const [activeTemplate, setActiveTemplate] = useState<string>('networking-general');
  const [customized, setCustomized] = useState('');
  const [copied, setCopied] = useState(false);

  const currentCategoryTemplates = CATEGORIES.find((c) => c.id === activeCategory)?.ids ?? [];
  const template = TEMPLATES.find((t) => t.id === activeTemplate);
  const displayText = customized || template?.template || '';
  const charCount = displayText.length;

  const selectTemplate = (id: string) => {
    setActiveTemplate(id);
    setCustomized('');
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
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left panel: template picker */}
      <div className="lg:w-64 shrink-0 flex flex-col gap-4">
        {/* Category selector */}
        <div>
          <p className="text-body-sm-strong text-[var(--color-ink)] mb-3">Category</p>
          <div className="flex flex-col gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  const firstId = cat.ids[0];
                  if (firstId) {
                    selectTemplate(firstId);
                  }
                }}
                className={`text-left px-3 py-2 rounded-[var(--radius-sm)] text-body-sm transition-all ${
                  activeCategory === cat.id
                    ? 'bg-[var(--color-canvas-soft-2)] text-[var(--color-ink)] font-medium'
                    : 'text-[var(--color-body)] hover:bg-[var(--color-canvas-soft)] hover:text-[var(--color-ink)]'
                }`}
                aria-pressed={activeCategory === cat.id}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Template selector */}
        <div>
          <p className="text-body-sm-strong text-[var(--color-ink)] mb-3">Template</p>
          <div className="flex flex-col gap-1">
            {currentCategoryTemplates.map((id) => {
              const t = TEMPLATES.find((t) => t.id === id);
              if (!t) return null;
              return (
                <button
                  key={id}
                  onClick={() => selectTemplate(id)}
                  className={`text-left px-3 py-2 rounded-[var(--radius-sm)] text-body-sm transition-all ${
                    activeTemplate === id
                      ? 'bg-[var(--color-ink)] text-white'
                      : 'text-[var(--color-body)] hover:bg-[var(--color-canvas-soft)] hover:text-[var(--color-ink)]'
                  }`}
                  aria-pressed={activeTemplate === id}
                >
                  <span className="block">{t.label}</span>
                  <span className={`block text-caption mt-0.5 ${activeTemplate === id ? 'text-white/70' : 'text-[var(--color-mute)]'}`}>
                    {t.situation}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right panel: message editor */}
      <div className="flex-1 flex flex-col gap-4">
        {template && (
          <div className="rounded-[var(--radius-sm)] bg-[var(--color-canvas-soft)] border border-[var(--color-hairline)] px-4 py-3">
            <p className="text-caption-mono text-[var(--color-mute)] uppercase tracking-wider mb-1">Situation</p>
            <p className="text-body-sm text-[var(--color-body)]">{template.situation}</p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="connection-message" className="text-body-sm-strong text-[var(--color-ink)]">
              Edit your message
            </label>
            <span
              className={`text-caption ${charCount > 300 ? 'text-[var(--color-error)]' : 'text-[var(--color-mute)]'}`}
              aria-live="polite"
            >
              {charCount} / 300
            </span>
          </div>
          <textarea
            id="connection-message"
            value={displayText}
            onChange={(e) => setCustomized(e.target.value)}
            rows={10}
            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-[var(--color-ink)] text-body-sm px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-ink)] placeholder:text-[var(--color-mute)] font-[var(--font-sans)]"
            placeholder="Select a template from the left to get started..."
            aria-label="Connection message editor — replace [brackets] with your details"
          />
          <p className="text-caption text-[var(--color-mute)] mt-1.5">
            Replace <code className="text-code bg-[var(--color-canvas-soft-2)] px-1 rounded">[bracketed text]</code> with your specific details.
            {charCount > 300 && <span className="text-[var(--color-error)] ml-2">LinkedIn connection messages are limited to 300 characters.</span>}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            disabled={!displayText}
            className={`flex items-center gap-2 btn-primary ${copied ? 'opacity-80' : ''}`}
            style={{ borderRadius: 'var(--radius-pill)' }}
            aria-label="Copy message to clipboard"
          >
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="4" y="4" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.2"/><path d="M3 10V3a1 1 0 011-1h7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                Copy message
              </>
            )}
          </button>
          <button
            onClick={() => setCustomized('')}
            className="btn-secondary"
            style={{ borderRadius: 'var(--radius-pill)' }}
            aria-label="Reset to original template"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
