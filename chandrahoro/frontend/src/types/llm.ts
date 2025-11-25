export type LlmProvider = 
  | 'openai'
  | 'azure-openai'
  | 'anthropic'
  | 'google'
  | 'openrouter'
  | 'mistral'
  | 'together'
  | 'groq'
  | 'perplexity'
  | 'cohere'
  | 'xai'
  | 'ollama'
  | 'custom';

export type ResponseFormat = 'text' | 'json' | 'auto';

export interface LlmConfigInput {
  provider: LlmProvider;
  model: string;
  apiKey: string;
  baseUrl?: string;
  extraHeaders?: Record<string, string>;
  region?: string; // Azure only
  deployment?: string; // Azure only
  responseFormat?: ResponseFormat;
  dailyLimit?: number;
}

export interface LlmConfigSummary {
  provider: LlmProvider;
  model: string;
  baseUrl?: string;
  lastValidatedAt: string;
  usageToday: number;
  dailyLimit?: number;
  keyLastFour?: string;
}

export interface AdminDefaults {
  enforced?: boolean;
  allowedProviders?: LlmProvider[];
  defaultProvider?: LlmProvider;
  defaultModel?: string;
  baseUrl?: string;
  extraHeaders?: Record<string, string>;
  maxOutputTokens?: number;
  responseFormats?: ResponseFormat[];
  perUserDailyCap?: number;
  globalDailyCap?: number;
}

export interface AuditRow {
  at: string;
  user: string;
  action: 'create' | 'rotate' | 'delete' | 'test' | 'enable' | 'disable' | 'set-cap';
  provider?: string;
  result: 'success' | 'error';
  note?: string;
  ipMasked?: string;
}

export interface UserLlmRow {
  user: string;
  status: 'enabled' | 'disabled';
  provider?: string;
  model?: string;
  usageToday: number;
  quota?: number;
}

export interface TestConnectionResult {
  ok: boolean;
  latencyMs?: number;
  error?: string;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
}

export const PROVIDER_LABELS: Record<LlmProvider, string> = {
  'openai': 'OpenAI',
  'azure-openai': 'Azure OpenAI',
  'anthropic': 'Anthropic',
  'google': 'Google AI',
  'openrouter': 'OpenRouter',
  'mistral': 'Mistral AI',
  'together': 'Together AI',
  'groq': 'Groq',
  'perplexity': 'Perplexity',
  'cohere': 'Cohere',
  'xai': 'xAI',
  'ollama': 'Ollama',
  'custom': 'Custom Provider'
};

export const PROVIDERS_REQUIRING_BASE_URL: LlmProvider[] = [
  'azure-openai',
  'openrouter',
  'ollama',
  'custom'
];

export const AZURE_ONLY_PROVIDERS: LlmProvider[] = ['azure-openai'];

export const DEFAULT_MODELS: Record<LlmProvider, string> = {
  'openai': 'gpt-4',
  'azure-openai': 'gpt-4',
  'anthropic': 'claude-3-5-sonnet-20241022',
  'google': 'gemini-pro',
  'openrouter': 'anthropic/claude-3.5-sonnet',
  'mistral': 'mistral-large-latest',
  'together': 'meta-llama/Llama-3-70b-chat-hf',
  'groq': 'llama3-70b-8192',
  'perplexity': 'llama-3.1-sonar-large-128k-online',
  'cohere': 'command-r-plus',
  'xai': 'grok-beta',
  'ollama': 'llama3',
  'custom': ''
};
