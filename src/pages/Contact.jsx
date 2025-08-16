import React from 'react';

const chiffres = [
  { valeur: '50+', label: "Années d'excellence" },
  { valeur: '5000+', label: 'Anciens élèves' },
  { valeur: '98%', label: 'Taux de réussite' },
];

import ContactForm from '../components/ContactForm';

const Contact = () => {
  return (
    <>
      <section className="relative w-full min-h-[220px] h-[320px] md:h-[380px] flex flex-col items-center justify-center bg-gradient-to-br from-[#00A86B] to-[#43e497] overflow-hidden px-2 md:px-0">
        {/* Effet bulles */}
        <div className="absolute inset-0 z-0">
          {[...Array(30)].map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                width: `${12 + Math.random() * 24}px`,
                height: `${12 + Math.random() * 24}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                filter: 'blur(1px)',
              }}
            />
          ))}
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full text-center px-2 md:px-4">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">REJOIGNEZ L'EXCELLENCE</h1>
          <p className="text-white text-base sm:text-lg md:text-2xl font-medium drop-shadow max-w-2xl mx-auto mb-8">
            Depuis 1975, l'Institut Froebel forme les leaders de demain.<br />
            Découvrez nos écoles d'exception et rejoignez une communauté éducative qui place la réussite de chaque élève au cœur de sa mission.
          </p>
          <div className="flex flex-col md:flex-row gap-8 justify-center w-full max-w-2xl">
            {chiffres.map((c, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-1">{c.valeur}</div>
                <div className="text-white/80 text-xs sm:text-sm md:text-base text-center">{c.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ContactForm />
    </>
  );
};

export default Contact; 