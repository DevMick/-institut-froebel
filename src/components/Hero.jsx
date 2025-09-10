import React, { useState, useEffect, useRef } from 'react';
import { fetchHomeData } from '../services/homeApi';
import './Hero.css';

// Données par défaut en cas d'erreur de chargement
const defaultData = {
  title: "L'ÉDUCATION D'AUJOURD'HUI, LES LEADERS DE DEMAIN.",
  videoUrl: 'https://res.cloudinary.com/dntyghmap/video/upload/v1755144106/Spot_Ecole_hrko3u.mp4',
  messages: [
    "Cultivons l'excellence ensemble",
    "Épanouissement et apprentissage",
    "Innovation pédagogique",
    "Construisons l'avenir de vos enfants"
  ],
  badges: [
    { text: "Maternelle • Primaire • Secondaire" },
    { text: "Excellence Pédagogique" }
  ]
};

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
  const [heroData, setHeroData] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);
  const videoRef = useRef(null);

  // Charger les données depuis l'API
  useEffect(() => {
    const loadHeroData = async () => {
      try {
        console.log('🏠 Hero: Chargement des données...');
        const result = await fetchHomeData();
        if (result.success && result.data.hero) {
          console.log('✅ Hero: Données chargées:', result.data.hero);
          console.log('🎥 Hero: URL vidéo:', result.data.hero.videoUrl);
          setHeroData(result.data.hero);
        } else {
          console.warn('⚠️ Hero: Utilisation des données par défaut');
          setHeroData(defaultData);
        }
      } catch (error) {
        console.error('❌ Hero: Erreur chargement:', error);
        setHeroData(defaultData);
      } finally {
        setLoading(false);
      }
    };

    loadHeroData();
  }, []);

  // Forcer le rechargement de la vidéo quand l'URL change
  useEffect(() => {
    if (videoRef.current && heroData.videoUrl) {
      console.log('🔄 Hero: Rechargement vidéo avec URL:', heroData.videoUrl);
      videoRef.current.load(); // Force le rechargement de la vidéo

      // Ajouter un listener pour vérifier si la vidéo se charge
      const handleLoadStart = () => console.log('🎬 Hero: Début chargement vidéo');
      const handleCanPlay = () => console.log('✅ Hero: Vidéo prête à jouer');
      const handleError = (e) => console.error('❌ Hero: Erreur chargement vidéo:', e);

      videoRef.current.addEventListener('loadstart', handleLoadStart);
      videoRef.current.addEventListener('canplay', handleCanPlay);
      videoRef.current.addEventListener('error', handleError);

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadstart', handleLoadStart);
          videoRef.current.removeEventListener('canplay', handleCanPlay);
          videoRef.current.removeEventListener('error', handleError);
        }
      };
    }
  }, [heroData.videoUrl]);

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
    if (!isPaused && heroData.messages && heroData.messages.length > 0) {
      timeoutRef.current = setTimeout(
        () =>
          setCurrentMessage((prevIndex) =>
            prevIndex === heroData.messages.length - 1 ? 0 : prevIndex + 1
          ),
        6000
      );
    }

    return () => {
      resetTimeout();
    };
  }, [currentMessage, isPaused, heroData.messages]);
  
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
        key={heroData.videoUrl || defaultData.videoUrl} // Force le rechargement quand l'URL change
      >
        <source src={heroData.videoUrl || defaultData.videoUrl} type="video/mp4" />
        Votre navigateur ne supporte pas la lecture de vidéos.
      </video>

      <div className="hero-overlay"></div>
      <Particles />

      <div className="hero-content">
        <h1 className="hero-title text-2xl sm:text-3xl md:text-5xl">
          {heroData.title || defaultData.title}
        </h1>

        <div className="hero-badges">
          {heroData.badges && heroData.badges.length > 0 ? (
            heroData.badges.map((badge, index) => (
              <div key={index} className="hero-badge">
                <i className={badge.icon || (index === 0 ? "fas fa-graduation-cap" : "fas fa-award")}></i>
                <span>{badge.text}</span>
              </div>
            ))
          ) : (
            // Fallback vers les badges par défaut
            defaultData.badges.map((badge, index) => (
              <div key={index} className="hero-badge">
                <i className={index === 0 ? "fas fa-graduation-cap" : "fas fa-award"}></i>
                <span>{badge.text}</span>
              </div>
            ))
          )}
        </div>

        <p className="hero-message" id="heroMessage">
          {heroData.messages && heroData.messages.length > 0
            ? heroData.messages[currentMessage]
            : defaultData.messages[currentMessage]
          }
        </p>
      </div>
    </section>
  );
};

export default Hero; 