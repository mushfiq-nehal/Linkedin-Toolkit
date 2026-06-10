export interface HashtagCategory {
  id: string;
  label: string;
  description: string;
  hashtags: string[];
}

export const HASHTAG_CATEGORIES: HashtagCategory[] = [
  {
    id: 'career',
    label: 'Career & Jobs',
    description: 'For career advice, job searches, and professional development.',
    hashtags: [
      '#CareerAdvice', '#JobSearch', '#HiringNow', '#OpenToWork',
      '#CareerGrowth', '#JobOpening', '#Recruitment', '#Hiring',
      '#CareerDevelopment', '#ProfessionalGrowth', '#JobHunt', '#CareerTips',
      '#Networking', '#LinkedInTips', '#Resume', '#Interview',
    ],
  },
  {
    id: 'leadership',
    label: 'Leadership & Management',
    description: 'For leadership insights and management content.',
    hashtags: [
      '#Leadership', '#Management', '#ExecutiveLeadership', '#TeamManagement',
      '#LeadershipDevelopment', '#Strategy', '#BusinessStrategy', '#Mindset',
      '#GrowthMindset', '#Innovation', '#ChangeManagement', '#FutureOfWork',
    ],
  },
  {
    id: 'technology',
    label: 'Technology',
    description: 'For tech industry content and software topics.',
    hashtags: [
      '#Technology', '#Tech', '#Software', '#SoftwareDevelopment',
      '#AI', '#ArtificialIntelligence', '#MachineLearning', '#DataScience',
      '#CloudComputing', '#Cybersecurity', '#DigitalTransformation',
      '#Programming', '#WebDevelopment', '#OpenSource', '#DevOps',
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing & Content',
    description: 'For marketing, content strategy, and digital marketing.',
    hashtags: [
      '#Marketing', '#ContentMarketing', '#DigitalMarketing', '#SEO',
      '#SocialMedia', '#ContentStrategy', '#BrandBuilding', '#Copywriting',
      '#B2BMarketing', '#GrowthMarketing', '#EmailMarketing', '#Storytelling',
      '#ContentCreation', '#PersonalBranding',
    ],
  },
  {
    id: 'entrepreneurship',
    label: 'Entrepreneurship',
    description: 'For founders, startups, and business building.',
    hashtags: [
      '#Entrepreneurship', '#Startup', '#Founders', '#SaaS',
      '#SmallBusiness', '#BusinessDevelopment', '#Venture', '#VC',
      '#Bootstrapping', '#StartupLife', '#BusinessGrowth', '#Scale',
    ],
  },
  {
    id: 'productivity',
    label: 'Productivity & Work',
    description: 'For productivity tips and work habits.',
    hashtags: [
      '#Productivity', '#TimeManagement', '#WorkLifeBalance', '#RemoteWork',
      '#FutureOfWork', '#WorkFromHome', '#DeepWork', '#Focus',
      '#Habits', '#MorningRoutine', '#PersonalDevelopment',
    ],
  },
  {
    id: 'finance',
    label: 'Finance & Investing',
    description: 'For finance, investing, and business finance topics.',
    hashtags: [
      '#Finance', '#Investing', '#PersonalFinance', '#FinancialFreedom',
      '#Wealth', '#Investment', '#StockMarket', '#FinTech',
      '#MoneyManagement', '#FinancialPlanning',
    ],
  },
  {
    id: 'design',
    label: 'Design & UX',
    description: 'For design, UX, and creative content.',
    hashtags: [
      '#Design', '#UX', '#UIDesign', '#UserExperience',
      '#ProductDesign', '#GraphicDesign', '#CreativeDesign', '#DesignThinking',
      '#Branding', '#Typography', '#Figma',
    ],
  },
];

export function getHashtagsByCategory(categoryId: string): string[] {
  const cat = HASHTAG_CATEGORIES.find((c) => c.id === categoryId);
  return cat?.hashtags ?? [];
}

export function generateHashtagsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const matched: Set<string> = new Set();

  const keywordMap: Record<string, string[]> = {
    job: ['#JobSearch', '#HiringNow', '#CareerAdvice'],
    career: ['#CareerGrowth', '#CareerAdvice', '#ProfessionalGrowth'],
    lead: ['#Leadership', '#Management', '#Strategy'],
    tech: ['#Technology', '#Software', '#Innovation'],
    code: ['#Programming', '#SoftwareDevelopment', '#Tech'],
    market: ['#Marketing', '#DigitalMarketing', '#ContentMarketing'],
    design: ['#Design', '#UX', '#ProductDesign'],
    startup: ['#Startup', '#Entrepreneurship', '#Founders'],
    ai: ['#AI', '#ArtificialIntelligence', '#MachineLearning'],
    data: ['#DataScience', '#Analytics', '#MachineLearning'],
    product: ['#ProductManagement', '#ProductStrategy', '#B2B'],
    finance: ['#Finance', '#Investing', '#FinTech'],
    remote: ['#RemoteWork', '#WorkFromHome', '#FutureOfWork'],
  };

  for (const [keyword, tags] of Object.entries(keywordMap)) {
    if (lower.includes(keyword)) {
      tags.forEach((t) => matched.add(t));
    }
  }

  // Always add a few generic LinkedIn hashtags
  matched.add('#LinkedIn');
  matched.add('#Networking');
  matched.add('#PersonalBranding');

  return Array.from(matched).slice(0, 15);
}
