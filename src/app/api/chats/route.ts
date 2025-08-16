// app/api/chats/route.ts
import { NextResponse } from 'next/server'
import { ChatService } from '@/lib/services/chatService'

export async function GET() {
  try {
    const chats = await ChatService.getChats();
    return NextResponse.json(chats);
  } catch (error) {
    console.error('GET /api/chats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { title, model, initialMessage } = await request.json();
    
    if (!title || !model) {
      return NextResponse.json(
        { error: 'Title and model are required' },
        { status: 400 }
      );
    }

    // Validate initialMessage structure if provided
    if (initialMessage && (!initialMessage.role || !initialMessage.content)) {
      return NextResponse.json(
        { error: 'Initial message must have role and content' },
        { status: 400 }
      );
    }

    const newChat = await ChatService.createChat(title, model, initialMessage);
    return NextResponse.json(newChat, { status: 201 });
  } catch (error) {
    console.error('POST /api/chats error:', error);
    return NextResponse.json(
      { error: 'Failed to create chat', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    await ChatService.deleteChat(chatId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/chats error:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const { title } = await request.json();

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const updatedChat = await ChatService.updateChatTitle(chatId, title);
    return NextResponse.json(updatedChat);
  } catch (error) {
    console.error('PATCH /api/chats error:', error);
    return NextResponse.json(
      { error: 'Failed to update chat', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}