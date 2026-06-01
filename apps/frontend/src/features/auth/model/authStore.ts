import { create } from 'zustand';
import { UserRole } from './authTypes';

type AuthUiState = {
  lastSelectedRole: UserRole | null;
  setLastSelectedRole: (role: UserRole) => void;
};

export const useAuthUiStore = create<AuthUiState>((set) => ({
  lastSelectedRole: null,
  setLastSelectedRole: (role) => set({ lastSelectedRole: role }),
}));
