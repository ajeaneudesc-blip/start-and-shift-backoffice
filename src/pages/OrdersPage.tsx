import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { advanceOrder, listOrders, type OrderRow } from '@/api/orders';
import PageHeader from '@/components/layout/PageHeader';
import NewOrderModal from '@/components/modules/orders/NewOrderModal';
import OrderTable from '@/components/modules/orders/OrderTable';
import ErrorBox from '@/components/ui/ErrorBox';
import ReadOnlyBanner from '@/components/ui/ReadOnlyBanner';
import Select, { type Option } from '@/components/ui/Select';
import { ORDER_STATE_LABELS } from '@/labels';
import { usePermissions } from '@/hooks/usePermissions';
import { MODULE_BY_KEY } from '@/hooks/useRbac';
import { Colors, Radius } from '@/theme/tokens';
import type { OrderState } from '@/types';

const meta = MODULE_BY_KEY.orders;

type StatusFilter = OrderState | 'all';

const STATUS_OPTIONS: Option<StatusFilter>[] = [
  { value: 'all', label: 'Tous les états' },
  ...(Object.keys(ORDER_STATE_LABELS) as OrderState[]).map((s) => ({
    value: s as StatusFilter,
    label: ORDER_STATE_LABELS[s],
  })),
];

export default function OrdersPage() {
  const { canWrite, readOnly } = usePermissions('orders');
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  const orders = useQuery({
    queryKey: ['orders', status],
    queryFn: () => listOrders(status),
  });

  const advance = useMutation({
    // `nextState` vient de l'API : elle refuse tout autre saut (409).
    mutationFn: (order: OrderRow) => advanceOrder(order.ref, order.nextState!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      void queryClient.invalidateQueries({ queryKey: ['overview'] });
    },
  });

  return (
    <>
      <PageHeader
        title={meta.title}
        desc={meta.desc}
        action={canWrite ? meta.action : undefined}
        onAction={canWrite ? () => setNewOrderOpen(true) : undefined}
      >
        <Select
          aria-label="État"
          value={status}
          options={STATUS_OPTIONS}
          onChange={setStatus}
        />
      </PageHeader>

      <NewOrderModal open={newOrderOpen} onClose={() => setNewOrderOpen(false)} />

      {readOnly && <ReadOnlyBanner />}

      {advance.isError && (
        <div style={{ marginBottom: 10 }}>
          <ErrorBox error={advance.error} />
        </div>
      )}

      {orders.isError ? (
        <ErrorBox error={orders.error} onRetry={() => void orders.refetch()} />
      ) : (
        <div
          style={{
            border: `1px solid ${Colors.border}`,
            borderRadius: Radius.lg,
            background: Colors.surface,
            overflow: 'hidden',
          }}
        >
          <OrderTable
            items={orders.data ?? []}
            canWrite={canWrite}
            onAdvance={(o) => advance.mutate(o)}
            busyRef={advance.isPending ? advance.variables.ref : null}
            loading={orders.isPending}
          />
        </div>
      )}
    </>
  );
}
