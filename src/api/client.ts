import axios from 'axios';

export const TOKEN_KEY = 'jwt';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  // Un appel qui pose lui-même son en-tête garde la main : c'est le cas de
  // revokeSession(), qui utilise un token jamais écrit dans localStorage.
  if (config.headers.Authorization) return config;
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Déconnexion automatique sur 401. La redirection est un rechargement complet :
 * elle vide au passage le store Zustand et le cache React Query.
 * On l'ignore si on est déjà sur /login, sinon l'échec de bootstrap boucle.
 */
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);

/** Code d'erreur métier renvoyé par l'API (`{ error: "..." }`), sinon null. */
export function apiErrorCode(err: unknown): string | null {
  if (axios.isAxiosError(err)) {
    const code = (err.response?.data as { error?: unknown } | undefined)?.error;
    if (typeof code === 'string') return code;
  }
  return null;
}

export function apiStatus(err: unknown): number | null {
  return axios.isAxiosError(err) ? (err.response?.status ?? null) : null;
}

/** Vrai si la requête n'a jamais atteint le serveur (API éteinte, CORS, réseau). */
export function isNetworkError(err: unknown): boolean {
  return axios.isAxiosError(err) && !err.response;
}

/** Message lisible pour l'échec d'une requête — affiché par `ErrorBox`. */
export function errorMessage(err: unknown): string {
  if (isNetworkError(err)) {
    return `L'API est injoignable. Vérifiez qu'elle tourne sur ${import.meta.env.VITE_API_URL}.`;
  }
  const status = apiStatus(err);
  // Un module au niveau 0 répond 404 côté API : elle ne révèle pas son existence.
  if (status === 404 || status === 403) return "Ce module n'est pas accessible avec ce rôle.";
  const code = apiErrorCode(err);
  return code ? `Erreur ${status ?? ''} — ${code}`.trim() : 'Chargement impossible. Réessayez.';
}

export default client;
