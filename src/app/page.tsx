/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Plus,
  MessageSquare,
  Settings,
  Trash2,
  Edit3,
  Code2,
  Zap,
  Bot,
  Terminal,
} from "lucide-react";

// Types
interface Message {
  id: string;
  role: "system" | "user" | "assistant";
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
  {
    name: "claude-sonnet",
    provider: "claude",
    displayName: "Claude Sonnet 4",
    description: "Anthropic's smart, efficient model for everyday use",
    color: "text-orange-400",
  },
  {
    name: "gpt-4",
    provider: "openai",
    displayName: "GPT-4o",
    description: "OpenAI's most advanced multimodal model",
    color: "text-green-400",
  },
  {
    name: "deepseek-chat",
    provider: "deepseek",
    displayName: "DeepSeek Chat",
    description: "DeepSeek's conversational AI model",
    color: "text-purple-400",
  },
  {
    name: "llama-3",
    provider: "llama",
    displayName: "Llama 3.1 70B",
    description: "Meta's open-source large language model",
    color: "text-blue-400",
  },
];

const DevChatInterface = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("claude-sonnet");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [newChatTitle, setNewChatTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/chats");

      if (!response.ok) {
        // Try to get error details from response
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || response.statusText;
        throw new Error(`Request failed: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from server");
      }

      setChats(data);
      if (data.length > 0 && !activeChat) {
        setActiveChat(data[0]);
      }
    } catch (error) {
      console.error("Failed to load chats:", error);
      setError(error instanceof Error ? error.message : "Failed to load chats");
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `New Chat ${new Date().toLocaleTimeString()}`,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newChat = await response.json();
      setChats([newChat, ...chats]);
      setActiveChat(newChat);
    } catch (error) {
      console.error("Failed to create chat:", error);
      setError(
        error instanceof Error ? error.message : "Failed to create chat"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeChat || isLoading) return;

    const userMessage = message.trim();
    setMessage("");
    setIsLoading(true);
    setError(null);

    // Declare tempUserMessage outside try/catch so it's accessible in both
    const tempUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      role: "user",
      content: userMessage,
      createdAt: new Date().toISOString(),
    };

    try {
      // Add user message to UI immediately
      setActiveChat((prev) => ({
        ...prev!,
        messages: [...prev!.messages, tempUserMessage],
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeChat.id,
          message: userMessage,
          model: activeChat.model,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { userMsg, assistantMsg } = await response.json();

      // Update chat with real messages
      setActiveChat((prev) => ({
        ...prev!,
        messages: [
          ...prev!.messages.filter((m) => m.id !== tempUserMessage.id),
          userMsg,
          assistantMsg,
        ],
      }));

      // Update chats list
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === activeChat.id
            ? {
                ...chat,
                messages: [
                  ...chat.messages.filter((m) => m.id !== tempUserMessage.id),
                  userMsg,
                  assistantMsg,
                ],
                updatedAt: new Date().toISOString(),
              }
            : chat
        )
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      setError(
        error instanceof Error ? error.message : "Failed to send message"
      );

      // Remove temp message on error
      setActiveChat((prev) => ({
        ...prev!,
        messages: prev!.messages.filter((m) => m.id !== tempUserMessage.id),
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/chats?chatId=${chatId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedChats = chats.filter((chat) => chat.id !== chatId);
      setChats(updatedChats);

      if (activeChat?.id === chatId) {
        setActiveChat(updatedChats[0] || null);
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete chat"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateChatTitle = async (chatId: string, title: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/chats?chatId=${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setChats((prev) =>
        prev.map((chat) => (chat.id === chatId ? { ...chat, title } : chat))
      );

      if (activeChat?.id === chatId) {
        setActiveChat((prev) => ({ ...prev!, title }));
      }
    } catch (error) {
      console.error("Failed to update chat title:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update chat title"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getModelIcon = (provider: string) => {
    switch (provider) {
      case "claude":
        return <Bot className="w-4 h-4 text-orange-400" />;
      case "openai":
        return <Zap className="w-4 h-4 text-green-400" />;
      case "deepseek":
        return <Code2 className="w-4 h-4 text-purple-400" />;
      case "llama":
        return <Terminal className="w-4 h-4 text-blue-400" />;
      default:
        return <Terminal className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatMessageContent = (content: string): { __html: string } => {
    // Escape HTML first
    let html = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // Convert markdown code blocks with optional language
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const langClass = lang ? `language-${lang}` : "";
      return `<pre class="bg-gray-800 rounded-lg p-4 my-2 overflow-x-auto"><code class="${langClass}">${code.trim()}</code></pre>`;
    });

    // Convert inline code
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>'
    );

    // Convert links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Convert line breaks (handle both \n and \r\n)
    html = html.replace(/\r?\n/g, "<br />");

    // Convert bold text
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");

    // Convert italic text
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    html = html.replace(/_([^_]+)_/g, "<em>$1</em>");

    return { __html: html };
  };
  // ... [rest of the helper functions remain the same]

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
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors focus-ring"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={createNewChat}
            disabled={isLoading}
            className="w-full flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors focus-ring"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-900/50 text-red-200 text-sm border-b border-red-800">
            <p>{error}</p>
          </div>
        )}

        {/* Model Selector */}
        {showSettings && (
          <div className="p-4 border-b border-gray-700 bg-gray-750 fade-in">
            <label className="block text-sm font-medium mb-2">
              Select Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus-ring"
              disabled={isLoading}
            >
              {MODELS.map((model) => (
                <option key={model.name} value={model.name}>
                  {model.displayName}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-2">
              {MODELS.find((m) => m.name === selectedModel)?.description}
            </p>
          </div>
        )}

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && chats.length === 0 ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-400"></div>
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No chats available. Create a new chat to get started.
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors group ${
                  activeChat?.id === chat.id
                    ? "bg-gray-700 border-l-4 border-l-cyan-400"
                    : ""
                }`}
                onClick={() => !isLoading && setActiveChat(chat)}
              >
                {/* ... [rest of the chat list item remains the same] */}
              </div>
            ))
          )}
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
                  <div
                    className={`flex items-center space-x-1 text-sm ${
                      MODELS.find((m) => m.name === activeChat.model)?.color ||
                      "text-gray-400"
                    }`}
                  >
                    {getModelIcon(
                      MODELS.find((m) => m.name === activeChat.model)
                        ?.provider || "custom"
                    )}
                    <span>
                      {MODELS.find((m) => m.name === activeChat.model)
                        ?.displayName || activeChat.model}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeChat.messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Start a conversation with your AI assistant
                </div>
              ) : (
                <>
                  {activeChat.messages
                    .filter((msg) => msg.role !== "system")
                    .map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        } fade-in`}
                      >
                        <div
                          className={`max-w-3xl p-4 rounded-lg ${
                            msg.role === "user"
                              ? "bg-cyan-600 text-white ml-12"
                              : "bg-gray-700 text-gray-100 mr-12"
                          }`}
                        >
                          <div
                            className="message-content whitespace-pre-wrap"
                            dangerouslySetInnerHTML={formatMessageContent(
                              msg.content
                            )}
                          />
                          <div className="text-xs opacity-70 mt-2">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                </>
              )}

              {isLoading && (
                <div className="flex justify-start fade-in">
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
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && sendMessage()
                  }
                  placeholder="Ask your AI assistant anything..."
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus-ring placeholder-gray-400"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!message.trim() || isLoading}
                  className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed p-2 rounded-lg transition-colors focus-ring"
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
