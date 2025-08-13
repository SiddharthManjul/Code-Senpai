import { NextApiRequest, NextApiResponse } from 'next';
import { ChatService } from '../../../../lib/services/chatService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid chat ID' });
  }

  try {
    if (req.method === 'GET') {
      const chat = await ChatService.getChatById(id);
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }
      return res.status(200).json(chat);
    }

    if (req.method === 'DELETE') {
      await ChatService.deleteChat(id);
      return res.status(200).json({ message: 'Chat deleted successfully' });
    }

    if (req.method === 'PATCH') {
      const { title } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }
      
      const chat = await ChatService.updateChatTitle(id, title);
      return res.status(200).json(chat);
    }

    res.setHeader('Allow', ['GET', 'DELETE', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}