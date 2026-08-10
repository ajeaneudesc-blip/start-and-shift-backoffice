import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAudit } from '@/api/audit';
import PageHeader from '@/components/layout/PageHeader';
import AuditLog from '@/components/modules/audit/AuditLog';
import ErrorBox from '@/components/ui/ErrorBox';
import ReadOnlyBanner from '@/components/ui/ReadOnlyBanner';
import Select, { type Option } from '@/components/ui/Select';
import { usePermissions } from '@/hooks/usePermissions';
import { MODULE_BY_KEY } from '@/hooks/useRbac';
import { Colors, Radius } from '@/theme/tokens';

const meta = MODULE_BY_KEY.audit;

export default function AuditPage() {
  const { canWrite, readOnly } = usePermissions('audit');
  const [action, setAction] = useState('all');

  const audit = useQuery({ queryKey: ['audit', action], queryFn: () => fetchAudit(action) });

  // La liste des actions vient de la base : pas de valeurs codées en dur.
  const options: Option<string>[] = [
    { value: 'all', label: 'Toutes les actions' },
    ...(audit.data?.actions ?? []).map((a) => ({
      value: a.action,
      label: `${a.action} (${a.count})`,
    })),
  ];

  return (
    <>
      <PageHeader title={meta.title} desc={meta.desc} action={canWrite ? meta.action : undefined}>
        <Select aria-label="Action" value={action} options={options} onChange={setAction} />
      </PageHeader>

      {readOnly && <ReadOnlyBanner />}

      {audit.isError ? (
        <ErrorBox error={audit.error} onRetry={() => void audit.refetch()} />
      ) : (
        <>
          <div
            style={{
              border: `1px solid ${Colors.border}`,
              borderRadius: Radius.lg,
              background: Colors.surface,
              overflow: 'hidden',
            }}
          >
            <AuditLog items={audit.data?.items ?? []} loading={audit.isPending} />
          </div>

          {audit.data && audit.data.total > audit.data.items.length && (
            <p style={{ margin: '10px 2px 0', fontSize: 11, color: Colors.text40 }}>
              {audit.data.items.length} entrées les plus récentes sur {audit.data.total}.
            </p>
          )}
        </>
      )}
    </>
  );
}
