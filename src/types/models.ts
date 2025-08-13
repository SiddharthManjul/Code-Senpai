// types/models.ts
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";

export type ModelType = 'claude' | 'deepseek' | 'llama' | 'openai';

export interface ModelResponse {
  content: string;
  // Add any other common response fields here
}

export interface AIModel {
  invoke: (chatHistory: (SystemMessage | HumanMessage | AIMessage)[]) => Promise<ModelResponse>;
  initializeChatHistory: () => (SystemMessage | HumanMessage | AIMessage)[];
}