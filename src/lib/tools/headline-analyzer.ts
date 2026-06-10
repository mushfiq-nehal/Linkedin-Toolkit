export interface HeadlineScore {
  total: number;
  max: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  clarity: number;
  length: number;
  keywords: number;
  specificity: number;
  recommendations: string[];
  strengths: string[];
  suggestions: KeywordSuggestion[];
}

export interface KeywordSuggestion {
  category: string;
  keywords: string[];
}

const POWER_KEYWORDS = [
  'passionate', 'strategic', 'experienced', 'skilled', 'certified',
  'expert', 'professional', 'dedicated', 'innovative', 'proven',
  'results-driven', 'accomplished', 'award-winning', 'recognized',
  'leader', 'specialist', 'consultant', 'engineer', 'developer',
  'manager', 'director', 'analyst', 'designer', 'architect',
];

const WEAK_PHRASES = [
  'guru', 'ninja', 'rockstar', 'wizard', 'evangelist',
  'thought leader', 'serial entrepreneur', 'influencer',
  'hustler', 'maven',
];

const ROLE_KEYWORDS: KeywordSuggestion[] = [
  {
    category: 'Engineering',
    keywords: ['Software Engineer', 'Full Stack Developer', 'Backend Engineer', 'Frontend Developer', 'DevOps', 'SRE', 'Data Engineer'],
  },
  {
    category: 'Product',
    keywords: ['Product Manager', 'Product Lead', 'Head of Product', 'Senior PM', 'Product Strategy'],
  },
  {
    category: 'Marketing',
    keywords: ['Marketing Manager', 'Content Strategist', 'SEO Specialist', 'Growth Marketer', 'Brand Manager'],
  },
  {
    category: 'Sales',
    keywords: ['Account Executive', 'Sales Manager', 'Business Development', 'Revenue Lead', 'Enterprise Sales'],
  },
  {
    category: 'Design',
    keywords: ['UX Designer', 'Product Designer', 'UI/UX', 'Design Lead', 'Visual Designer'],
  },
  {
    category: 'People',
    keywords: ['Talent Acquisition', 'HR Manager', 'People Operations', 'Recruiter', 'HR Business Partner'],
  },
];

export function analyzeHeadline(headline: string): HeadlineScore {
  const recommendations: string[] = [];
  const strengths: string[] = [];
  const lower = headline.toLowerCase();

  // ─── Length Score (0-25) ───
  const length = headline.length;
  let lengthScore = 0;
  if (length === 0) {
    lengthScore = 0;
    recommendations.push('Write a headline to get started.');
  } else if (length < 40) {
    lengthScore = 10;
    recommendations.push('Your headline is short. Consider expanding it to 100-200 characters for more visibility.');
  } else if (length <= 100) {
    lengthScore = 18;
  } else if (length <= 160) {
    lengthScore = 25;
    strengths.push('Excellent headline length — long enough to showcase skills without being cut off.');
  } else if (length <= 220) {
    lengthScore = 20;
  } else {
    lengthScore = 10;
    recommendations.push('Your headline exceeds 220 characters. LinkedIn will truncate it. Shorten it for better visibility.');
  }

  // ─── Clarity Score (0-25) ───
  let clarityScore = 25;
  const hasWeakPhrase = WEAK_PHRASES.some((w) => lower.includes(w));
  if (hasWeakPhrase) {
    clarityScore -= 10;
    recommendations.push('Avoid vague terms like "guru", "ninja", or "rockstar". Use your actual job title instead.');
  }

  const hasRole = /\b(engineer|developer|designer|manager|analyst|consultant|director|specialist|lead|founder|ceo|cto|vp|head of|recruiter)\b/i.test(headline);
  if (!hasRole) {
    clarityScore -= 8;
    recommendations.push('Include your job title or role for immediate clarity. Recruiters search by title.');
  } else {
    strengths.push('Your headline includes a clear professional role.');
  }

  if (headline === headline.toUpperCase() && headline.length > 5) {
    clarityScore -= 5;
    recommendations.push('Avoid ALL CAPS. It reduces readability and can seem unprofessional.');
  }

  clarityScore = Math.max(0, clarityScore);

  // ─── Keywords Score (0-25) ───
  let keywordsScore = 0;
  const powerKeywordCount = POWER_KEYWORDS.filter((k) => lower.includes(k)).length;

  if (powerKeywordCount >= 2) {
    keywordsScore = 25;
    strengths.push('Good use of professional keywords that recruiters search for.');
  } else if (powerKeywordCount === 1) {
    keywordsScore = 15;
    recommendations.push('Add 1-2 more professional keywords to improve recruiter discoverability.');
  } else {
    keywordsScore = 5;
    recommendations.push('Add relevant industry keywords. Recruiters search for specific skills and titles.');
  }

  const hasTechStack = /\b(react|python|javascript|typescript|java|aws|kubernetes|sql|go|rust|node)\b/i.test(headline);
  if (hasTechStack) {
    keywordsScore = Math.min(25, keywordsScore + 5);
    strengths.push('Includes technical skills — great for tech recruiters.');
  }

  // ─── Specificity Score (0-25) ───
  let specificityScore = 0;
  const hasPipe = headline.includes('|') || headline.includes('·') || headline.includes('•') || headline.includes('-');
  if (hasPipe) {
    specificityScore += 8;
    strengths.push('Good structure with separators — makes your headline scannable.');
  } else if (length > 40) {
    specificityScore += 3;
    recommendations.push('Use separators (| or ·) to organize multiple skills or roles for scannability.');
  }

  const hasCompany = /@|at |@\w/.test(lower);
  if (hasCompany) {
    specificityScore += 5;
  }

  const hasNumber = /\d+/.test(headline);
  if (hasNumber) {
    specificityScore += 7;
    strengths.push('Specific numbers or years of experience make your headline more credible.');
  } else if (length > 60) {
    recommendations.push('Consider adding years of experience or a specific achievement number.');
  }

  const hasMultipleRoles = (headline.match(/\|/g) || []).length >= 2;
  if (hasMultipleRoles) {
    specificityScore += 5;
  }

  specificityScore = Math.min(25, specificityScore + 5);

  const total = lengthScore + clarityScore + keywordsScore + specificityScore;

  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (total >= 85) grade = 'A';
  else if (total >= 70) grade = 'B';
  else if (total >= 55) grade = 'C';
  else if (total >= 40) grade = 'D';
  else grade = 'F';

  if (recommendations.length === 0 && total >= 85) {
    recommendations.push('Great headline! Keep testing variations to see what performs best for your audience.');
  }

  return {
    total,
    max: 100,
    grade,
    clarity: clarityScore,
    length: lengthScore,
    keywords: keywordsScore,
    specificity: specificityScore,
    recommendations,
    strengths,
    suggestions: ROLE_KEYWORDS,
  };
}
