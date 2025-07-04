import React, { useState, useEffect, useRef } from 'react';
import './Hero.css';

const slidesData = [
  {
    img: 'http://institutfroebel.allianceconsultants.net/wp-content/uploads/2025/05/WhatsApp-Image-2025-05-13-a-10.23.39_247153a4.jpg',
    message: "Cultivons l'excellence ensemble"
  },
  {
    img: 'http://institutfroebel.allianceconsultants.net/wp-content/uploads/2025/05/WhatsApp-Image-2025-05-13-a-10.34.58_86e6ad81.jpg',
    message: "Épanouissement et apprentissage"
  },
  {
    img: 'http://institutfroebel.allianceconsultants.net/wp-content/uploads/2025/05/WhatsApp-Image-2025-05-13-a-10.23.39_247153a4.jpg',
    message: "Innovation pédagogique"
  },
  {
    img: 'http://institutfroebel.allianceconsultants.net/wp-content/uploads/2025/05/WhatsApp-Image-2025-05-13-a-10.34.58_86e6ad81.jpg',
    message: "Construisons l'avenir de vos enfants"
  }
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef(null);

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
          setCurrentSlide((prevIndex) =>
            prevIndex === slidesData.length - 1 ? 0 : prevIndex + 1
          ),
        6000
      );
    }

    return () => {
      resetTimeout();
    };
  }, [currentSlide, isPaused]);
  
  return (
    <section 
      id="heroSection" 
      className={`hero-section ${getTheme()} min-h-[220px] h-[320px] md:h-[380px] flex items-center justify-center px-2 md:px-0`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slidesData.map((slide, index) => (
        <div
          key={index}
          className={`slide ${index === currentSlide ? 'active' : ''}`}
          style={{ backgroundImage: `url('${slide.img}')` }}
        ></div>
      ))}
      
      <div className="hero-overlay"></div>
      <Particles />

      <div className="hero-content">
        <h1 className="hero-title text-2xl sm:text-3xl md:text-5xl">L'ÉDUCATION D'AUJOURD'HUI, LES LEADERS DE DEMAIN.</h1>
        
        <div className="hero-badges">
          <div className="hero-badge">
            <i className="fas fa-graduation-cap"></i>
            <span>Maternelle • Primaire • Collège</span>
          </div>
          <div className="hero-badge">
            <i className="fas fa-award"></i>
            <span>Excellence Pédagogique</span>
          </div>
        </div>
        
        <p className="hero-message" id="heroMessage">{slidesData[currentSlide].message}</p>
      </div>
    </section>
  );
};

export default Hero; 