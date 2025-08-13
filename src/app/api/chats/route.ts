import { NextApiRequest, NextApiResponse } from 'next';
import { ChatService } from '../../../lib/services/chatService';
import { AIServiceManager } from '../../../ai/modelServices/serviceManager';

const aiManager = new AIServiceManager();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { chatId, message, model } = req.body;

    if (!chatId || !message || !model) {
      return res.status(400).json({ error: 'Chat ID, message, and model are required' });
    }

    // Get chat history
    const chat = await ChatService.getChatById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Add user message to database
    const userMessage = await ChatService.addMessage(chatId, 'user', message);

    // Convert to LangChain format and get AI response
    const chatHistory = ChatService.messagesToLangChain([...chat.messages, userMessage]);
    const aiResponse = await aiManager.getResponse(model, chatHistory);

    // Add AI response to database
    if (
      typeof aiResponse === 'object' &&
      aiResponse !== null &&
      'content' in aiResponse &&
      typeof (aiResponse as { content: unknown }).content === 'string'
    ) {
      const assistantMessage = await ChatService.addMessage(chatId, 'assistant', (aiResponse as { content: string }).content);

      res.status(200).json({
        userMsg: userMessage,
        assistantMsg: assistantMessage
      });
    } else {
      throw new Error('AI response does not have a valid content property');
    }
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
}