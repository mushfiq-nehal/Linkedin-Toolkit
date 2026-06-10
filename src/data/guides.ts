export interface Guide {
  id: string;
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  href: string;
  relatedTools: string[];
  publishedAt: string;
  updatedAt: string;
}

export const guides: Guide[] = [
  {
    id: 'linkedin-post-formatting',
    title: 'LinkedIn Post Formatting Guide',
    slug: 'linkedin-post-formatting',
    description: 'Learn how to format LinkedIn posts for maximum readability, engagement, and reach. Complete guide with examples and best practices.',
    excerpt: 'Formatting is the difference between a post that gets read and one that gets scrolled past.',
    href: '/guides/linkedin-post-formatting/',
    relatedTools: ['text-formatter', 'post-preview', 'character-counter'],
    publishedAt: '2024-01-15',
    updatedAt: '2024-06-01',
  },
  {
    id: 'linkedin-headline-examples',
    title: 'LinkedIn Headline Examples That Work',
    slug: 'linkedin-headline-examples',
    description: '50+ LinkedIn headline examples for every role and career stage. Discover what makes a headline effective and how to write yours.',
    excerpt: 'Your headline is the first thing recruiters and connections see. Make it count.',
    href: '/guides/linkedin-headline-examples/',
    relatedTools: ['headline-analyzer', 'character-counter'],
    publishedAt: '2024-02-10',
    updatedAt: '2024-06-01',
  },
];
