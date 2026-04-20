export function OnboardingProgress({ current, total }) {
  return (
    <div className="ob-progress" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`ob-progress__dot${i < current ? ' is-done' : ''}${i === current ? ' is-current' : ''}`}
        />
      ))}
    </div>
  );
}
