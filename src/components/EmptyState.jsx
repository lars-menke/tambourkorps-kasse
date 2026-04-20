export function EmptyState({ illustration, title, description, action }) {
  return (
    <div className="empty-state">
      {illustration && <div className="empty-state__art">{illustration}</div>}
      <h3 className="empty-state__title">{title}</h3>
      {description && <p className="empty-state__desc">{description}</p>}
      {action && (
        <button className="btn btn--primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
