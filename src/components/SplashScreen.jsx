import { useEffect, useState } from 'react';

export default function SplashScreen({ onDone }) {
  const [fadingOut, setFadingOut]   = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

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
        <div className={`splash__logo${logoLoaded ? ' splash__logo--loaded' : ''}`}>
          <img
            src={`${import.meta.env.BASE_URL}logo.PNG`}
            alt="Tambourkorps Logo"
            onLoad={() => setLogoLoaded(true)}
          />
        </div>
        <div className={`splash__name${logoLoaded ? ' splash__name--show' : ''}`}>
          TambourWallet
        </div>
        <div className={`splash__sub${logoLoaded ? ' splash__sub--show' : ''}`}>
          Kassenbuch des Tambourkorps
        </div>
      </div>
      <div className="splash__progress-wrap">
        <div className={`splash__progress-bar${logoLoaded ? ' splash__progress-bar--run' : ''}`} />
      </div>
    </div>
  );
}
