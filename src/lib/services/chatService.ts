import { prisma } from "../db";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";

export type MessageRole = "system" | "user" | "assistant";

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

export interface InitialMessage {
  id?: string;
  role: MessageRole;
  content: string;
  createdAt?: string;
}

export class ChatService {
  private static handleError(methodName: string, error: unknown): never {
    console.error(`ChatService.${methodName} error:`, error);
    throw new Error(
      error instanceof Error
        ? error.message
        : `Failed to execute ${methodName} operation`
    );
  }

  static async createChat(
    title: string,
    model: string,
    initialMessage?: InitialMessage
  ): Promise<ChatWithMessages> {
    try {
      // Prepare messages to create
      const messagesToCreate = [];

      // Always add the system message first
      messagesToCreate.push({
        role: "system" as MessageRole,
        content:
          "You are a helpful AI assistant specialized in helping developers build projects. Provide clear, practical solutions with code examples when relevant.",
      });

      // Add initial message if provided (this will be the welcome message)
      if (initialMessage) {
        messagesToCreate.push({
          role: initialMessage.role,
          content: initialMessage.content,
        });
      }

      return await prisma.chat.create({
        data: {
          title,
          model,
          messages: {
            create: messagesToCreate,
          },
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    } catch (error) {
      this.handleError("createChat", error);
    }
  }

  static async getChats(): Promise<ChatWithMessages[]> {
    try {
      return await prisma.chat.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    } catch (error) {
      this.handleError("getChats", error);
    }
  }

  static async getChatById(id: string): Promise<ChatWithMessages | null> {
    try {
      return await prisma.chat.findUnique({
        where: { id },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    } catch (error) {
      this.handleError("getChatById", error);
    }
  }

  static async addMessage(
    chatId: string,
    role: MessageRole,
    content: string
  ): Promise<{
    id: string;
    role: MessageRole;
    content: string;
    createdAt: Date;
  }> {
    try {
      const message = await prisma.message.create({
        data: {
          chatId,
          role,
          content,
        },
      });

      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      });

      return message;
    } catch (error) {
      this.handleError("addMessage", error);
    }
  }

  static async deleteChat(id: string): Promise<void> {
    try {
      await prisma.$transaction([
        prisma.message.deleteMany({
          where: { chatId: id },
        }),
        prisma.chat.delete({
          where: { id },
        }),
      ]);
    } catch (error) {
      this.handleError("deleteChat", error);
    }
  }

  static async updateChatTitle(
    id: string,
    title: string
  ): Promise<ChatWithMessages> {
    try {
      return await prisma.chat.update({
        where: { id },
        data: { title },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    } catch (error) {
      this.handleError("updateChatTitle", error);
    }
  }

  static messagesToLangChain(
    messages: ChatWithMessages["messages"]
  ): (SystemMessage | HumanMessage | AIMessage)[] {
    try {
      return messages.map((msg) => {
        switch (msg.role) {
          case "system":
            return new SystemMessage(msg.content);
          case "user":
            return new HumanMessage(msg.content);
          case "assistant":
            return new AIMessage(msg.content);
          default:
            throw new Error(`Unknown message role: ${msg.role}`);
        }
      });
    } catch (error) {
      this.handleError("messagesToLangChain", error);
    }
  }
}