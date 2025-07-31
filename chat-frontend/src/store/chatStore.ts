import { create } from 'zustand';
import { Chat, Message, User, TypingUser } from '../types';
import { getChatId, isSameChat } from '../utils/helpers';
import api from '../services/api';
import socketService from '../services/socket';
import toast from 'react-hot-toast';

interface ChatStore {
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  typingUsers: TypingUser[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchChats: () => Promise<void>;
  setCurrentChat: (chat: Chat | null) => void;
  fetchMessages: (chatId: string, page?: number) => Promise<void>;
  sendMessage: (chatId: string, content: string, replyTo?: string) => Promise<void>;
  createChat: (participantIds: string[], isGroup: boolean, name?: string) => Promise<Chat>;
  addTypingUser: (user: TypingUser) => void;
  removeTypingUser: (userId: string, chatId: string) => void;
  addMessage: (message: Message) => void;
  markMessagesAsRead: (chatId: string) => Promise<void>;
  updateChat: (chat: Chat) => void;
  clearError: () => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  currentChat: null,
  messages: [],
  typingUsers: [],
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchChats: async () => {
    try {
      set({ isLoading: true, error: null });
      console.log('Fetching chats...');
      
      const response = await api.get('/chat');
      console.log('Chats response:', response.data);
      
      const chats = response.data.chats || response.data || [];
      set({ chats, isLoading: false });
      
      console.log('Loaded chats:', chats.length);
    } catch (error: any) {
      console.error('Failed to fetch chats:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch chats';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  setCurrentChat: (chat: Chat | null) => {
    const { currentChat } = get();
    
    // Leave current chat room
    if (currentChat) {
      socketService.leaveChat(getChatId(currentChat));
    }
    
    // Join new chat room and fetch messages
    if (chat) {
      socketService.joinChat(getChatId(chat));
      get().fetchMessages(getChatId(chat));
    }
    
    set({ currentChat: chat, messages: [], error: null });
  },

  fetchMessages: async (chatId: string, page = 1) => {
    try {
      set({ isLoading: page === 1, error: null });
      console.log(`Fetching messages for chat ${chatId}, page ${page}`);
      
      const response = await api.get(`/chat/${chatId}/messages?page=${page}&limit=50`);
      console.log('Messages response:', response.data);
      
      const newMessages = response.data.messages || response.data || [];
      
      if (page === 1) {
        set({ messages: newMessages, isLoading: false });
      } else {
        set((state) => ({ 
          messages: [...newMessages, ...state.messages],
          isLoading: false 
        }));
      }
      
      console.log('Loaded messages:', newMessages.length);
    } catch (error: any) {
      console.error('Failed to fetch messages:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to fetch messages';
      set({ error: errorMessage, isLoading: false });
      toast.error(errorMessage);
    }
  },

  sendMessage: async (chatId: string, content: string, replyTo?: string) => {
    try {
      console.log('Sending message:', { chatId, content, replyTo });
      
      const messageData: any = {
        content: content.trim(),
        messageType: 'text',
      };
      
      if (replyTo) {
        messageData.replyTo = replyTo;
      }

      const response = await api.post(`/chat/${chatId}/messages`, messageData);
      console.log('Message sent response:', response.data);
      
      if (response.data.message) {
        get().addMessage(response.data.message);
      }
      
      toast.success('Message sent!');
    } catch (error: any) {
      console.error('Failed to send message:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to send message';
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  createChat: async (participantIds: string[], isGroup: boolean, name?: string) => {
    try {
      console.log('Creating chat:', { participantIds, isGroup, name });
      
      const chatData: any = {
        participantIds,
        isGroup,
      };
      
      if (isGroup && name) {
        chatData.name = name;
      }

      const response = await api.post('/chat', chatData);
      console.log('Chat created response:', response.data);
      
      const newChat = response.data.chat || response.data;
      
      if (!getChatId(newChat)) {
        throw new Error('Invalid chat response from server');
      }
      
      set((state) => ({ 
        chats: [newChat, ...state.chats.filter(c => !isSameChat(c, newChat))] 
      }));
      
      toast.success(isGroup ? 'Group created!' : 'Chat started!');
      return newChat;
    } catch (error: any) {
      console.error('Failed to create chat:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create chat';
      set({ error: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  },

  addTypingUser: (user: TypingUser) => {
    set((state) => ({
      typingUsers: [...state.typingUsers.filter(u => u.userId !== user.userId), user],
    }));
  },

  removeTypingUser: (userId: string, chatId: string) => {
    set((state) => ({
      typingUsers: state.typingUsers.filter(u => u.userId !== userId || u.chatId !== chatId),
    }));
  },

  addMessage: (message: Message) => {
    set((state) => {
      const exists = state.messages.some(m => m._id === message._id);
      if (exists) {
        console.log('Message already exists, skipping:', message._id);
        return state;
      }

      console.log('Adding new message:', message);
      return {
        messages: [...state.messages, message],
      };
    });
    
    // Update last message in chat list
    set((state) => ({
      chats: state.chats.map(chat => 
        getChatId(chat) === (typeof message.chat === 'string' ? message.chat : getChatId(message.chat as Chat))
          ? { ...chat, lastMessage: message, updatedAt: new Date() }
          : chat
      ),
    }));
  },

  markMessagesAsRead: async (chatId: string) => {
    try {
      await api.put(`/chat/${chatId}/read`);
      console.log('Messages marked as read for chat:', chatId);
    } catch (error: any) {
      console.error('Failed to mark messages as read:', error);
    }
  },

  updateChat: (updatedChat: Chat) => {
    set((state) => ({
      chats: state.chats.map(chat => 
        isSameChat(chat, updatedChat) ? updatedChat : chat
      ),
    }));
  },
}));
