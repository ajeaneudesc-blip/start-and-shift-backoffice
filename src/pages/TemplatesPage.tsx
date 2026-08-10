import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listTemplates, setTemplateState, type TemplateRow } from '@/api/templates';
import PageHeader from '@/components/layout/PageHeader';
import TemplateGrid from '@/components/modules/templates/TemplateGrid';
import ErrorBox from '@/components/ui/ErrorBox';
import ReadOnlyBanner from '@/components/ui/ReadOnlyBanner';
import { usePermissions } from '@/hooks/usePermissions';
import { MODULE_BY_KEY } from '@/hooks/useRbac';

const meta = MODULE_BY_KEY.templates;

export default function TemplatesPage() {
  const { canWrite, readOnly } = usePermissions('templates');
  const queryClient = useQueryClient();

  const templates = useQuery({ queryKey: ['templates'], queryFn: listTemplates });

  const toggle = useMutation({
    mutationFn: (t: TemplateRow) =>
      setTemplateState(t.id, t.state === 'PUBLIE' ? 'BROUILLON' : 'PUBLIE'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['templates'] });
      void queryClient.invalidateQueries({ queryKey: ['overview'] });
    },
  });

  return (
    <>
      <PageHeader title={meta.title} desc={meta.desc} action={canWrite ? meta.action : undefined} />
      {readOnly && <ReadOnlyBanner />}

      {toggle.isError && (
        <div style={{ marginBottom: 10 }}>
          <ErrorBox error={toggle.error} />
        </div>
      )}

      {templates.isError ? (
        <ErrorBox error={templates.error} onRetry={() => void templates.refetch()} />
      ) : (
        <TemplateGrid
          items={templates.data ?? []}
          canWrite={canWrite}
          onToggle={(t) => toggle.mutate(t)}
          busyId={toggle.isPending ? toggle.variables.id : null}
          loading={templates.isPending}
        />
      )}
    </>
  );
}
