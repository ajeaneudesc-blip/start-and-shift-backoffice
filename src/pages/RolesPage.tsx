import { useQuery } from '@tanstack/react-query';
import { fetchRoles } from '@/api/roles';
import PageHeader from '@/components/layout/PageHeader';
import RoleMatrix from '@/components/modules/roles/RoleMatrix';
import ErrorBox from '@/components/ui/ErrorBox';
import ReadOnlyBanner from '@/components/ui/ReadOnlyBanner';
import { usePermissions } from '@/hooks/usePermissions';
import { MODULE_BY_KEY } from '@/hooks/useRbac';
import { Colors } from '@/theme/tokens';

const meta = MODULE_BY_KEY.roles;

export default function RolesPage() {
  // Le MVP n'édite pas la matrice : la bannière lecture seule s'affiche donc
  // pour tout rôle sous le niveau 3, pas seulement au niveau 1.
  const { readOnly } = usePermissions('roles');
  const roles = useQuery({ queryKey: ['roles'], queryFn: fetchRoles, staleTime: 5 * 60_000 });

  return (
    <>
      <PageHeader title={meta.title} desc={meta.desc} />
      {readOnly && <ReadOnlyBanner />}

      {roles.isError ? (
        <ErrorBox error={roles.error} onRetry={() => void roles.refetch()} />
      ) : roles.isPending ? (
        <p style={{ margin: 0, fontSize: 12, color: Colors.text45 }}>Chargement de la matrice…</p>
      ) : (
        <RoleMatrix data={roles.data} />
      )}
    </>
  );
}
