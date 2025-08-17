import { NextResponse } from 'next/server';
import { ChatService } from '../../../../lib/services/chatService';

// Helper function to get user identifier from request
async function getUserIdentifierFromRequest(request: Request) {
  try {
    // For GET requests, check URL search params
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const walletAddress = url.searchParams.get('walletAddress');
      const email = url.searchParams.get('email');
      
      if (!walletAddress && !email) {
        return null;
      }
      
      return { walletAddress: walletAddress || undefined, email: email || undefined };
    }
    
    // For POST/PATCH/DELETE requests, get from request body
    const body = await request.json();
    return body.userIdentifier || null;
  } catch {
    return null;
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid chat ID' }, { status: 400 });
    }

    // Get user identifier from query parameters
    const userIdentifier = await getUserIdentifierFromRequest(request);
    if (!userIdentifier || (!userIdentifier.walletAddress && !userIdentifier.email)) {
      return NextResponse.json(
        { error: 'User identifier (walletAddress or email) is required as query parameter' },
        { status: 400 }
      );
    }

    const chat = await ChatService.getChatById(id, userIdentifier);
    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(chat, { status: 200 });
  } catch (error) {
    console.error('GET Chat Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get chat',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid chat ID' }, { status: 400 });
    }

    // Get user identifier from request body
    const userIdentifier = await getUserIdentifierFromRequest(request);
    if (!userIdentifier || (!userIdentifier.walletAddress && !userIdentifier.email)) {
      return NextResponse.json(
        { error: 'User identifier (walletAddress or email) is required in request body' },
        { status: 400 }
      );
    }

    await ChatService.deleteChat(id, userIdentifier);
    return NextResponse.json(
      { message: 'Chat deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE Chat Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete chat',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid chat ID' }, { status: 400 });
    }

    const body = await request.json();
    const { title, userIdentifier } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!userIdentifier || (!userIdentifier.walletAddress && !userIdentifier.email)) {
      return NextResponse.json(
        { error: 'User identifier (walletAddress or email) is required' },
        { status: 400 }
      );
    }

    const chat = await ChatService.updateChatTitle(id, title, userIdentifier);
    return NextResponse.json(chat, { status: 200 });
  } catch (error) {
    console.error('PATCH Chat Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update chat',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}