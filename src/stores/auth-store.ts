import { create } from 'zustand'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { User } from '@/types'

interface AuthState {
  authUser: SupabaseUser | null
  user: User | null
  isLoading: boolean
  setAuthUser: (user: SupabaseUser | null) => void
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  authUser: null,
  user: null,
  isLoading: true,
  setAuthUser: (authUser) => set({ authUser }),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () => set({ authUser: null, user: null, isLoading: false }),
}))
