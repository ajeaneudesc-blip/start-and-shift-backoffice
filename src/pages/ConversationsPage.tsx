import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getConversation,
  listConversations,
  patchConversation,
  requestDraft,
  sendMessage,
  type ConvDetail,
  type ConvFilter,
  type ConvListResponse,
} from '@/api/conversations';
import { apiErrorCode, errorMessage } from '@/api/client';
import type { Overview } from '@/api/overview';
import PageHeader from '@/components/layout/PageHeader';
import ConvChat from '@/components/modules/conversations/ConvChat';
import ConvList from '@/components/modules/conversations/ConvList';
import ConvSidebar from '@/components/modules/conversations/ConvSidebar';
import ErrorBox from '@/components/ui/ErrorBox';
import ReadOnlyBanner from '@/components/ui/ReadOnlyBanner';
import { OVERVIEW_KEY } from '@/hooks/useOverview';
import { usePermissions } from '@/hooks/usePermissions';
import { MODULE_BY_KEY } from '@/hooks/useRbac';
import { useWebSocket, type WsEvent } from '@/hooks/useWebSocket';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/theme/tokens';

const meta = MODULE_BY_KEY.conv;

/**
 * Hauteur occupée au-dessus des panneaux : header du Shell, padding de la zone
 * de contenu et PageHeader. Les trois colonnes prennent le reste, pour que
 * seule la liste et le fil défilent — jamais la page (§7.2).
 */
const CHROME_HEIGHT = 183;
const BANNER_HEIGHT = 58;

const SEARCH_DEBOUNCE_MS = 300;

export default function ConversationsPage() {
  const { canWrite, readOnly } = usePermissions('conv');
  const queryClient = useQueryClient();
  const myHandle = useAuthStore((s) => s.user?.pseudo);

  const [filter, setFilter] = useState<ConvFilter>('all');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  const listKey = useMemo(() => ['conversations', filter, debouncedQuery], [filter, debouncedQuery]);

  const list = useQuery({
    queryKey: listKey,
    queryFn: () => listConversations({ filter, q: debouncedQuery }),
  });

  const items = useMemo(() => list.data?.items ?? [], [list.data]);

  // À l'ouverture du module, on montre le fil le plus récent plutôt qu'un vide.
  const currentId = selectedId !== null && items.some((c) => c.id === selectedId)
    ? selectedId
    : (items[0]?.id ?? null);

  const detail = useQuery({
    queryKey: ['conversation', currentId],
    queryFn: () => getConversation(currentId!),
    enabled: currentId !== null,
  });

  // ── Temps réel ──────────────────────────────────────────────────────────────

  const currentIdRef = useRef(currentId);
  currentIdRef.current = currentId;

  const onEvent = useCallback(
    (event: WsEvent) => {
      switch (event.type) {
        case 'conv:msg': {
          // Le fil ouvert reçoit le message tout de suite ; les autres se
          // contentent de voir leur aperçu rafraîchi par l'invalidation.
          if (event.convId === currentIdRef.current) {
            queryClient.setQueryData<ConvDetail>(['conversation', event.convId], (old) =>
              old && !old.messages.some((m) => m.id === event.msg.id)
                ? { ...old, messages: [...old.messages, event.msg] }
                : old,
            );
          }
          void queryClient.invalidateQueries({ queryKey: ['conversations'] });
          break;
        }
        case 'conv:status': {
          void queryClient.invalidateQueries({ queryKey: ['conversations'] });
          void queryClient.invalidateQueries({ queryKey: ['conversation', event.convId] });
          break;
        }
        case 'conv:new': {
          void queryClient.invalidateQueries({ queryKey: ['conversations'] });
          break;
        }
        case 'conv:unread': {
          // Badge de la nav : il vient du bloc `counts` de /api/overview.
          queryClient.setQueryData<Overview>(OVERVIEW_KEY, (old) =>
            old ? { ...old, counts: { ...old.counts, conv: event.count } } : old,
          );
          break;
        }
      }
    },
    [queryClient],
  );

  const socket = useWebSocket(onEvent);

  /** Marquer lu passe par la socket : l'API n'expose pas de route REST pour ça. */
  const markRead = useCallback(
    (id: number) => {
      socket.send({ type: 'conv:read', convId: id });
      queryClient.setQueryData<ConvListResponse>(listKey, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((c) => (c.id === id ? { ...c, unread: false } : c)),
              unreadCount: Math.max(0, old.unreadCount - (old.items.find((c) => c.id === id)?.unread ? 1 : 0)),
            }
          : old,
      );
    },
    [listKey, queryClient, socket],
  );

  // Ouvrir un fil le marque lu, y compris celui sélectionné par défaut.
  const openedRef = useRef<number | null>(null);
  useEffect(() => {
    if (currentId === null || openedRef.current === currentId) return;
    openedRef.current = currentId;
    if (items.find((c) => c.id === currentId)?.unread) markRead(currentId);
  }, [currentId, items, markRead]);

  // ── Écritures ───────────────────────────────────────────────────────────────

  const reply = useMutation({
    mutationFn: (text: string) => sendMessage(currentId!, text),
    onSuccess: (msg) => {
      setSendError(null);
      queryClient.setQueryData<ConvDetail>(['conversation', currentId], (old) =>
        old && !old.messages.some((m) => m.id === msg.id)
          ? { ...old, messages: [...old.messages, msg] }
          : old,
      );
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (err) => setSendError(errorMessage(err)),
  });

  /**
   * Brouillon d'assistant. Aucune invalidation de cache : l'API n'écrit rien et
   * ne diffuse rien, le texte ne fait que remplir le composeur.
   */
  const suggest = useMutation({
    mutationFn: (brief: string) => requestDraft(currentId!, brief),
    onSuccess: () => setSendError(null),
    onError: (err) =>
      setSendError(
        apiErrorCode(err) === 'assistant_unavailable'
          ? "L'assistant est indisponible. Rédigez la réponse vous-même."
          : errorMessage(err),
      ),
  });

  const patch = useMutation({
    mutationFn: (body: Parameters<typeof patchConversation>[1]) =>
      patchConversation(currentId!, body),
    onSuccess: () => {
      setSendError(null);
      void queryClient.invalidateQueries({ queryKey: ['conversations'] });
      void queryClient.invalidateQueries({ queryKey: ['conversation', currentId] });
    },
    onError: (err) => setSendError(errorMessage(err)),
  });

  const conv = detail.data;
  const panelHeight = `calc(100vh - ${CHROME_HEIGHT + (readOnly ? BANNER_HEIGHT : 0)}px)`;

  return (
    <>
      <PageHeader title={meta.title} desc={meta.desc}>
        <span
          title={socket.connected ? 'Connecté au flux temps réel' : 'Flux temps réel interrompu'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontSize: 11,
            color: socket.connected ? Colors.text45 : Colors.orangeMid,
            alignSelf: 'center',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: socket.connected ? Colors.ok.fg : Colors.orangeMid,
            }}
          />
          {socket.connected ? 'Temps réel' : 'Reconnexion…'}
        </span>
      </PageHeader>

      {readOnly && <ReadOnlyBanner />}

      {list.isError ? (
        <ErrorBox error={list.error} onRetry={() => void list.refetch()} />
      ) : (
        <div
          style={{
            display: 'flex',
            gap: 12,
            height: panelHeight,
            minHeight: 420,
            alignItems: 'stretch',
            minWidth: 900,
          }}
        >
          <ConvList
            items={items}
            selectedId={currentId}
            onSelect={setSelectedId}
            filter={filter}
            onFilter={setFilter}
            query={query}
            onQuery={setQuery}
            unreadCount={list.data?.unreadCount ?? 0}
            loading={list.isPending}
          />

          {conv ? (
            <>
              <ConvChat
                conv={conv}
                canWrite={canWrite}
                onSend={(text) => reply.mutateAsync(text)}
                onRequestDraft={(brief) => suggest.mutateAsync(brief)}
                onAssignSelf={() => myHandle && patch.mutate({ assignee: myHandle })}
                onToggleResolved={() =>
                  patch.mutate({ status: conv.status === 'RESOLUE' ? 'OUVERTE' : 'RESOLUE' })
                }
                busy={patch.isPending}
                sendError={sendError}
              />
              <ConvSidebar conv={conv} />
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'grid',
                placeItems: 'center',
                border: `1px solid ${Colors.border}`,
                borderRadius: 10,
                background: Colors.surface,
                fontSize: 12,
                color: Colors.text45,
              }}
            >
              {detail.isError ? (
                <ErrorBox error={detail.error} onRetry={() => void detail.refetch()} />
              ) : currentId === null ? (
                'Sélectionnez une conversation.'
              ) : (
                'Chargement du fil…'
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
