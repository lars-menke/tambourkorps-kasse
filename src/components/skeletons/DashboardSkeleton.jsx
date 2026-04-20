import { Skeleton } from '../Skeleton';

export function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton h={150} radius="var(--radius-xl)" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Skeleton h={72} radius="var(--radius-lg)" />
        <Skeleton h={72} radius="var(--radius-lg)" />
      </div>
      <Skeleton h={160} radius="var(--radius-lg)" />
    </div>
  );
}
