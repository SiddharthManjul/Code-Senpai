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
  private static async findOrCreateUser(identifier: UserIdentifier): Promise<string> {
    try {
      if (!identifier.walletAddress && !identifier.email) {
        throw new Error("Either walletAddress or email must be provided");
      }

      const userData = {
        walletAddress: identifier.walletAddress,
        email: identifier.email
      };

      const user = await prisma.user.upsert({
        where: {
          walletAddress: identifier.walletAddress || undefined,
          email: identifier.email || undefined
        },
        create: userData,
        update: userData
      });

      return user.id;
    } catch (error) {
      this.handleError("findOrCreateUser", error);
    }
  }

  /**
   * Verify chat belongs to user
   */
  private static async verifyChatOwnership(chatId: string, userId: string): Promise<void> {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId }
    });

    if (!chat || chat.userId !== userId) {
      throw new Error("Chat not found or access denied");
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

      const messagesToCreate = [
        {
          role: "system" as const,
          content: "You are a helpful AI assistant specialized in helping developers build projects."
        },
        ...(initialMessage ? [{
          role: initialMessage.role,
          content: initialMessage.content
        }] : [])
      ];

      return await prisma.chat.create({
        data: {
          title,
          model,
          userId,
          messages: {
            create: messagesToCreate
          }
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" }
          }
        }
      });
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
            orderBy: { createdAt: "asc" }
          }
        }
      });
    } catch (error) {
      this.handleError("getChats", error);
    }
  }

  /**
   * Get a specific chat by ID, ensuring it belongs to the user
   */
  static async getChatById(
    chatId: string,
    userIdentifier: UserIdentifier
  ): Promise<ChatWithMessages | null> {
    try {
      const userId = await this.findOrCreateUser(userIdentifier);
      
      return await prisma.chat.findFirst({
        where: { 
          id: chatId,
          userId 
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" }
          }
        }
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
      await this.verifyChatOwnership(chatId, userId);

      const message = await prisma.message.create({
        data: {
          chatId,
          role,
          content
        }
      });

      await prisma.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() }
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
    chatId: string,
    userIdentifier: UserIdentifier
  ): Promise<void> {
    try {
      const userId = await this.findOrCreateUser(userIdentifier);
      await this.verifyChatOwnership(chatId, userId);

      await prisma.$transaction([
        prisma.message.deleteMany({
          where: { chatId }
        }),
        prisma.chat.delete({
          where: { id: chatId }
        })
      ]);
    } catch (error) {
      this.handleError("deleteChat", error);
    }
  }

  /**
   * Update chat title, ensuring it belongs to the user
   */
  static async updateChatTitle(
    chatId: string,
    title: string,
    userIdentifier: UserIdentifier
  ): Promise<ChatWithMessages> {
    try {
      const userId = await this.findOrCreateUser(userIdentifier);
      await this.verifyChatOwnership(chatId, userId);

      return await prisma.chat.update({
        where: { id: chatId },
        data: { title },
        include: {
          messages: {
            orderBy: { createdAt: "asc" }
          }
        }
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