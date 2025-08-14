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
    const { title, model } = await request.json();
    
    if (!title || !model) {
      return NextResponse.json(
        { error: 'Title and model are required' },
        { status: 400 }
      );
    }

    const newChat = await ChatService.createChat(title, model);
    return NextResponse.json(newChat, { status: 201 });
  } catch (error) {
    console.error('POST /api/chats error:', error);
    return NextResponse.json(
      { error: 'Failed to create chat', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}