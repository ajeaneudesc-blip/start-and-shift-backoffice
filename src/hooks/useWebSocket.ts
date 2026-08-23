import { useCallback, useEffect, useRef, useState } from 'react';
import { getWsTicket } from '@/api/auth';
import type { ConvListItem, ConvMessage } from '@/api/conversations';
import { useAuthStore } from '@/store/authStore';
import type { ConvStatus } from '@/types';

/** Événements poussés par l'API vers les connexions du backoffice. */
export type WsEvent =
  | { type: 'ping' }
  | { type: 'conv:new'; convId: number; conv: ConvListItem }
  | { type: 'conv:msg'; convId: number; msg: ConvMessage }
  | { type: 'conv:status'; convId: number; status: ConvStatus }
  | { type: 'conv:unread'; count: number };

/** 1 s, 2 s, 4 s… plafonné à 30 s, comme le recommande le README de l'API. */
const FIRST_DELAY_MS = 1000;
const MAX_DELAY_MS = 30_000;

/**
 * Le JWT n'apparaît jamais ici : c'est un ticket à usage unique, valable 30 s,
 * obtenu par un `GET /api/ws-ticket` authentifié par en-tête. L'URL d'un socket
 * traverse trop de journaux pour y mettre un jeton de sept jours.
 */
function socketUrl(ticket: string): string {
  const base = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL.replace(/^http/, 'ws');
  return `${base.replace(/\/$/, '')}/ws?ticket=${encodeURIComponent(ticket)}`;
}

export interface Socket {
  /** Vrai entre `open` et `close` : sert à afficher l'état « temps réel ». */
  connected: boolean;
  /** Envoie un message au serveur ; ignoré si la socket est fermée. */
  send: (payload: object) => void;
}

/**
 * Connexion temps réel, ouverte tant que le composant appelant est monté.
 * `onEvent` est lu à travers une ref : le changer ne rouvre pas la socket, ce
 * qui évite un cycle reconnexion → nouveau rendu → reconnexion.
 */
export function useWebSocket(onEvent: (event: WsEvent) => void): Socket {
  const token = useAuthStore((s) => s.token);
  const [connected, setConnected] = useState(false);

  const handler = useRef(onEvent);
  handler.current = onEvent;

  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) return;

    let closedByUs = false;
    let attempt = 0;
    let retry: ReturnType<typeof setTimeout> | undefined;

    function retryLater() {
      if (closedByUs) return;
      // Un token révoqué fait échouer le ticket (401) : on retente quand même,
      // l'intercepteur axios finira par renvoyer sur /login.
      const delay = Math.min(FIRST_DELAY_MS * 2 ** attempt, MAX_DELAY_MS);
      attempt += 1;
      retry = setTimeout(() => void open(), delay);
    }

    async function open() {
      // Chaque tentative redemande un ticket : il ne sert qu'une fois.
      let ticket: string;
      try {
        ticket = await getWsTicket();
      } catch {
        retryLater();
        return;
      }
      // L'utilisateur a pu quitter la page, ou se déconnecter, entre-temps.
      if (closedByUs) return;

      const ws = new WebSocket(socketUrl(ticket));
      socket.current = ws;

      ws.onopen = () => {
        attempt = 0;
        setConnected(true);
      };

      ws.onmessage = (event) => {
        let parsed: WsEvent;
        try {
          parsed = JSON.parse(String(event.data));
        } catch {
          return;
        }
        // Le ping applicatif n'appelle pas de réponse : le navigateur répond
        // déjà au ping protocolaire, qui est ce que le serveur surveille.
        if (parsed.type === 'ping') return;
        handler.current(parsed);
      };

      ws.onerror = () => ws.close();

      ws.onclose = () => {
        setConnected(false);
        socket.current = null;
        retryLater();
      };
    }

    void open();

    return () => {
      closedByUs = true;
      clearTimeout(retry);
      socket.current?.close();
      socket.current = null;
      setConnected(false);
    };
  }, [token]);

  const send = useCallback((payload: object) => {
    const ws = socket.current;
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
  }, []);

  return { connected, send };
}
