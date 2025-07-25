import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.warn('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file');
}

const openai = new OpenAI({
  apiKey: apiKey || 'placeholder-key',
  dangerouslyAllowBrowser: true
});

export { openai };