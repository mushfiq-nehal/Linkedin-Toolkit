/**
 * AI Provider Abstraction Layer
 *
 * This module provides a provider-agnostic interface for AI integrations.
 * The website is fully functional without AI. AI features are opt-in and
 * additive — they never replace or block core tool functionality.
 *
 * Supported providers (future):
 * - OpenRouter (primary)
 * - OpenAI
 * - Anthropic
 *
 * Usage:
 *   const provider = createAIProvider({ type: 'openrouter', apiKey: '...' });
 *   const result = await provider.complete({ prompt: '...' });
 */

export type AIProviderType = 'openrouter' | 'openai' | 'anthropic' | 'none';

export interface AIProviderConfig {
  type: AIProviderType;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

export interface AICompletionRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AICompletionResponse {
  text: string;
  model: string;
  tokensUsed?: number;
}

export interface AIProvider {
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
  isAvailable(): boolean;
}

class NoopAIProvider implements AIProvider {
  isAvailable() {
    return false;
  }

  async complete(_request: AICompletionRequest): Promise<AICompletionResponse> {
    throw new Error('AI provider not configured. Set up an AI provider to use AI features.');
  }
}

class OpenRouterProvider implements AIProvider {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  isAvailable() {
    return Boolean(this.config.apiKey);
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    if (!this.config.apiKey) {
      throw new Error('OpenRouter API key not configured.');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://linkedintoolkit.com',
        'X-Title': 'LinkedIn Toolkit',
      },
      body: JSON.stringify({
        model: this.config.model ?? 'mistralai/mistral-7b-instruct',
        messages: [
          ...(request.systemPrompt
            ? [{ role: 'system', content: request.systemPrompt }]
            : []),
          { role: 'user', content: request.prompt },
        ],
        max_tokens: request.maxTokens ?? 1024,
        temperature: request.temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0]?.message?.content ?? '',
      model: data.model ?? this.config.model ?? 'unknown',
      tokensUsed: data.usage?.total_tokens,
    };
  }
}

export function createAIProvider(config: AIProviderConfig): AIProvider {
  switch (config.type) {
    case 'openrouter':
      return new OpenRouterProvider(config);
    case 'none':
    default:
      return new NoopAIProvider();
  }
}

export const defaultProvider = createAIProvider({
  type: 'none',
});
