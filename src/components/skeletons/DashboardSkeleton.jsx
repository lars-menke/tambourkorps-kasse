import { Skeleton } from '../Skeleton';

export function DashboardSkeleton() {
  return (
    <>
      {/* Balance Card */}
      <Skeleton h={150} radius="var(--r-xl)" style={{ gridColumn: '1 / -1' }} />

      {/* Stat Cards */}
      <Skeleton h={80} radius="var(--r-xl)" />
      <Skeleton h={80} radius="var(--r-xl)" />

      {/* Action Cards */}
      <Skeleton h={60} radius="var(--r-xl)" />
      <Skeleton h={60} radius="var(--r-xl)" />

      {/* Donut */}
      <Skeleton h={200} radius="var(--r-xl)" style={{ gridColumn: '1 / -1' }} />
    </>
  );
}
