export interface User {
  _id?: string;
  id?: string;
  username: string;
  email: string;
  avatar?: string;
  profilePicture?: string;
  isOnline?: boolean;
  lastSeen?: Date;
  friends?: string[] | User[];
  friendRequests?: FriendRequest[];
  
  // Settings properties
  bio?: string;
  notificationSettings?: {
    messages: boolean;
    friendRequests: boolean;
    groupInvites: boolean;
    sounds: boolean;
    desktop: boolean;
    email: boolean;
  };
  privacySettings?: {
    onlineStatus: boolean;
    lastSeen: boolean;
    readReceipts: boolean;
    profileVisibility: string;
  };
  themeSettings?: {
    theme: string;
    fontSize: string;
    chatBackground: string;
  };
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Chat {
  _id?: string;
  id?: string;
  participants: User[];
  isGroup: boolean;
  name?: string;
  groupAvatar?: string;
  admin?: User;
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: string;
  id?: string;
  sender: User;
  chat: string | Chat;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileData?: {
    url: string;
    fileName: string;
    fileSize: number;
    mimeType?: string;
  };
  encrypted?: boolean;
  replyTo?: Message;
  readBy: Array<{
    user: string;
    readAt: Date;
  }>;
  edited?: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FriendRequest {
  _id: string;
  id?: string;
  from: User;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}

export interface TypingUser {
  userId: string;
  username: string;
  chatId: string;
}

export interface OnlineUser {
  userId: string;
  username: string;
  socketId: string;
}

export interface NotificationSettings {
  messages: boolean;
  friendRequests: boolean;
  groupInvites: boolean;
  sounds: boolean;
}

export interface PrivacySettings {
  onlineStatus: boolean;
  lastSeen: boolean;
  readReceipts: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
}

export interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
}

export interface SearchResults {
  users: User[];
  chats: Chat[];
  messages: Message[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onReply?: (message: Message) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
