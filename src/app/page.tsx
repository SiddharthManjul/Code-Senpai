"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, MessageSquare, Settings, Trash2, Edit3, Code2, Zap, Bot, Terminal } from 'lucide-react';

// Types
interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Chat {
  id: string;
  title: string;
  model: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

interface ModelConfig {
  name: string;
  provider: string;
  displayName: string;
  description: string;
  color: string;
}

const MODELS: ModelConfig[] = [
  { name: 'claude-sonnet', provider: 'claude', displayName: 'Claude Sonnet 4', description: 'Anthropic\'s smart, efficient model for everyday use', color: 'text-orange-400' },
  { name: 'gpt-4', provider: 'openai', displayName: 'GPT-4o', description: 'OpenAI\'s most advanced multimodal model', color: 'text-green-400' },
  { name: 'deepseek-chat', provider: 'deepseek', displayName: 'DeepSeek Chat', description: 'DeepSeek\'s conversational AI model', color: 'text-purple-400' },
  { name: 'llama-3', provider: 'llama', displayName: 'Llama 3.1 70B', description: 'Meta\'s open-source large language model', color: 'text-blue-400' }
];

const DevChatInterface = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('claude-sonnet');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newChatTitle, setNewChatTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChats = async () => {
    try {
      const response = await fetch('/api/chats');
      const data = await response.json();
      setChats(data);
      if (data.length > 0 && !activeChat) {
        setActiveChat(data[0]);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `New Chat ${new Date().toLocaleTimeString()}`,
          model: selectedModel 
        })
      });
      const newChat = await response.json();
      setChats([newChat, ...chats]);
      setActiveChat(newChat);
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeChat || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    try {
      // Add user message to UI immediately
      const tempUserMessage: Message = {
        id: 'temp-user',
        role: 'user',
        content: userMessage,
        createdAt: new Date().toISOString()
      };
      
      setActiveChat(prev => ({
        ...prev!,
        messages: [...prev!.messages, tempUserMessage]
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: activeChat.id,
          message: userMessage,
          model: activeChat.model
        })
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const { userMsg, assistantMsg } = await response.json();
      
      // Update chat with real messages
      setActiveChat(prev => ({
        ...prev!,
        messages: [...prev!.messages.slice(0, -1), userMsg, assistantMsg]
      }));

      // Update chats list
      setChats(prev => prev.map(chat => 
        chat.id === activeChat.id 
          ? { ...chat, messages: [...chat.messages, userMsg, assistantMsg], updatedAt: new Date().toISOString() }
          : chat
      ));

    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove temp message on error
      setActiveChat(prev => ({
        ...prev!,
        messages: prev!.messages.slice(0, -1)
      }));
    }

    setIsLoading(false);
  };

  const deleteChat = async (chatId: string) => {
    try {
      await fetch(`/api/chats/${chatId}`, { method: 'DELETE' });
      const updatedChats = chats.filter(chat => chat.id !== chatId);
      setChats(updatedChats);
      
      if (activeChat?.id === chatId) {
        setActiveChat(updatedChats[0] || null);
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const updateChatTitle = async (chatId: string, title: string) => {
    try {
      await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, title } : chat
      ));
      
      if (activeChat?.id === chatId) {
        setActiveChat(prev => ({ ...prev!, title }));
      }
    } catch (error) {
      console.error('Failed to update chat title:', error);
    }
  };

  const getModelIcon = (provider: string) => {
    switch (provider) {
      case 'claude': return <Bot className="w-4 h-4 text-orange-400" />;
      case 'openai': return <Zap className="w-4 h-4 text-green-400" />;
      case 'deepseek': return <Code2 className="w-4 h-4 text-purple-400" />;
      case 'llama': return <Terminal className="w-4 h-4 text-blue-400" />;
      default: return <Terminal className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Terminal className="w-6 h-6 text-cyan-400" />
              <h1 className="text-xl font-bold">Code Senpai</h1>
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          <button
            onClick={createNewChat}
            className="w-full flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Model Selector */}
        {showSettings && (
          <div className="p-4 border-b border-gray-700 bg-gray-750">
            <label className="block text-sm font-medium mb-2">Select Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {MODELS.map(model => (
                <option key={model.name} value={model.name}>
                  {model.displayName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors group ${
                activeChat?.id === chat.id ? 'bg-gray-700 border-l-4 border-l-cyan-400' : ''
              }`}
              onClick={() => setActiveChat(chat)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {editingChatId === chat.id ? (
                    <input
                      value={newChatTitle}
                      onChange={(e) => setNewChatTitle(e.target.value)}
                      onBlur={() => {
                        updateChatTitle(chat.id, newChatTitle);
                        setEditingChatId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateChatTitle(chat.id, newChatTitle);
                          setEditingChatId(null);
                        }
                      }}
                      className="w-full bg-transparent border-b border-cyan-400 focus:outline-none text-sm"
                      autoFocus
                    />
                  ) : (
                    <h3 className="font-medium truncate text-sm">{chat.title}</h3>
                  )}
                  <div className="flex items-center space-x-2 mt-1">
                    {getModelIcon(MODELS.find(m => m.name === chat.model)?.provider || 'custom')}
                    <span className="text-xs text-gray-400">
                      {MODELS.find(m => m.name === chat.model)?.displayName || chat.model}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingChatId(chat.id);
                      setNewChatTitle(chat.title);
                    }}
                    className="p-1 hover:bg-gray-600 rounded"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    className="p-1 hover:bg-red-600 rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-semibold">{activeChat.title}</h2>
                  <div className={`flex items-center space-x-1 text-sm ${MODELS.find(m => m.name === activeChat.model)?.color || 'text-gray-400'}`}>
                    {getModelIcon(MODELS.find(m => m.name === activeChat.model)?.provider || 'custom')}
                    <span>{MODELS.find(m => m.name === activeChat.model)?.displayName || activeChat.model}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeChat.messages
                .filter(msg => msg.role !== 'system')
                .map(msg => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-3xl p-4 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-cyan-600 text-white ml-12' 
                      : 'bg-gray-700 text-gray-100 mr-12'
                  }`}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    <div className="text-xs opacity-70 mt-2">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 p-4 rounded-lg mr-12">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-700 bg-gray-800">
              <div className="flex space-x-3">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  placeholder="Ask your AI assistant anything..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || isLoading}
                  className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-2 rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Terminal className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
              <h3 className="text-xl mb-2">Welcome to Code Senpai</h3>
              <p>Select a chat or create a new one to get started</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevChatInterface;