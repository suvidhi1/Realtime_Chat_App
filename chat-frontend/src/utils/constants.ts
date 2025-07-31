export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_RESET_TOKEN: '/auth/verify-reset-token',
  },
  CHAT: {
    BASE: '/chat',
    MESSAGES: (chatId: string) => `/chat/${chatId}/messages`,
    READ: (chatId: string) => `/chat/${chatId}/read`,
  },
  USERS: {
    PROFILE: '/users/profile',
    FRIENDS: '/users/friends',
    FRIEND_REQUESTS: '/users/friend-requests',
    SEND_FRIEND_REQUEST: '/users/friend-request',
    ACCEPT_FRIEND_REQUEST: (requestId: string) => `/users/friend-request/${requestId}/accept`,
    DECLINE_FRIEND_REQUEST: (requestId: string) => `/users/friend-request/${requestId}/decline`,
  },
  SEARCH: {
    USERS: '/search/users',
    CHATS: '/search/chats',
    MESSAGES: '/search/messages',
    GLOBAL: '/search/global',
  },
};

export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  
  // Chat
  JOIN_CHAT: 'joinChat',
  LEAVE_CHAT: 'leaveChat',
  NEW_MESSAGE: 'newMessage',
  MESSAGE_READ: 'messageRead',
  
  // Typing
  TYPING: 'typing',
  STOP_TYPING: 'stopTyping',
  USER_TYPING: 'userTyping',
  USER_STOPPED_TYPING: 'userStoppedTyping',
  
  // User Status
  USER_STATUS_CHANGED: 'userStatusChanged',
  USER_ONLINE: 'userOnline',
  USER_OFFLINE: 'userOffline',
  
  // Groups
  NEW_CHAT: 'newChat',
  CHAT_UPDATED: 'chatUpdated',
  USER_ADDED_TO_CHAT: 'userAddedToChat',
  USER_REMOVED_FROM_CHAT: 'userRemovedFromChat',
};

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',
} as const;

export const CHAT_LIMITS = {
  MESSAGE_LENGTH: 1000,
  GROUP_NAME_LENGTH: 50,
  MAX_GROUP_MEMBERS: 100,
  FILE_SIZE_LIMIT: 10 * 1024 * 1024, // 10MB
  IMAGE_SIZE_LIMIT: 5 * 1024 * 1024,  // 5MB
};

export const SUPPORTED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALL: ['*'],
};
