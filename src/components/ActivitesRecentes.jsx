import React from 'react';
import vacance from '../assets/images/Vacance.jpg';
import atelier from '../assets/images/Atelier.jpg';
import inscription from '../assets/images/inscription.jpg';
import evenement from '../assets/images/Evenement.jpg';

const activites = [
  {
    image: vacance,
    badge: 'VACANCES',
    badgeColor: 'bg-yellow-400',
    description: "Colonie de vacances : des moments inoubliables d'aventures, d'apprentissage et de découvertes pour nos élèves.",
  },
  {
    image: atelier,
    badge: 'ATELIERS',
    badgeColor: 'bg-red-400',
    description: "Les ateliers de l'automne à l'Institut Froebel : créativité, arts plastiques et découvertes scientifiques au programme.",
  },
  {
    image: inscription,
    badge: 'INSCRIPTIONS OUVERTES',
    badgeColor: 'bg-green-500',
    description: "Les inscriptions pour l'année scolaire 2025–2026 ont commencé et se poursuivent tous les jours. Rejoignez l'excellence de l'Institut Froebel !",
  },
  {
    image: evenement,
    badge: 'ÉVÉNEMENT',
    badgeColor: 'bg-yellow-500',
    description: "Célébration du Mardi Gras : une journée festive remplie de couleurs, de musique et de joie partagée avec nos élèves.",
  },
];

const ActivitesRecentes = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-green-700 text-center mb-8">NOS RÉCENTES ACTIVITÉS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {activites.map((act, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition"
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              <div className="relative">
                <img src={act.image} alt={act.badge} className="w-full h-40 object-cover" />
                <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow ${act.badgeColor}`}>
                  {act.badge}
                </span>
              </div>
              <div className="p-5 flex-1 flex items-center">
                <p className="text-gray-700 text-base text-center">{act.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActivitesRecentes; 