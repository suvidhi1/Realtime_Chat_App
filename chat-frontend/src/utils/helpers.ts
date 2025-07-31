import { User, Chat, Message } from '../types';

// Utility functions to handle ID variations
export const getUserId = (user: User | null | undefined): string => {
  if (!user) return '';
  return (user as any)._id || user.id || '';
};

export const getChatId = (chat: Chat | null | undefined): string => {
  if (!chat) return '';
  return (chat as any)._id || (chat as any).id || '';
};

export const getMessageId = (message: Message | null | undefined): string => {
  if (!message) return '';
  return (message as any)._id || (message as any).id || '';
};

export const getUserAvatar = (user: User | null | undefined): string | undefined => {
  if (!user) return undefined;
  return user.avatar || (user as any).profilePicture;
};

// Safe comparison function for user IDs
export const isSameUser = (user1: User | string | null | undefined, user2: User | string | null | undefined): boolean => {
  if (!user1 || !user2) return false;
  const id1 = typeof user1 === 'string' ? user1 : getUserId(user1);
  const id2 = typeof user2 === 'string' ? user2 : getUserId(user2);
  return id1 === id2 && id1 !== '';
};

// Safe comparison function for chat IDs
export const isSameChat = (chat1: Chat | string | null | undefined, chat2: Chat | string | null | undefined): boolean => {
  if (!chat1 || !chat2) return false;
  const id1 = typeof chat1 === 'string' ? chat1 : getChatId(chat1);
  const id2 = typeof chat2 === 'string' ? chat2 : getChatId(chat2);
  return id1 === id2 && id1 !== '';
};
