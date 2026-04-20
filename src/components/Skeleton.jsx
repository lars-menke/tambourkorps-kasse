export function Skeleton({ w = '100%', h = 16, radius = '6px', className = '' }) {
  return (
    <span
      className={`skeleton${className ? ` ${className}` : ''}`}
      style={{
        width: typeof w === 'number' ? `${w}px` : w,
        height: typeof h === 'number' ? `${h}px` : h,
        borderRadius: radius,
      }}
      aria-hidden="true"
    />
  );
}
