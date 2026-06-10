export interface Template {
  id: string;
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  href: string;
  relatedTools: string[];
}

export const templates: Template[] = [
  {
    id: 'linkedin-connection-message-templates',
    title: 'LinkedIn Connection Message Templates',
    slug: 'linkedin-connection-message-templates',
    description: '30+ proven LinkedIn connection message templates for every scenario: networking, recruiter outreach, job seeking, and follow-ups.',
    excerpt: 'The right connection message gets replies. The wrong one gets ignored.',
    href: '/templates/linkedin-connection-message-templates/',
    relatedTools: ['connection-message-templates', 'text-formatter'],
  },
  {
    id: 'linkedin-about-section-examples',
    title: 'LinkedIn About Section Examples',
    slug: 'linkedin-about-section-examples',
    description: 'Real LinkedIn About section examples and templates for students, engineers, product managers, recruiters, and marketers.',
    excerpt: 'Your About section tells your professional story. Here\'s how to tell it well.',
    href: '/templates/linkedin-about-section-examples/',
    relatedTools: ['about-section-templates', 'headline-analyzer', 'character-counter'],
  },
];
