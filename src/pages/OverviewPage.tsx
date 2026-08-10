import PageHeader from '@/components/layout/PageHeader';
import ActivityFeed, { ActivityFeedSkeleton } from '@/components/modules/overview/ActivityFeed';
import KpiGrid, { KpiGridSkeleton } from '@/components/modules/overview/KpiGrid';
import ErrorBox from '@/components/ui/ErrorBox';
import ReadOnlyBanner from '@/components/ui/ReadOnlyBanner';
import { MODULE_BY_KEY } from '@/hooks/useRbac';
import { useOverview } from '@/hooks/useOverview';
import { usePermissions } from '@/hooks/usePermissions';

const meta = MODULE_BY_KEY.overview;

export default function OverviewPage() {
  const { canWrite, readOnly } = usePermissions('overview');
  const { data, isPending, isError, error, refetch } = useOverview();

  return (
    <>
      <PageHeader title={meta.title} desc={meta.desc} action={canWrite ? meta.action : undefined} />
      {readOnly && <ReadOnlyBanner />}

      {isError ? (
        <ErrorBox error={error} onRetry={() => void refetch()} />
      ) : isPending ? (
        <>
          <KpiGridSkeleton />
          <ActivityFeedSkeleton />
        </>
      ) : (
        <>
          <KpiGrid kpis={data.kpis} />
          <ActivityFeed items={data.activity} />
        </>
      )}
    </>
  );
}
