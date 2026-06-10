export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: 'formatting' | 'analytics' | 'templates' | 'content';
  icon: string;
  href: string;
  featured: boolean;
  tags: string[];
  relatedTools: string[];
}

export const tools: Tool[] = [
  {
    id: 'text-formatter',
    name: 'LinkedIn Text Formatter',
    slug: 'linkedin-text-formatter',
    description: 'Format your LinkedIn posts with bold, italic, strikethrough, and more Unicode text styles. One-click copy to paste directly into LinkedIn.',
    shortDescription: 'Bold, italic, strikethrough, and more Unicode text styles.',
    category: 'formatting',
    icon: 'bold',
    href: '/tools/linkedin-text-formatter/',
    featured: true,
    tags: ['formatting', 'text', 'unicode', 'bold', 'italic'],
    relatedTools: ['post-preview', 'character-counter', 'emoji-adder'],
  },
  {
    id: 'post-preview',
    name: 'LinkedIn Post Preview',
    slug: 'linkedin-post-preview',
    description: 'See exactly how your LinkedIn post will look before you publish. Preview on desktop and mobile with realistic rendering.',
    shortDescription: 'Preview how your post looks on desktop and mobile.',
    category: 'content',
    icon: 'eye',
    href: '/tools/linkedin-post-preview/',
    featured: true,
    tags: ['preview', 'post', 'mobile', 'desktop'],
    relatedTools: ['text-formatter', 'character-counter', 'hashtag-generator'],
  },
  {
    id: 'character-counter',
    name: 'LinkedIn Character Counter',
    slug: 'linkedin-character-counter',
    description: 'Count characters for LinkedIn posts, headlines, and About sections with visual progress indicators and limits.',
    shortDescription: 'Count characters for posts, headlines, and About sections.',
    category: 'analytics',
    icon: 'hash',
    href: '/tools/linkedin-character-counter/',
    featured: true,
    tags: ['character count', 'limits', 'post', 'headline', 'about'],
    relatedTools: ['text-formatter', 'post-preview', 'headline-analyzer'],
  },
  {
    id: 'headline-analyzer',
    name: 'LinkedIn Headline Analyzer',
    slug: 'linkedin-headline-analyzer',
    description: 'Analyze and score your LinkedIn headline for clarity, length, keywords, and impact. Get actionable improvement recommendations.',
    shortDescription: 'Score your headline for clarity, length, and keywords.',
    category: 'analytics',
    icon: 'chart',
    href: '/tools/linkedin-headline-analyzer/',
    featured: true,
    tags: ['headline', 'analyzer', 'score', 'keywords', 'optimization'],
    relatedTools: ['character-counter', 'about-section-templates', 'connection-message-templates'],
  },
  {
    id: 'hashtag-generator',
    name: 'LinkedIn Hashtag Generator',
    slug: 'linkedin-hashtag-generator',
    description: 'Generate relevant LinkedIn hashtags by category, topic, or audience. Get trending hashtag recommendations for more reach.',
    shortDescription: 'Generate relevant hashtags by category and topic.',
    category: 'content',
    icon: 'tag',
    href: '/tools/linkedin-hashtag-generator/',
    featured: false,
    tags: ['hashtags', 'reach', 'engagement', 'categories'],
    relatedTools: ['text-formatter', 'post-preview', 'emoji-adder'],
  },
  {
    id: 'emoji-adder',
    name: 'LinkedIn Emoji Adder',
    slug: 'linkedin-emoji-adder',
    description: 'Browse professional emojis by category and insert them into your LinkedIn posts with one click. Copy-ready for immediate use.',
    shortDescription: 'Browse professional emojis by category for your posts.',
    category: 'formatting',
    icon: 'smile',
    href: '/tools/linkedin-emoji-adder/',
    featured: false,
    tags: ['emoji', 'professional', 'formatting', 'posts'],
    relatedTools: ['text-formatter', 'post-preview', 'hashtag-generator'],
  },
  {
    id: 'connection-message-templates',
    name: 'LinkedIn Connection Message Templates',
    slug: 'linkedin-connection-message-templates',
    description: 'Copy-ready LinkedIn connection message templates for networking, recruiter outreach, job applications, and follow-ups.',
    shortDescription: 'Ready-to-use connection message templates.',
    category: 'templates',
    icon: 'message',
    href: '/tools/linkedin-connection-message-templates/',
    featured: true,
    tags: ['connection', 'networking', 'recruiter', 'outreach', 'templates'],
    relatedTools: ['about-section-templates', 'headline-analyzer', 'text-formatter'],
  },
  {
    id: 'about-section-templates',
    name: 'LinkedIn About Section Templates',
    slug: 'linkedin-about-section-templates',
    description: 'Professional LinkedIn About section templates for students, engineers, product managers, recruiters, and marketers.',
    shortDescription: 'Professional About section templates by role.',
    category: 'templates',
    icon: 'user',
    href: '/tools/linkedin-about-section-templates/',
    featured: true,
    tags: ['about', 'summary', 'templates', 'profile', 'bio'],
    relatedTools: ['connection-message-templates', 'headline-analyzer', 'character-counter'],
  },
];

export function getToolById(id: string): Tool | undefined {
  return tools.find((t) => t.id === id);
}

export function getRelatedTools(tool: Tool): Tool[] {
  return tool.relatedTools
    .map((id) => getToolById(id))
    .filter((t): t is Tool => t !== undefined)
    .slice(0, 3);
}

export function getFeaturedTools(): Tool[] {
  return tools.filter((t) => t.featured);
}

export function getToolsByCategory(category: Tool['category']): Tool[] {
  return tools.filter((t) => t.category === category);
}
