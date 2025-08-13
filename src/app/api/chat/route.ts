import { NextApiRequest, NextApiResponse } from 'next';
import { ChatService } from '../../../lib/services/chatService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const chats = await ChatService.getChats();
      return res.status(200).json(chats);
    }

    if (req.method === 'POST') {
      const { title, model } = req.body;
      
      if (!title || !model) {
        return res.status(400).json({ error: 'Title and model are required' });
      }

      const chat = await ChatService.createChat(title, model);
      return res.status(201).json(chat);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}