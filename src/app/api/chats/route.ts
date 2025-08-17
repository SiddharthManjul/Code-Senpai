 
// app/api/chats/route.ts
import { NextResponse } from 'next/server';
import { ChatService } from '../../../lib/services/chatService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    const email = searchParams.get('email');

    if (!walletAddress && !email) {
      return new Response(JSON.stringify({ error: 'walletAddress or email required' }), { status: 400 });
    }

    const chats = await ChatService.getChats({ walletAddress: walletAddress || undefined, email: email || undefined });
    return new Response(JSON.stringify(chats), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to get chats', details: error instanceof Error ? error.message : String(error) }), { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, model, initialMessage, userIdentifier } = body;
    
    if (!title || !model) {
      return NextResponse.json(
        { error: 'Title and model are required' },
        { status: 400 }
      );
    }

    if (!userIdentifier || (!userIdentifier.walletAddress && !userIdentifier.email)) {
      return NextResponse.json(
        { error: 'User identifier (walletAddress or email) is required' },
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

    const newChat = await ChatService.createChat(title, model, userIdentifier, initialMessage);
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
    const url = new URL(request.url);
    const chatId = url.searchParams.get('chatId');
    const userIdentifier = getUserIdentifierFromQuery(url);

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    if (!userIdentifier || (!userIdentifier.walletAddress && !userIdentifier.email)) {
      return NextResponse.json(
        { error: 'User identifier (walletAddress or email) is required as query parameter' },
        { status: 400 }
      );
    }

    await ChatService.deleteChat(chatId, userIdentifier);
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
    const url = new URL(request.url);
    const chatId = url.searchParams.get('chatId');
    const body = await request.json();
    const { title, userIdentifier } = body;

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

    if (!userIdentifier || (!userIdentifier.walletAddress && !userIdentifier.email)) {
      return NextResponse.json(
        { error: 'User identifier (walletAddress or email) is required' },
        { status: 400 }
      );
    }

    const updatedChat = await ChatService.updateChatTitle(chatId, title, userIdentifier);
    return NextResponse.json(updatedChat);
  } catch (error) {
    console.error('PATCH /api/chats error:', error);
    return NextResponse.json(
      { error: 'Failed to update chat', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
function getUserIdentifierFromQuery(url: URL) {
  const walletAddress = url.searchParams.get('walletAddress');
  const email = url.searchParams.get('email');
  if (walletAddress || email) {
    return {
      walletAddress: walletAddress || undefined,
      email: email || undefined,
    };
  }
  return null;
}
