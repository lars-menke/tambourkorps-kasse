import { LAST_SEEN_VERSION_KEY } from '../constants';

const APP_VERSION = __APP_VERSION__;

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <div className="app-header__logo">
          <svg viewBox="0 0 192 192" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
            <line x1="60" y1="34" x2="104" y2="73" stroke="white" strokeWidth="7" strokeLinecap="round"/>
            <circle cx="60" cy="34" r="10" fill="white"/>
            <line x1="132" y1="34" x2="88" y2="73" stroke="white" strokeWidth="7" strokeLinecap="round"/>
            <circle cx="132" cy="34" r="10" fill="white"/>
            <line x1="48" y1="82" x2="48" y2="130" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
            <line x1="144" y1="82" x2="144" y2="130" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
            <ellipse cx="96" cy="130" rx="48" ry="14" fill="white" opacity="0.55"/>
            <ellipse cx="96" cy="82" rx="48" ry="14" fill="white"/>
          </svg>
        </div>
        <div className="app-header__name">
          <span className="app-header__title">Kasse</span>
          <span className="app-header__sub">Tambourkorps</span>
        </div>
      </div>
      <span className="app-header__version">v{APP_VERSION}</span>
    </header>
  );
}
