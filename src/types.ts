export interface CLAISettings {
    provider: 'openai' | 'openrouter' | 'custom';
    apiKey: string;
    url: string;
    model: string;
    workflowFolder: string;
}
