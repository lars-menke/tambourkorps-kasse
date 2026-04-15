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
          <svg viewBox="0 0 192 192" width="96" height="96" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="58" width="152" height="86" rx="18" fill="white"/>
            <rect x="106" y="70" width="54" height="62" rx="12" fill="#0f4c23"/>
            <circle cx="133" cy="101" r="19" fill="white"/>
          </svg>
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
