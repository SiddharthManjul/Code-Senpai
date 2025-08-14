// lib/services/aiService.ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import * as dotenv from 'dotenv';
dotenv.config();

export type ModelProvider = 'claude' | 'openai' | 'deepseek' | 'llama';

export interface ModelConfig {
  name: string;
  provider: ModelProvider;
  modelName: string;
  displayName: string;
  description: string;
  color: string;
}

export const MODEL_CONFIGS: ModelConfig[] = [
  // {
  //   name: 'claude-sonnet',
  //   provider: 'claude',
  //   modelName: 'claude-sonnet-4-20250514',
  //   displayName: 'Claude Sonnet 4',
  //   description: 'Anthropic\'s smart, efficient model for everyday use',
  //   color: 'text-orange-400'
  // },
  {
    name: 'gpt-5',
    provider: 'openai',
    modelName: 'gpt-5-nano',
    displayName: 'GPT-5-mini',
    description: 'OpenAI\'s most advanced multimodal model',
    color: 'text-green-400'
  },
  {
    name: 'deepseek-chat',
    provider: 'deepseek',
    modelName: 'deepseek-r1-distill-llama-70b',
    displayName: 'DeepSeek Chat',
    description: 'DeepSeek\'s conversational AI model',
    color: 'text-purple-400'
  },
  {
    name: 'llama-4',
    provider: 'llama',
    modelName: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    displayName: 'Llama 4 17B',
    description: 'Meta\'s open-source large language model',
    color: 'text-blue-400'
  }
];

export class AIServiceManager {
  private models: Map<string, { invoke: (messages: (SystemMessage | HumanMessage | AIMessage)[]) => Promise<unknown> }> = new Map();

  constructor() {
    this.initializeModels();
  }

  private initializeModels() {
    // Claude
    // this.models.set('claude-sonnet', new ChatAnthropic({
    //   modelName: "claude-sonnet-4-20250514",
    //   temperature: 0.7,
    //   anthropicApiKey: process.env.CLAUDE_API_KEY,
    //   maxTokens: 4096,
    // }));

    // OpenAI GPT-4o
    this.models.set('gpt-4', new ChatOpenAI({
      modelName: "gpt-5-nano",
      temperature: 1,
      apiKey: process.env.OPENAI_API_KEY,
      maxTokens: 4096,
    }));

    // DeepSeek (using OpenAI-compatible API)
    this.models.set('deepseek-chat', new ChatOpenAI({
      modelName: "deepseek-r1-distill-llama-70b",
      temperature: 0.7,
      apiKey: process.env.DEEPSEEK_API_KEY,
      maxTokens: 4096,
      configuration: {
        baseURL: "https://api.groq.com/openai/v1",
      },
    }));

    // Llama via Groq (fastest inference)
    this.models.set('llama-3', new ChatOpenAI({
      modelName: "meta-llama/llama-4-maverick-17b-128e-instruct",
      temperature: 0.7,
      apiKey: process.env.LLAMA_API_KEY,
      maxTokens: 4096,
      configuration: {
        baseURL: "https://api.groq.com/openai/v1",
      },
    }));
  }

  getModel(modelName: string) {
    const model = this.models.get(modelName);
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }
    return model;
  }

  async getResponse(
    modelName: string,
    chatHistory: (SystemMessage | HumanMessage | AIMessage)[]
  ) {
    const model = this.getModel(modelName);
    return await model.invoke(chatHistory);
  }

  initializeChatHistory() {
    return [
      new SystemMessage("You are a helpful AI assistant specialized in helping developers build projects. Provide clear, practical solutions with code examples when relevant."),
    ];
  }

  getAvailableModels() {
    return MODEL_CONFIGS;
  }
}