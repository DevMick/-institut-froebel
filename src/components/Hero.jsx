import React, { useState, useEffect, useRef } from 'react';
import './Hero.css';

// URL Cloudinary pour la vidéo (optimisée pour le web)
const spotEcoleVideo = 'https://res.cloudinary.com/dntyghmap/video/upload/v1755144106/Spot_Ecole_hrko3u.mp4';

const messagesData = [
  "Cultivons l'excellence ensemble",
  "Épanouissement et apprentissage",
  "Innovation pédagogique",
  "Construisons l'avenir de vos enfants"
];

const Particles = () => {
    const particles = Array.from({ length: 20 }).map((_, i) => (
        <div 
            key={i}
            className="particle"
            style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${15 + Math.random() * 10}s`
            }}
        ></div>
    ));

    return <div className="hero-particles">{particles}</div>;
};


const Hero = () => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef(null);
  const videoRef = useRef(null);

  const getTheme = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  };

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    if (!isPaused) {
      timeoutRef.current = setTimeout(
        () =>
          setCurrentMessage((prevIndex) =>
            prevIndex === messagesData.length - 1 ? 0 : prevIndex + 1
          ),
        6000
      );
    }

    return () => {
      resetTimeout();
    };
  }, [currentMessage, isPaused]);
  
  return (
    <section
      id="heroSection"
      className={`hero-section ${getTheme()} min-h-[220px] h-[320px] md:h-[380px] flex items-center justify-center px-2 md:px-0`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <video
        ref={videoRef}
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={spotEcoleVideo} type="video/mp4" />
        Votre navigateur ne supporte pas la lecture de vidéos.
      </video>

      <div className="hero-overlay"></div>
      <Particles />

      <div className="hero-content">
        <h1 className="hero-title text-2xl sm:text-3xl md:text-5xl">L'ÉDUCATION D'AUJOURD'HUI, LES LEADERS DE DEMAIN.</h1>

        <div className="hero-badges">
          <div className="hero-badge">
            <i className="fas fa-graduation-cap"></i>
            <span>Maternelle • Primaire • Secondaire</span>
          </div>
          <div className="hero-badge">
            <i className="fas fa-award"></i>
            <span>Excellence Pédagogique</span>
          </div>
        </div>

        <p className="hero-message" id="heroMessage">{messagesData[currentMessage]}</p>
      </div>
    </section>
  );
};

export default Hero; 