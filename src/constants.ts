import { CLAISettings } from './types';

export const DEFAULT_SETTINGS: CLAISettings = {
    provider: 'openai',
    apiKey: '',
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
    workflowFolder: 'clai-workflows',
};

export const DEFAULT_URLS: Record<CLAISettings['provider'], string> = {
    'openai': 'https://api.openai.com/v1/chat/completions',
    'openrouter': 'https://api.openrouter.ai/v1/chat/completions',
    'custom': 'https://your-custom-api.com/v1/chat/completions',
};
