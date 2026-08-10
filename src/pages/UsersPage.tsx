import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { errorMessage } from '@/api/client';
import {
  bulkUpdate,
  deleteUser,
  listUsers,
  updateUser,
  PAGE_SIZE,
  type UserRow,
  type UserSegment,
} from '@/api/users';
import PageHeader from '@/components/layout/PageHeader';
import UserFilters, { type PlanFilter, type RoleFilter } from '@/components/modules/users/UserFilters';
import UserSegments from '@/components/modules/users/UserSegments';
import UserTable from '@/components/modules/users/UserTable';
import ErrorBox from '@/components/ui/ErrorBox';
import Pagination from '@/components/ui/Pagination';
import ReadOnlyBanner from '@/components/ui/ReadOnlyBanner';
import { formatCount } from '@/format';
import { usePermissions } from '@/hooks/usePermissions';
import { MODULE_BY_KEY } from '@/hooks/useRbac';
import { useAuthStore } from '@/store/authStore';
import { Colors, Radius } from '@/theme/tokens';

const meta = MODULE_BY_KEY.users;
const SEARCH_DEBOUNCE_MS = 300;

/** Message des refus métier propres à ce module. */
const MESSAGES: Record<string, string> = {
  user_has_data: 'Ce compte a des conversations, commandes ou journaux : suppression refusée.',
  cannot_modify_self: 'Impossible de modifier son propre compte.',
  cannot_delete_self: 'Impossible de supprimer son propre compte.',
};

export default function UsersPage() {
  const { canWrite, canDelete, readOnly } = usePermissions('users');
  const queryClient = useQueryClient();
  const selfId = useAuthStore((s) => s.user?.id);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [role, setRole] = useState<RoleFilter>('all');
  const [plan, setPlan] = useState<PlanFilter>('all');
  const [segment, setSegment] = useState<UserSegment>('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  // Changer de filtre remet la pagination et la sélection à zéro : garder des
  // ids cochés hors du résultat courant ferait agir en aveugle.
  useEffect(() => {
    setPage(1);
    setSelected([]);
  }, [debouncedQuery, role, plan, segment]);

  const params = { q: debouncedQuery, role, plan, segment, page };

  const users = useQuery({
    queryKey: ['users', params],
    queryFn: () => listUsers(params),
  });

  const items = useMemo(() => users.data?.items ?? [], [users.data]);
  const total = users.data?.total ?? 0;
  const totalPages = users.data?.totalPages ?? 1;

  const rangeLabel = total
    ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} sur ${formatCount(total)}`
    : 'Aucun résultat';

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ['users'] });
    // Les compteurs de la nav et les KPI comptent les inscrits.
    void queryClient.invalidateQueries({ queryKey: ['overview'] });
  }

  function onMutationError(err: unknown) {
    const code = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
    setActionError((code && MESSAGES[code]) || errorMessage(err));
  }

  const toggleStatus = useMutation({
    mutationFn: (user: UserRow) =>
      updateUser(user.id, { status: user.status === 'SUSPENDU' ? 'ACTIF' : 'SUSPENDU' }),
    onSuccess: () => {
      setActionError(null);
      refresh();
    },
    onError: onMutationError,
  });

  const remove = useMutation({
    mutationFn: (user: UserRow) => deleteUser(user.id),
    onSuccess: () => {
      setActionError(null);
      setSelected([]);
      refresh();
    },
    onError: onMutationError,
  });

  const bulk = useMutation({
    mutationFn: (action: 'suspend' | 'activate') => bulkUpdate(selected, action),
    onSuccess: (result) => {
      setActionError(
        result.skippedSelf ? 'Votre propre compte a été ignoré dans cette action groupée.' : null,
      );
      setSelected([]);
      refresh();
    },
    onError: onMutationError,
  });

  const busyId = toggleStatus.isPending
    ? toggleStatus.variables.id
    : remove.isPending
      ? remove.variables.id
      : null;

  return (
    <>
      <PageHeader title={meta.title} desc={meta.desc} action={canWrite ? meta.action : undefined} />
      {readOnly && <ReadOnlyBanner />}

      <UserFilters
        query={query}
        onQuery={setQuery}
        role={role}
        onRole={setRole}
        plan={plan}
        onPlan={setPlan}
      />

      <UserSegments
        segment={segment}
        onSegment={setSegment}
        counts={users.data?.segmentCounts}
        rangeLabel={rangeLabel}
      />

      {actionError && (
        <div style={{ marginBottom: 10 }}>
          <ErrorBox message={actionError} />
        </div>
      )}

      {canWrite && selected.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid rgba(9,92,255,.35)',
            background: 'rgba(9,92,255,.10)',
            borderRadius: 9,
            padding: '8px 12px',
            marginBottom: 10,
            fontSize: 12,
          }}
        >
          <span style={{ color: '#9CC0FF' }}>
            {selected.length} sélectionné{selected.length > 1 ? 's' : ''}
          </span>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            onClick={() => bulk.mutate('suspend')}
            disabled={bulk.isPending}
            className="sas-btn-ghost"
            style={{
              height: 26,
              padding: '0 10px',
              border: '1px solid rgba(255,255,255,.16)',
              borderRadius: 6,
              background: 'transparent',
              color: '#fff',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Suspendre
          </button>
          <button
            type="button"
            onClick={() => bulk.mutate('activate')}
            disabled={bulk.isPending}
            className="sas-btn-ghost"
            style={{
              height: 26,
              padding: '0 10px',
              border: '1px solid rgba(255,255,255,.16)',
              borderRadius: 6,
              background: 'transparent',
              color: '#fff',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Réactiver
          </button>
          <button
            type="button"
            onClick={() => setSelected([])}
            style={{
              height: 26,
              padding: '0 10px',
              border: 'none',
              borderRadius: 6,
              background: 'transparent',
              color: Colors.text50,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Annuler
          </button>
        </div>
      )}

      {users.isError ? (
        <ErrorBox error={users.error} onRetry={() => void users.refetch()} />
      ) : (
        <div
          style={{
            border: `1px solid ${Colors.border}`,
            borderRadius: Radius.lg,
            background: Colors.surface,
            overflow: 'hidden',
          }}
        >
          <UserTable
            items={items}
            selected={selected}
            onSelect={(id) =>
              setSelected((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
            }
            onSelectAll={() =>
              setSelected((ids) => {
                const pageIds = items.map((u) => u.id);
                const all = pageIds.every((id) => ids.includes(id));
                return all
                  ? ids.filter((id) => !pageIds.includes(id))
                  : [...ids, ...pageIds.filter((id) => !ids.includes(id))];
              })
            }
            canWrite={canWrite}
            canDelete={canDelete}
            onToggleStatus={(u) => toggleStatus.mutate(u)}
            onDelete={(u) => remove.mutate(u)}
            selfId={selfId}
            busyId={busyId}
            loading={users.isPending}
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            onPage={setPage}
            rangeLabel={rangeLabel}
          />
        </div>
      )}
    </>
  );
}
