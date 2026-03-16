
import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [particles, setParticles] = useState<{ id: number; size: number; tx: number; ty: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate particles
    const particleCount = 45;
    const newParticles = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 140 + 60;
      newParticles.push({
        id: i,
        size: Math.random() * 3 + 2,
        tx: Math.cos(angle) * radius,
        ty: Math.sin(angle) * radius,
        delay: Math.random() * 0.3 + 0.6,
      });
    }
    setParticles(newParticles);

    // Finish after 3 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div style={styles.container}>
      <div style={styles.glow}></div>

      <div style={styles.particlesContainer}>
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              ...styles.particle,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              // @ts-ignore
              '--tx': `${p.tx}px`,
              '--ty': `${p.ty}px`,
            }}
          ></div>
        ))}
      </div>

      <div style={styles.logoContainer}>
        <img
          src="Gemini_Generated_Image_bn3cj1bn3cj1bn3c.png"
          alt="UniParty Logo"
          style={styles.logo}
        />
        <h1 style={styles.brandText}>UNIPARTY</h1>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#020617',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    touchAction: 'none',
  },
  glow: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    borderRadius: '50%',
    boxShadow: '0 0 150px 120px #6d28d9',
    opacity: 0,
    zIndex: 1,
    animation: 'glow-in 2s ease-out forwards',
    animationDelay: '0.3s',
  },
  logoContainer: {
    position: 'relative',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logo: {
    width: '160px',
    height: 'auto',
    borderRadius: '36px',
    opacity: 0,
    transform: 'scale(0.5)',
    animation: 'logo-in 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
    animationDelay: '0.6s',
  },
  brandText: {
    color: '#ffffff',
    fontWeight: 300,
    fontSize: '1.4rem',
    letterSpacing: '4px',
    marginTop: '24px',
    opacity: 0,
    transform: 'translateY(10px)',
    animation: 'text-in 1s ease-out forwards',
    animationDelay: '1.2s',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 5,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    backgroundColor: '#ffffff',
    borderRadius: '50%',
    opacity: 0,
    animation: 'particle-float 1.5s ease-out forwards',
  },
};

export default SplashScreen;
