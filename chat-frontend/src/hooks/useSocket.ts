import { useEffect, useCallback } from 'react';
import { useChatStore } from '../store/chatStore';
import socketService from '../services/socket';

export const useSocket = () => {
  const { addMessage, addTypingUser, removeTypingUser } = useChatStore();

  useEffect(() => {
    // Set up socket event listeners
    socketService.onNewMessage((message) => {
      addMessage(message);
    });

    socketService.onUserTyping((data) => {
      addTypingUser(data);
    });

    socketService.onUserStoppedTyping((data) => {
      removeTypingUser(data.userId, data.chatId);
    });

    // Cleanup listeners on unmount
    return () => {
      socketService.off('newMessage');
      socketService.off('userTyping');
      socketService.off('userStoppedTyping');
    };
  }, [addMessage, addTypingUser, removeTypingUser]);

  const sendTyping = useCallback((chatId: string) => {
    socketService.sendTyping(chatId);
  }, []);

  const stopTyping = useCallback((chatId: string) => {
    socketService.stopTyping(chatId);
  }, []);

  const joinChat = useCallback((chatId: string) => {
    socketService.joinChat(chatId);
  }, []);

  const leaveChat = useCallback((chatId: string) => {
    socketService.leaveChat(chatId);
  }, []);

  return {
    sendTyping,
    stopTyping,
    joinChat,
    leaveChat,
    isConnected: socketService.isSocketConnected(),
  };
};
