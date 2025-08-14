import { NextApiRequest, NextApiResponse } from 'next';
import { ChatService } from '../../../lib/services/chatService';
import { AIServiceManager } from '../../../ai/modelServices/serviceManager';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const aiManager = new AIServiceManager();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return handleGetChats(req, res);
      case 'POST':
        return handleCreateChat(req, res);
      case 'DELETE':
        return handleDeleteChat(req, res);
      case 'PATCH':
        return handleUpdateChat(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PATCH']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetChats(req: NextApiRequest, res: NextApiResponse) {
  try {
    const chats = await ChatService.getChats();
    return res.status(200).json(chats);
  } catch (error) {
    console.error('Failed to get chats:', error);
    return res.status(500).json({ error: 'Failed to fetch chats' });
  }
}

async function handleCreateChat(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { title, model } = req.body;

    if (!title || !model) {
      return res.status(400).json({ error: 'Title and model are required' });
    }

    const newChat = await ChatService.createChat(title, model);
    return res.status(201).json(newChat);
  } catch (error) {
    console.error('Failed to create chat:', error);
    return res.status(500).json({ error: 'Failed to create chat' });
  }
}

async function handleDeleteChat(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { chatId } = req.query;
    
    if (!chatId || typeof chatId !== 'string') {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    await ChatService.deleteChat(chatId);
    return res.status(204).end();
  } catch (error) {
    console.error('Failed to delete chat:', error);
    return res.status(500).json({ error: 'Failed to delete chat' });
  }
}

async function handleUpdateChat(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { chatId } = req.query;
    const { title } = req.body;

    if (!chatId || typeof chatId !== 'string') {
      return res.status(400).json({ error: 'Chat ID is required' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const updatedChat = await ChatService.updateChatTitle(chatId, title);
    return res.status(200).json(updatedChat);
  } catch (error) {
    console.error('Failed to update chat:', error);
    return res.status(500).json({ error: 'Failed to update chat' });
  }
}