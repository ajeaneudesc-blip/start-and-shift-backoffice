import { create } from 'zustand';
import { TOKEN_KEY } from '@/api/client';
import * as authApi from '@/api/auth';
import type { ApiUser, RoleKey } from '@/types';

/**
 * `checking` couvre l'appel GET /api/me du démarrage : tant qu'il tourne, on
 * n'a pas le droit de rediriger vers /login (le token peut être valide).
 */
export type AuthStatus = 'idle' | 'checking' | 'authenticated' | 'anonymous';

interface AuthState {
  token: string | null;
  user: ApiUser | null;
  status: AuthStatus;
  /** Rôle simulé par le sélecteur du header — dev/démo uniquement. */
  simulatedRole: RoleKey | null;

  /** Vérifie le token stocké au démarrage de l'app. */
  bootstrap: () => Promise<void>;
  signIn: (session: authApi.SessionResponse) => void;
  signOut: () => Promise<void>;
  setSimulatedRole: (role: RoleKey | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY),
  user: null,
  status: 'idle',
  simulatedRole: null,

  bootstrap: async () => {
    if (get().status === 'checking') return;

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ token: null, user: null, status: 'anonymous' });
      return;
    }

    set({ token, status: 'checking' });
    try {
      const user = await authApi.me();
      set({ user, status: 'authenticated' });
    } catch {
      // Un 401 a déjà purgé le token via l'intercepteur ; sur une panne réseau
      // on repart aussi de zéro plutôt que de laisser l'app à moitié montée.
      localStorage.removeItem(TOKEN_KEY);
      set({ token: null, user: null, status: 'anonymous' });
    }
  },

  signIn: ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user, status: 'authenticated', simulatedRole: null });
  },

  signOut: async () => {
    try {
      await authApi.logout();
    } catch {
      // Session déjà expirée côté serveur : la déconnexion locale suffit.
    }
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null, status: 'anonymous', simulatedRole: null });
  },

  setSimulatedRole: (role) => set({ simulatedRole: role }),
}));
