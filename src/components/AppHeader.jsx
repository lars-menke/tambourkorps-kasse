import { LAST_SEEN_VERSION_KEY } from '../constants';

const APP_VERSION = __APP_VERSION__;

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <div className="app-header__logo">
          <svg viewBox="0 0 30 30" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
            {/* Gekreuzte Schlägel */}
            <line x1="8" y1="4" x2="17" y2="11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            <line x1="22" y1="4" x2="13" y2="11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
            <circle cx="8" cy="4" r="2" fill="white"/>
            <circle cx="22" cy="4" r="2" fill="white"/>
            {/* Trommelkörper */}
            <line x1="7" y1="13" x2="7" y2="22" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3"/>
            <line x1="23" y1="13" x2="23" y2="22" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3"/>
            <ellipse cx="15" cy="22" rx="8" ry="2.2" fill="rgba(255,255,255,0.55)" stroke="rgba(255,255,255,0.7)" strokeWidth="1"/>
            {/* Schlagfell oben */}
            <ellipse cx="15" cy="13" rx="8" ry="2.2" fill="rgba(255,255,255,0.88)" stroke="white" strokeWidth="1"/>
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
