import { ChatService } from '../../../../lib/services/chatService';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id || typeof id !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid chat ID' }), { status: 400 });
  }

  const chat = await ChatService.getChatById(id);
  if (!chat) {
    return new Response(JSON.stringify({ error: 'Chat not found' }), { status: 404 });
  }
  return new Response(JSON.stringify(chat), { status: 200 });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id || typeof id !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid chat ID' }), { status: 400 });
  }

  await ChatService.deleteChat(id);
  return new Response(JSON.stringify({ message: 'Chat deleted successfully' }), { status: 200 });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id || typeof id !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid chat ID' }), { status: 400 });
  }

  const body = await request.json();
  const { title } = body;
  if (!title) {
    return new Response(JSON.stringify({ error: 'Title is required' }), { status: 400 });
  }

  const chat = await ChatService.updateChatTitle(id, title);
  return new Response(JSON.stringify(chat), { status: 200 });
}