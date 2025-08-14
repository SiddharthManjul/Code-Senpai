import { prisma } from '../db';
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';

// Define MessageRole type manually
export type MessageRole = 'system' | 'user' | 'assistant';

export interface ChatWithMessages {
  id: string;
  title: string;
  model: string;
  createdAt: Date;
  updatedAt: Date;
  messages: {
    id: string;
    role: MessageRole;
    content: string;
    createdAt: Date;
  }[];
}

export class ChatService {
  static async createChat(title: string, model: string): Promise<ChatWithMessages> {
    return await prisma.chat.create({
      data: {
        title,
        model,
        messages: {
          create: {
            role: 'system',
            content: 'You are a helpful AI assistant specialized in helping developers build projects. Provide clear, practical solutions with code examples when relevant.',
          },
        },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  static async getChats(): Promise<ChatWithMessages[]> {
    return await prisma.chat.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  static async getChatById(id: string): Promise<ChatWithMessages | null> {
    return await prisma.chat.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  static async addMessage(chatId: string, role: MessageRole, content: string) {
    const message = await prisma.message.create({
      data: {
        chatId,
        role,
        content,
      },
    });

    // Update chat timestamp
    await prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  static async deleteChat(id: string) {
    // First delete all messages to avoid foreign key constraint errors
    await prisma.message.deleteMany({
      where: { chatId: id },
    });

    // Then delete the chat
    return await prisma.chat.delete({
      where: { id },
    });
  }

  static async updateChatTitle(id: string, title: string): Promise<ChatWithMessages> {
    return await prisma.chat.update({
      where: { id },
      data: { title },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  static messagesToLangChain(messages: ChatWithMessages['messages']) {
    return messages.map(msg => {
      switch (msg.role) {
        case 'system':
          return new SystemMessage(msg.content);
        case 'user':
          return new HumanMessage(msg.content);
        case 'assistant':
          return new AIMessage(msg.content);
        default:
          throw new Error(`Unknown message role: ${msg.role}`);
      }
    });
  }
}