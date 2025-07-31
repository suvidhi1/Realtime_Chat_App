import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import { getChatId } from '../utils/helpers';
import socketService from '../services/socket';

export const useChat = () => {
  const { 
    chats, 
    currentChat, 
    messages, 
    fetchChats, 
    fetchMessages, 
    sendMessage,
    setCurrentChat,
    markMessagesAsRead 
  } = useChatStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchChats();
    }
  }, [isAuthenticated, fetchChats]);

  useEffect(() => {
    if (currentChat) {
      const chatId = getChatId(currentChat);
      fetchMessages(chatId);
    }
  }, [currentChat, fetchMessages]);

  const scrollToBottom = useCallback(() => {
    const messagesContainer = document.querySelector('[data-messages-container]');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, []);

  const sendChatMessage = useCallback(async (content: string, replyTo?: string) => {
    if (currentChat) {
      const chatId = getChatId(currentChat);
      await sendMessage(chatId, content, replyTo);
    }
  }, [currentChat, sendMessage]);

  const markChatMessagesAsRead = useCallback(async () => {
    if (currentChat) {
      const chatId = getChatId(currentChat);
      await markMessagesAsRead(chatId);
    }
  }, [currentChat, markMessagesAsRead]);

  const joinChatRoom = useCallback((chatId: string) => {
    socketService.joinChat(chatId);
  }, []);

  const leaveChatRoom = useCallback((chatId: string) => {
    socketService.leaveChat(chatId);
  }, []);

  return {
    // State
    chats,
    currentChat,
    messages,
    
    // Actions
    setCurrentChat,
    sendChatMessage,
    markChatMessagesAsRead,
    scrollToBottom,
    joinChatRoom,
    leaveChatRoom,
    
    // Utils
    getChatId: (chat: any) => getChatId(chat),
  };
};
