import { LAST_SEEN_VERSION_KEY } from '../constants';

const APP_VERSION = __APP_VERSION__;

export default function AppHeader() {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <div className="app-header__logo">€</div>
        <div className="app-header__name">
          <span className="app-header__title">Kasse</span>
          <span className="app-header__sub">Tambourkorps</span>
        </div>
      </div>
      <span className="app-header__version">v{APP_VERSION}</span>
    </header>
  );
}
