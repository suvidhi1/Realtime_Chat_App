import { io, Socket } from 'socket.io-client';
import { Message, User, TypingUser, Chat } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('✅ Socket already connected');
      return;
    }

    console.log('🔌 Connecting to socket server...');
    
    this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
    });
  }

  // Message events
  onNewMessage(callback: (message: Message) => void) {
    this.socket?.on('new-message', callback);
  }

  onMessageEdited(callback: (data: { messageId: string; newContent: string }) => void) {
    this.socket?.on('message-edited', callback);
  }

  onMessageDeleted(callback: (data: { messageId: string }) => void) {
    this.socket?.on('message-deleted', callback);
  }

  // Typing events
  onUserTyping(callback: (data: TypingUser) => void) {
    this.socket?.on('user-typing', callback);
  }

  onUserStoppedTyping(callback: (data: { userId: string; chatId: string }) => void) {
    this.socket?.on('user-stopped-typing', callback);
  }

  // User status events
  onUserOnline(callback: (data: { userId: string; username: string }) => void) {
    this.socket?.on('user-online', callback);
  }

  onUserOffline(callback: (data: { userId: string }) => void) {
    this.socket?.on('user-offline', callback);
  }

  // Friend events
  onFriendRequestReceived(callback: (request: any) => void) {
    this.socket?.on('friend-request-received', callback);
  }

  onFriendRequestAccepted(callback: (data: { fromUserId: string; fromUsername: string }) => void) {
    this.socket?.on('friend-request-accepted', callback);
  }

  // Chat events
  onNewChat(callback: (chat: Chat) => void) {
    this.socket?.on('new-chat', callback);
  }

  // Emit events
  joinChat(chatId: string) {
    console.log('🏠 Joining chat room:', chatId);
    this.socket?.emit('join-chat', { chatId });
  }

  leaveChat(chatId: string) {
    console.log('🚪 Leaving chat room:', chatId);
    this.socket?.emit('leave-chat', { chatId });
  }

  sendMessage(message: Omit<Message, '_id' | 'createdAt' | 'updatedAt'>) {
    this.socket?.emit('send-message', message);
  }

  startTyping(chatId: string) {
    this.socket?.emit('start-typing', { chatId });
  }

  stopTyping(chatId: string) {
    this.socket?.emit('stop-typing', { chatId });
  }

  // Added missing methods
  sendTyping(chatId: string) {
    this.startTyping(chatId);
  }

  updateUserStatus(isOnline: boolean) {
    this.socket?.emit('update-status', { isOnline });
  }

  // Event listener removal
  off(eventName: string, listener?: (...args: any[]) => void) {
    if (listener) {
      this.socket?.off(eventName, listener);
    } else {
      this.socket?.removeAllListeners(eventName);
    }
  }

  // Clean up
  removeAllListeners() {
    this.socket?.removeAllListeners();
  }

  disconnect() {
    console.log('🔌 Disconnecting socket...');
    this.socket?.disconnect();
    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Added missing method
  isSocketConnected(): boolean {
    return this.isConnected();
  }
}

export default new SocketService();
