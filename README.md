# LinkedIn Toolkit

**Domain:** linkedintoolkit.com

Free LinkedIn tools for creators, professionals, job seekers, and recruiters. Built with Astro, Tailwind CSS v4, TypeScript, and React.

## V1 Tools

| Tool | URL |
|------|-----|
| LinkedIn Text Formatter | `/tools/linkedin-text-formatter/` |
| LinkedIn Post Preview | `/tools/linkedin-post-preview/` |
| LinkedIn Character Counter | `/tools/linkedin-character-counter/` |
| LinkedIn Headline Analyzer | `/tools/linkedin-headline-analyzer/` |
| LinkedIn Hashtag Generator | `/tools/linkedin-hashtag-generator/` |
| LinkedIn Emoji Adder | `/tools/linkedin-emoji-adder/` |
| LinkedIn Connection Message Templates | `/tools/linkedin-connection-message-templates/` |
| LinkedIn About Section Templates | `/tools/linkedin-about-section-templates/` |

## Project Structure

```
src/
├── components/
│   ├── layout/        Navbar, Footer
│   ├── sections/      Hero, FeaturedTools, Benefits, HowItWorks, FAQ, SEOContent, RelatedTools, CTA
│   ├── seo/           SEO head component
│   ├── tools/         React interactive tool components
│   └── ui/            ToolCard, reusable UI
├── data/              tools.ts, guides.ts, templates.ts
├── layouts/           BaseLayout.astro, ToolLayout.astro
├── lib/
│   ├── ai/            Provider abstraction (future AI features)
│   └── tools/         Tool logic: text-formatter, character-counter, headline-analyzer, hashtag-generator
├── pages/
│   ├── tools/         8 tool pages
│   ├── guides/        Guide pages
│   ├── templates/     Template pages
│   └── resources/     Resources index
└── styles/            global.css (Tailwind v4 + design tokens)
```

## Tech Stack

- **Framework:** Astro 6
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Components:** React 19 (for interactive tools)
- **TypeScript:** Strict mode
- **SEO:** Sitemap via `@astrojs/sitemap`, structured data, OG/Twitter cards
- **Design System:** Vercel-inspired (see `DESIGN.md`)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## AI Features (Future)

The `src/lib/ai/provider.ts` module provides a provider-agnostic AI abstraction layer supporting OpenRouter, OpenAI, and Anthropic. The site is fully functional without AI — AI features are opt-in and additive.

## SEO Architecture

- Dynamic metadata via SEO component
- Structured data (WebSite, FAQPage, SoftwareApplication, Article)
- Sitemap auto-generated via `@astrojs/sitemap`
- Canonical URLs
- OG + Twitter cards
- Breadcrumb navigation + schema

## Content Structure

```
/tools/          — Tool pages (fully functional, no account required)
/guides/         — In-depth guides with internal links to tools
/templates/      — Copy-ready templates with internal links
/resources/      — Content hub linking everything together
```
