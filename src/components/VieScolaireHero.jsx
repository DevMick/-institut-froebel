import React, { useState, useEffect, useRef } from 'react';
import BEPC25 from '../assets/images/BEPC 25.png';
import CEPE25 from '../assets/images/CEPE 25.png';
import '../components/Hero.css';

const slidesData = [
  {
    img: BEPC25,
    message: "Félicitations à nos lauréats du BEPC 2025 !"
  },
  {
    img: CEPE25,
    message: "Bravo à tous les admis au CEPE 2025 !"
  }
];

const Particles = () => {
  const particles = Array.from({ length: 16 }).map((_, i) => (
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

const VieScolaireHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef(null);

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
      id="vieScolaireHeroSection"
      className="hero-section morning flex items-center justify-center px-2 md:px-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slidesData.map((slide, index) => (
        <img
          key={index}
          src={slide.img}
          alt={slide.message}
          className={`slide ${index === currentSlide ? 'active' : ''}`}
          style={{
            width: '100%',
            display: index === currentSlide ? 'block' : 'none',
            objectFit: 'cover',
            objectPosition: 'center',
            position: 'relative',
            zIndex: 0
          }}
        />
      ))}
      <div className="hero-overlay"></div>
      <Particles />
    </section>
  );
};

export default VieScolaireHero; 