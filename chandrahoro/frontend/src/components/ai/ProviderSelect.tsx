import React from 'react';
import { LlmProvider, PROVIDER_LABELS } from '@/types/llm';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProviderSelectProps {
  value: LlmProvider | '';
  onValueChange: (value: LlmProvider) => void;
  allowedProviders?: LlmProvider[];
  disabled?: boolean;
  className?: string;
}

export function ProviderSelect({
  value,
  onValueChange,
  allowedProviders,
  disabled = false,
  className
}: ProviderSelectProps) {
  const providers = allowedProviders || Object.keys(PROVIDER_LABELS) as LlmProvider[];

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select a provider" />
      </SelectTrigger>
      <SelectContent>
        {providers.map((provider) => (
          <SelectItem key={provider} value={provider}>
            <div className="flex items-center gap-2">
              <ProviderIcon provider={provider} />
              <span>{PROVIDER_LABELS[provider]}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ProviderIcon({ provider }: { provider: LlmProvider }) {
  const iconClass = "w-4 h-4 rounded";
  
  switch (provider) {
    case 'openai':
      return <div className={`${iconClass} bg-green-500`} />;
    case 'azure-openai':
      return <div className={`${iconClass} bg-blue-500`} />;
    case 'anthropic':
      return <div className={`${iconClass} bg-orange-500`} />;
    case 'google':
      return <div className={`${iconClass} bg-red-500`} />;
    case 'openrouter':
      return <div className={`${iconClass} bg-purple-500`} />;
    case 'mistral':
      return <div className={`${iconClass} bg-yellow-500`} />;
    case 'together':
      return <div className={`${iconClass} bg-pink-500`} />;
    case 'groq':
      return <div className={`${iconClass} bg-indigo-500`} />;
    case 'perplexity':
      return <div className={`${iconClass} bg-cyan-500`} />;
    case 'cohere':
      return <div className={`${iconClass} bg-teal-500`} />;
    case 'xai':
      return <div className={`${iconClass} bg-gray-800`} />;
    case 'ollama':
      return <div className={`${iconClass} bg-gray-600`} />;
    case 'custom':
      return <div className={`${iconClass} bg-gray-400`} />;
    default:
      return <div className={`${iconClass} bg-gray-300`} />;
  }
}
