import { LAST_SEEN_VERSION_KEY } from '../constants';

const APP_VERSION = __APP_VERSION__;

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <div className="app-header__logo">
          <svg viewBox="0 0 192 192" width="22" height="22" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="58" width="152" height="86" rx="18" fill="white"/>
            <rect x="106" y="70" width="54" height="62" rx="12" fill="#0f4c23"/>
            <circle cx="133" cy="101" r="19" fill="white"/>
          </svg>
        </div>
        <div className="app-header__name">
          <span className="app-header__title">TambourWallet</span>
        </div>
      </div>
      <span className="app-header__version">v{APP_VERSION}</span>
    </header>
  );
}
