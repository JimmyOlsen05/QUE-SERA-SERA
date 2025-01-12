import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: (User & { profile?: any }) | null;
  loading: boolean;
  setUser: (user: (User & { profile?: any }) | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  signOut: () => set({ user: null }),
  initializeAuth: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      set({ user: user, loading: false });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ user: null, loading: false });
    }
  }
}));