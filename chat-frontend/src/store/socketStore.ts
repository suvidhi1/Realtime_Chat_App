import { create } from 'zustand';
import socketService from '../services/socket';

interface SocketStore {
  isConnected: boolean;
  connectionError: string | null;
  connect: (token: string) => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketStore>((set) => ({
  isConnected: false,
  connectionError: null,

  connect: (token: string) => {
    try {
      socketService.connect(token);
      set({ isConnected: true, connectionError: null });
    } catch (error: any) {
      set({ connectionError: error.message });
    }
  },

  disconnect: () => {
    socketService.disconnect();
    set({ isConnected: false, connectionError: null });
  },
}));
