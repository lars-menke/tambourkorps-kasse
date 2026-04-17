import { useEffect, useState } from 'react';

export default function SplashScreen({ onDone }) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => {
      setFadingOut(true);
      setTimeout(onDone, 400);
    }, 2300);
    return () => clearTimeout(show);
  }, [onDone]);

  return (
    <div className={`splash${fadingOut ? ' splash--out' : ''}`}>
      <div className="splash__content">
        <div className="splash__logo">
          <img src="/logo.png" alt="Tambourkorps Logo" />
        </div>
        <div className="splash__name">TambourWallet</div>
        <div className="splash__sub">Kassenbuch des Tambourkorps</div>
      </div>
      <div className="splash__progress-wrap">
        <div className="splash__progress-bar" />
      </div>
    </div>
  );
}
