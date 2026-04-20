import { Skeleton } from '../Skeleton';

export function TxnListSkeleton({ rows = 6 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '36px 1fr auto',
            gap: 12,
            padding: 12,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Skeleton w={36} h={36} radius="10px" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Skeleton w="60%" h={14} />
            <Skeleton w="40%" h={10} />
          </div>
          <Skeleton w={72} h={16} />
        </div>
      ))}
    </div>
  );
}
