import SearchInput from '@/components/ui/SearchInput';
import Select, { type Option } from '@/components/ui/Select';
import { PLAN_LABELS, USER_ROLE_LABELS } from '@/labels';
import type { UserPlan, UserRole } from '@/types';

export type RoleFilter = UserRole | 'all';
export type PlanFilter = UserPlan | 'all';

const ROLE_OPTIONS: Option<RoleFilter>[] = [
  { value: 'all', label: 'Tous les rôles' },
  ...(Object.keys(USER_ROLE_LABELS) as UserRole[]).map((r) => ({
    value: r as RoleFilter,
    label: USER_ROLE_LABELS[r],
  })),
];

const PLAN_OPTIONS: Option<PlanFilter>[] = [
  { value: 'all', label: 'Tous les plans' },
  ...(Object.keys(PLAN_LABELS) as UserPlan[]).map((p) => ({
    value: p as PlanFilter,
    label: PLAN_LABELS[p],
  })),
];

interface Props {
  query: string;
  onQuery: (value: string) => void;
  role: RoleFilter;
  onRole: (value: RoleFilter) => void;
  plan: PlanFilter;
  onPlan: (value: PlanFilter) => void;
}

export default function UserFilters({ query, onQuery, role, onRole, plan, onPlan }: Props) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
      <SearchInput
        value={query}
        onChange={onQuery}
        placeholder="Rechercher un nom, un pseudo, un numéro"
      />
      <Select aria-label="Rôle" value={role} options={ROLE_OPTIONS} onChange={onRole} />
      <Select aria-label="Plan" value={plan} options={PLAN_OPTIONS} onChange={onPlan} />
    </div>
  );
}
