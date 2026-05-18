import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { dbGetAll } from '../services/db';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Übersicht',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    to: '/buchungen',
    label: 'Buchungen',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    to: '/umlagen',
    label: 'Umlagen',
    badgeKey: 'umlagen',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    to: '/einstellungen',
    label: 'Einstellungen',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

function useUmlagenBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function load() {
      const [umlagen, statuses] = await Promise.all([
        dbGetAll('umlagen'),
        dbGetAll('umlage_status'),
      ]);
      const statusByUmlage = statuses.reduce((acc, s) => {
        (acc[s.umlage_id] ??= []).push(s);
        return acc;
      }, {});
      const openCount = umlagen.filter(u => {
        const ss = statusByUmlage[u.id] ?? [];
        const offen = ss.filter(s => s.status !== 'bezahlt' && s.status !== 'befreit').length;
        return offen > 0;
      }).length;
      setCount(openCount);
    }
    load().catch(() => {});
  }, []);

  return count;
}

export default function BottomNav() {
  const umlagenBadge = useUmlagenBadge();
  const badges = { umlagen: umlagenBadge };

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ to, label, icon, badgeKey }) => {
        const badge = badgeKey ? badges[badgeKey] : 0;
        return (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `bottom-nav__item${isActive ? ' bottom-nav__item--active' : ''}`}
          >
            <span className="bottom-nav__pill">
            <span className="bottom-nav__icon">
              {icon}
              {badge > 0 && (
                <span className="nav-badge">{badge > 99 ? '99+' : badge}</span>
              )}
            </span>
            <span className="bottom-nav__label">{label}</span>
          </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
