/**
 * ChandraHoro V2.1 - AI Safety and Content Filtering
 * 
 * Content safety checks and filtering for AI-generated astrological content.
 * Ensures responsible AI usage and protects users from harmful content.
 * 
 * Features:
 * - Input content filtering
 * - Output content validation
 * - Blocked topic detection
 * - Harmful content prevention
 * - Cultural sensitivity checks
 * - Professional boundary enforcement
 */

/**
 * Topics and content types that should be blocked or handled carefully
 */
const BLOCKED_TOPICS = [
  // Medical and health
  'medical diagnosis',
  'disease prediction',
  'health treatment',
  'medication advice',
  'surgery timing',
  'pregnancy complications',
  'mental health diagnosis',
  
  // Legal and financial
  'legal advice',
  'court case outcomes',
  'financial investment advice',
  'stock market predictions',
  'gambling advice',
  'lottery numbers',
  'cryptocurrency predictions',
  
  // Harmful predictions
  'death predictions',
  'death timing',
  'when will i die',
  'when will you die',
  'when will he die',
  'when will she die',
  'death date',
  'time of death',
  'accident predictions',
  'disaster predictions',
  'violence predictions',
  'harm to self',
  'harm to others',
  'suicide',
  
  // Inappropriate content
  'explicit sexual content',
  'adult content',
  'inappropriate relationships',
  'illegal activities',
  'drug use',
  'criminal activities',
];

/**
 * Warning phrases that require careful handling
 */
const WARNING_PHRASES = [
  'will die',
  'going to die',
  'death is near',
  'fatal accident',
  'serious illness',
  'terminal disease',
  'divorce certain',
  'relationship doomed',
  'financial ruin',
  'bankruptcy',
  'job loss certain',
  'failure guaranteed',
  'hopeless situation',
  'no solution',
  'cursed',
  'bad luck forever',
];

/**
 * Sensitive topics that require disclaimers
 */
const SENSITIVE_TOPICS = [
  'health',
  'medical',
  'illness',
  'disease',
  'pregnancy',
  'fertility',
  'mental health',
  'depression',
  'anxiety',
  'relationships',
  'marriage',
  'divorce',
  'separation',
  'death',
  'loss',
  'grief',
  'money',
  'finance',
  'career',
  'job',
  'legal',
  'court',
  'lawsuit',
];

/**
 * Check if input content contains blocked or inappropriate topics
 * 
 * @param text - Text to analyze for safety
 * @returns Safety analysis result
 */
export function checkInputSafety(text: string): {
  isSafe: boolean;
  blockedTopics: string[];
  warningPhrases: string[];
  sensitiveTopics: string[];
  recommendations: string[];
} {
  const lowerText = text.toLowerCase();
  
  // Check for blocked topics
  const foundBlockedTopics = BLOCKED_TOPICS.filter(topic => 
    lowerText.includes(topic.toLowerCase())
  );
  
  // Check for warning phrases
  const foundWarningPhrases = WARNING_PHRASES.filter(phrase => 
    lowerText.includes(phrase.toLowerCase())
  );
  
  // Check for sensitive topics
  const foundSensitiveTopics = SENSITIVE_TOPICS.filter(topic => 
    lowerText.includes(topic.toLowerCase())
  );
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (foundBlockedTopics.length > 0) {
    recommendations.push('This request contains topics outside the scope of astrological guidance.');
    recommendations.push('Consider rephrasing to focus on general life guidance instead.');
  }
  
  if (foundWarningPhrases.length > 0) {
    recommendations.push('Avoid requesting specific negative predictions.');
    recommendations.push('Focus on positive guidance and personal empowerment.');
  }
  
  if (foundSensitiveTopics.length > 0) {
    recommendations.push('This topic requires careful handling with appropriate disclaimers.');
    recommendations.push('Consider consulting relevant professionals for specific advice.');
  }
  
  const isSafe = foundBlockedTopics.length === 0 && foundWarningPhrases.length === 0;
  
  return {
    isSafe,
    blockedTopics: foundBlockedTopics,
    warningPhrases: foundWarningPhrases,
    sensitiveTopics: foundSensitiveTopics,
    recommendations,
  };
}

/**
 * Check if AI-generated output content is appropriate and safe
 * 
 * @param text - AI-generated text to validate
 * @returns Output safety validation result
 */
export function checkOutputSafety(text: string): {
  isSafe: boolean;
  issues: string[];
  requiredDisclaimers: string[];
  suggestedEdits: string[];
} {
  const lowerText = text.toLowerCase();
  const issues: string[] = [];
  const requiredDisclaimers: string[] = [];
  const suggestedEdits: string[] = [];
  
  // Check for inappropriate predictions
  const harmfulPredictions = [
    'will die',
    'going to die',
    'death is certain',
    'fatal',
    'doomed',
    'hopeless',
    'no chance',
    'impossible',
    'never succeed',
    'always fail',
  ];
  
  harmfulPredictions.forEach(phrase => {
    if (lowerText.includes(phrase)) {
      issues.push(`Contains harmful prediction: "${phrase}"`);
      suggestedEdits.push('Replace negative predictions with constructive guidance');
    }
  });
  
  // Check for medical advice
  const medicalTerms = ['diagnose', 'treatment', 'cure', 'medicine', 'surgery', 'therapy'];
  medicalTerms.forEach(term => {
    if (lowerText.includes(term)) {
      requiredDisclaimers.push('medical');
      suggestedEdits.push('Add medical disclaimer and suggest consulting healthcare professionals');
    }
  });
  
  // Check for financial advice
  const financialTerms = ['invest', 'buy stocks', 'sell property', 'loan', 'mortgage', 'bankruptcy'];
  financialTerms.forEach(term => {
    if (lowerText.includes(term)) {
      requiredDisclaimers.push('financial');
      suggestedEdits.push('Add financial disclaimer and suggest consulting financial advisors');
    }
  });
  
  // Check for relationship advice that's too definitive
  const definitiveRelationshipTerms = ['will divorce', 'relationship will fail', 'never marry', 'perfect match'];
  definitiveRelationshipTerms.forEach(term => {
    if (lowerText.includes(term)) {
      issues.push(`Too definitive about relationships: "${term}"`);
      suggestedEdits.push('Use more balanced language about relationship potential');
    }
  });
  
  const isSafe = issues.length === 0;
  
  return {
    isSafe,
    issues,
    requiredDisclaimers,
    suggestedEdits,
  };
}

/**
 * Sanitize and improve AI output to meet safety standards
 * 
 * @param text - Original AI output
 * @returns Sanitized and improved text
 */
export function sanitizeOutput(text: string): string {
  let sanitized = text;
  
  // Replace harmful absolute statements
  const replacements = [
    { from: /will die/gi, to: 'may face health challenges' },
    { from: /going to die/gi, to: 'should focus on health and wellness' },
    { from: /doomed/gi, to: 'facing challenges that can be overcome' },
    { from: /hopeless/gi, to: 'challenging but with potential for improvement' },
    { from: /never succeed/gi, to: 'may need to try different approaches' },
    { from: /always fail/gi, to: 'should focus on learning and growth' },
    { from: /impossible/gi, to: 'very challenging' },
    { from: /certain death/gi, to: 'health concerns that need attention' },
    { from: /will divorce/gi, to: 'may experience relationship challenges' },
    { from: /relationship will fail/gi, to: 'relationship needs attention and care' },
  ];
  
  replacements.forEach(({ from, to }) => {
    sanitized = sanitized.replace(from, to);
  });
  
  // Add empowering language
  if (sanitized.includes('challenge') || sanitized.includes('difficult')) {
    sanitized += '\n\nRemember, challenges are opportunities for growth and positive change is always possible through conscious effort and right action.';
  }
  
  return sanitized;
}

/**
 * Generate appropriate disclaimers based on content analysis
 * 
 * @param contentType - Type of content generated
 * @param sensitiveTopics - Sensitive topics detected
 * @returns Array of disclaimer texts
 */
export function generateDisclaimers(
  contentType: 'daily_reading' | 'chat' | 'compatibility' | 'chart_analysis',
  sensitiveTopics: string[] = []
): string[] {
  const disclaimers: string[] = [];
  
  // Base disclaimer for all astrological content
  disclaimers.push(
    'This astrological guidance is for informational and spiritual purposes only. Your free will and personal choices ultimately determine your path.'
  );
  
  // Content-specific disclaimers
  if (contentType === 'compatibility') {
    disclaimers.push(
      'Relationship success depends on many factors including communication, mutual respect, and personal growth, not just astrological compatibility.'
    );
  }
  
  // Topic-specific disclaimers
  if (sensitiveTopics.some(topic => ['health', 'medical', 'illness'].includes(topic))) {
    disclaimers.push(
      'This reading is not a substitute for professional medical advice. Please consult healthcare providers for any health concerns.'
    );
  }
  
  if (sensitiveTopics.some(topic => ['money', 'finance', 'career'].includes(topic))) {
    disclaimers.push(
      'Financial and career decisions should be made with proper research and professional consultation, not solely based on astrological guidance.'
    );
  }
  
  if (sensitiveTopics.some(topic => ['legal', 'court', 'lawsuit'].includes(topic))) {
    disclaimers.push(
      'For legal matters, please consult qualified legal professionals. Astrological guidance cannot replace proper legal advice.'
    );
  }
  
  return disclaimers;
}

/**
 * Check if a user's request is appropriate for AI processing
 * 
 * @param userInput - User's input text
 * @param requestType - Type of request being made
 * @returns Validation result with recommendations
 */
export function validateUserRequest(
  userInput: string,
  requestType: 'daily_reading' | 'chat' | 'compatibility' | 'chart_analysis'
): {
  isValid: boolean;
  canProceed: boolean;
  warnings: string[];
  suggestions: string[];
  requiredDisclaimers: string[];
} {
  const inputSafety = checkInputSafety(userInput);
  
  const isValid = inputSafety.isSafe;
  const canProceed = inputSafety.blockedTopics.length === 0; // Can proceed if no blocked topics
  
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  if (!isValid) {
    warnings.push('Your request contains topics that are outside the scope of astrological guidance.');
    suggestions.push('Please rephrase your question to focus on spiritual and life guidance aspects.');
  }
  
  if (inputSafety.warningPhrases.length > 0) {
    warnings.push('Please avoid requesting specific negative predictions.');
    suggestions.push('Consider asking for guidance on how to navigate challenges positively.');
  }
  
  if (inputSafety.sensitiveTopics.length > 0) {
    warnings.push('Your question touches on sensitive topics that require careful consideration.');
    suggestions.push('The response will include appropriate disclaimers and professional consultation recommendations.');
  }
  
  const requiredDisclaimers = generateDisclaimers(requestType, inputSafety.sensitiveTopics);
  
  return {
    isValid,
    canProceed,
    warnings,
    suggestions,
    requiredDisclaimers,
  };
}

/**
 * Rate limit check for AI requests to prevent abuse
 * 
 * @param userId - User making the request
 * @param requestType - Type of AI request
 * @returns Rate limit status
 */
export function checkRateLimit(
  userId: string,
  requestType: 'daily_reading' | 'chat' | 'compatibility' | 'chart_analysis'
): {
  allowed: boolean;
  reason?: string;
  retryAfter?: number; // seconds
} {
  // This would typically integrate with Redis or database rate limiting
  // For now, return a basic implementation
  
  // Example rate limits (requests per hour)
  const rateLimits = {
    daily_reading: 5,   // 5 daily readings per hour
    chat: 20,          // 20 chat messages per hour
    compatibility: 3,   // 3 compatibility analyses per hour
    chart_analysis: 2,  // 2 chart analyses per hour
  };
  
  // In a real implementation, this would check actual usage from cache/database
  // For now, always allow (implement actual rate limiting in production)
  return {
    allowed: true,
  };
}
