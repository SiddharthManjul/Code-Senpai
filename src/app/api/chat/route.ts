import { NextResponse } from 'next/server';
import { ChatService } from '@/lib/services/chatService';
import { AIServiceManager } from '@/ai/modelServices/serviceManager';

const aiManager = new AIServiceManager();

export async function POST(request: Request) {
  try {
    const { chatId, message, model } = await request.json();

    if (!chatId || !message || !model) {
      return NextResponse.json(
        { error: 'Chat ID, message, and model are required' },
        { status: 400 }
      );
    }

    // Get chat history
    const chat = await ChatService.getChatById(chatId);
    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    // Add user message to database
    const userMessage = await ChatService.addMessage(chatId, 'user', message);

    // Convert to LangChain format and get AI response
    const chatHistory = ChatService.messagesToLangChain([...chat.messages, userMessage]);
    const aiResponse = await aiManager.getResponse(model, chatHistory);

    // Add AI response to database
    if (typeof aiResponse === 'object' && aiResponse !== null && 'content' in aiResponse) {
      const assistantMessage = await ChatService.addMessage(
        chatId,
        'assistant',
        typeof aiResponse.content === 'string' ? aiResponse.content : String(aiResponse.content)
      );

      return NextResponse.json({
        userMsg: userMessage,
        assistantMsg: assistantMessage
      });
    }

    throw new Error('AI response does not have a valid content property');
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}