import type { APIRoute } from 'astro';

const SITE = 'https://linkedintoolkit.com';

interface SitemapURL {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

const today = new Date().toISOString().split('T')[0];

const urls: SitemapURL[] = [
  // Homepage — highest priority
  {
    loc: '/',
    lastmod: today,
    changefreq: 'daily',
    priority: 1.0,
  },

  // Core tool pages — high priority (flagship tools)
  {
    loc: '/linkedin-text-formatter/',
    lastmod: today,
    changefreq: 'weekly',
    priority: 0.9,
  },
  {
    loc: '/linkedin-post-preview/',
    lastmod: today,
    changefreq: 'weekly',
    priority: 0.85,
  },
  {
    loc: '/linkedin-character-counter/',
    lastmod: today,
    changefreq: 'weekly',
    priority: 0.85,
  },
  {
    loc: '/linkedin-headline-analyzer/',
    lastmod: today,
    changefreq: 'weekly',
    priority: 0.85,
  },
  {
    loc: '/linkedin-hashtag-generator/',
    lastmod: today,
    changefreq: 'weekly',
    priority: 0.85,
  },
  {
    loc: '/linkedin-emoji-adder/',
    lastmod: today,
    changefreq: 'weekly',
    priority: 0.8,
  },
  {
    loc: '/linkedin-connection-message-templates/',
    lastmod: today,
    changefreq: 'weekly',
    priority: 0.8,
  },
  {
    loc: '/linkedin-about-section-templates/',
    lastmod: today,
    changefreq: 'weekly',
    priority: 0.8,
  },

  // Section index pages
  {
    loc: '/tools/',
    lastmod: today,
    changefreq: 'weekly',
    priority: 0.75,
  },
  {
    loc: '/guides/',
    lastmod: today,
    changefreq: 'weekly',
    priority: 0.75,
  },
  {
    loc: '/templates/',
    lastmod: today,
    changefreq: 'weekly',
    priority: 0.75,
  },
  {
    loc: '/resources/',
    lastmod: today,
    changefreq: 'weekly',
    priority: 0.7,
  },

  // Guide pages — content/SEO value
  {
    loc: '/guides/linkedin-post-formatting/',
    lastmod: today,
    changefreq: 'monthly',
    priority: 0.7,
  },
  {
    loc: '/guides/linkedin-headline-examples/',
    lastmod: today,
    changefreq: 'monthly',
    priority: 0.7,
  },

  // Template pages
  {
    loc: '/templates/linkedin-connection-message-templates/',
    lastmod: today,
    changefreq: 'monthly',
    priority: 0.65,
  },
  {
    loc: '/templates/linkedin-about-section-examples/',
    lastmod: today,
    changefreq: 'monthly',
    priority: 0.65,
  },

  // Legal / informational pages — lower priority
  {
    loc: '/about-us/',
    lastmod: today,
    changefreq: 'monthly',
    priority: 0.5,
  },
  {
    loc: '/contact-us/',
    lastmod: today,
    changefreq: 'monthly',
    priority: 0.5,
  },
  {
    loc: '/privacy-policy/',
    lastmod: today,
    changefreq: 'yearly',
    priority: 0.3,
  },
  {
    loc: '/terms-and-conditions/',
    lastmod: today,
    changefreq: 'yearly',
    priority: 0.3,
  },
  {
    loc: '/disclaimer/',
    lastmod: today,
    changefreq: 'yearly',
    priority: 0.3,
  },
];

function buildSitemap(urls: SitemapURL[]): string {
  const entries = urls
    .map(({ loc, lastmod, changefreq, priority }) => {
      return [
        `  <url>`,
        `    <loc>${SITE}${loc}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
        changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
        priority !== undefined ? `    <priority>${priority.toFixed(1)}</priority>` : '',
        `  </url>`,
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`,
    `        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`,
    `        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9`,
    `        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`,
    entries,
    `</urlset>`,
  ].join('\n');
}

export const GET: APIRoute = () => {
  return new Response(buildSitemap(urls), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
