/* eslint-disable @typescript-eslint/no-explicit-any */
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
  userId: string;
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

export interface UserIdentifier {
  walletAddress?: string;
  email?: string;
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

  /**
   * Find or create a user based on wallet address or email
   */
  static async findOrCreateUser(identifier: UserIdentifier): Promise<string> {
    try {
      if (!identifier.walletAddress && !identifier.email) {
        throw new Error("Either walletAddress or email must be provided");
      }

      let user;

      // Try to find existing user
      if (identifier.walletAddress) {
        user = await (prisma as any).user.findUnique({
          where: { walletAddress: identifier.walletAddress },
        });
      } else if (identifier.email) {
        user = await (prisma as any).user.findUnique({
          where: { email: identifier.email },
        });
      }

      // Create user if not found
      if (!user) {
        const userData: any = {};
        if (identifier.walletAddress) {
          userData.walletAddress = identifier.walletAddress;
        }
        if (identifier.email) {
          userData.email = identifier.email;
        }

        user = await (prisma as any).user.create({
          data: userData,
        });
      }

      return user.id;
    } catch (error) {
      this.handleError("findOrCreateUser", error);
    }
  }

  /**
   * Create a new chat for a specific user
   */
  static async createChat(
    title: string,
    model: string,
    userIdentifier: UserIdentifier,
    initialMessage?: InitialMessage
  ): Promise<ChatWithMessages> {
    try {
      const userId = await this.findOrCreateUser(userIdentifier);

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

      const chat = await prisma.chat.create({
        data: {
          title,
          model,
          user: {
            connect: { id: userId },
          },
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

      // Ensure the returned object matches ChatWithMessages type
      return {
        id: chat.id,
        title: chat.title,
        model: chat.model,
        userId: chat.userId,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messages: chat.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt,
        })),
      };
    } catch (error) {
      this.handleError("createChat", error);
    }
  }

  /**
   * Get all chats for a specific user
   */
  static async getChats(userIdentifier: UserIdentifier): Promise<ChatWithMessages[]> {
    try {
      const userId = await this.findOrCreateUser(userIdentifier);

      return await prisma.chat.findMany({
        where: { userId },
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

  /**
   * Get a specific chat by ID, ensuring it belongs to the user
   */
  static async getChatById(
    id: string,
    userIdentifier: UserIdentifier
  ): Promise<ChatWithMessages | null> {
    try {
      const userId = await this.findOrCreateUser(userIdentifier);

      return await prisma.chat.findFirst({
        where: { 
          id,
          userId 
        },
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

  /**
   * Add a message to a chat, ensuring the chat belongs to the user
   */
  static async addMessage(
    chatId: string,
    role: MessageRole,
    content: string,
    userIdentifier: UserIdentifier
  ): Promise<{
    id: string;
    role: MessageRole;
    content: string;
    createdAt: Date;
  }> {
    try {
      const userId = await this.findOrCreateUser(userIdentifier);

      // Verify the chat belongs to the user
      const chat = await (prisma as any).chat.findFirst({
        where: { 
          id: chatId,
          userId 
        },
      });

      if (!chat) {
        throw new Error("Chat not found or access denied");
      }

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

  /**
   * Delete a chat, ensuring it belongs to the user
   */
  static async deleteChat(
    id: string,
    userIdentifier: UserIdentifier
  ): Promise<void> {
    try {
      const userId = await this.findOrCreateUser(userIdentifier);

      // Verify the chat belongs to the user
      const chat = await (prisma as any).chat.findFirst({
        where: { 
          id,
          userId 
        },
      });

      if (!chat) {
        throw new Error("Chat not found or access denied");
      }

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

  /**
   * Update chat title, ensuring it belongs to the user
   */
  static async updateChatTitle(
    id: string,
    title: string,
    userIdentifier: UserIdentifier
  ): Promise<ChatWithMessages> {
    try {
      const userId = await this.findOrCreateUser(userIdentifier);

      // Verify the chat belongs to the user
      const chat = await (prisma as any).chat.findFirst({
        where: { 
          id,
          userId 
        },
      });

      if (!chat) {
        throw new Error("Chat not found or access denied");
      }

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

  /**
   * Convert messages to LangChain format
   */
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