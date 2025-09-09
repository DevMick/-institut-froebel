import React, { useState } from 'react';
import { FaBookOpen, FaBaby, FaChild, FaBook, FaGraduationCap, FaCheckCircle, FaStar, FaHeart, FaRocket } from 'react-icons/fa';

// Configuration des icônes et couleurs pour chaque cycle
const cycleConfig = {
  'creche-garderie': {
    icon: <FaBaby className="text-pink-500 text-4xl" />,
    gradient: 'from-pink-400 via-pink-300 to-pink-200',
    bgColor: 'bg-gradient-to-br from-pink-50 to-pink-100',
    borderColor: 'border-pink-200',
    accentIcon: <FaHeart className="text-pink-400" />,
  },
  'maternelle': {
    icon: <FaChild className="text-amber-500 text-4xl" />,
    gradient: 'from-amber-400 via-yellow-300 to-amber-200',
    bgColor: 'bg-gradient-to-br from-amber-50 to-yellow-100',
    borderColor: 'border-amber-200',
    accentIcon: <FaStar className="text-amber-400" />,
  },
  'primaire': {
    icon: <FaBook className="text-emerald-500 text-4xl" />,
    gradient: 'from-emerald-400 via-green-300 to-emerald-200',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-green-100',
    borderColor: 'border-emerald-200',
    accentIcon: <FaCheckCircle className="text-emerald-400" />,
  },
  'secondaire': {
    icon: <FaGraduationCap className="text-blue-500 text-4xl" />,
    gradient: 'from-blue-400 via-indigo-300 to-blue-200',
    bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    borderColor: 'border-blue-200',
    accentIcon: <FaRocket className="text-blue-400" />,
  },
};

const CyclesFroebel = ({ data }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  // Si pas de données, ne rien afficher
  if (!data || !data.cycles) {
    return (
      <div className="w-full">
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600">Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  const cycles = data.cycles;
  const ctaSection = data.ctaSection;

  return (
    <div className="w-full">
      <section className="px-0 md:px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {cycles.map((cycle, idx) => {
              const config = cycleConfig[cycle.id] || cycleConfig['creche-garderie']; // Fallback
              return (
                <div
                  key={cycle.titre}
                  className={`group relative overflow-hidden rounded-3xl border-2 ${config.borderColor} ${config.bgColor}
                            transform transition-all duration-500 ease-out cursor-pointer
                            ${hoveredCard === idx ? 'scale-105 shadow-2xl' : 'shadow-lg hover:shadow-xl'}
                            ${selectedCard === idx ? 'ring-4 ring-emerald-300 ring-opacity-50' : ''}`}
                  onMouseEnter={() => setHoveredCard(idx)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => setSelectedCard(selectedCard === idx ? null : idx)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-gray-700 shadow-md">
                    {cycle.age}
                  </div>
                  <div className="relative p-8">
                    <div className="flex items-start gap-6 mb-6">
                      <div className={`p-4 rounded-2xl bg-white shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                        {config.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {config.accentIcon}
                          <h2 className="text-2xl font-bold text-gray-800 group-hover:text-emerald-700 transition-colors duration-300">
                            {cycle.titre}
                          </h2>
                        </div>
                        <div className={`h-1 bg-gradient-to-r ${config.gradient} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                      {cycle.description}
                    </p>
                    <div className="space-y-3">
                      {cycle.points.map((point, i) => (
                        <div
                          key={i}
                          className={`flex items-center gap-3 p-3 rounded-xl bg-white bg-opacity-60 backdrop-blur-sm
                                    transform transition-all duration-300
                                    ${hoveredCard === idx ? 'translate-x-2 shadow-md' : ''}`}
                        >
                          <FaCheckCircle className={`text-emerald-500 flex-shrink-0 transition-transform duration-300 ${hoveredCard === idx ? 'scale-125' : ''}`} />
                          <span className="text-gray-700 font-medium">{point}</span>
                        </div>
                      ))}
                    </div>
                  <div className="mt-6 text-center">
                    <div className={`inline-flex items-center gap-2 text-sm text-gray-500 transition-all duration-300 ${selectedCard === idx ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                      <span>Cliquez pour plus d'informations</span>
                      <div className={`w-2 h-2 bg-emerald-400 rounded-full transition-transform duration-500 ${selectedCard === idx ? 'scale-150' : 'group-hover:scale-125'}`}></div>
                    </div>
                    </div>
                    <div className="mt-6 text-center">
                      <div className={`inline-flex items-center gap-2 text-sm text-gray-500 transition-all duration-300 ${selectedCard === idx ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
                        <span>Cliquez pour plus d'informations</span>
                        <div className={`w-2 h-2 bg-emerald-400 rounded-full transition-transform duration-500 ${selectedCard === idx ? 'scale-150' : 'group-hover:scale-125'}`}></div>
                      </div>
                    </div>
                  </div>
                  {selectedCard === idx && (
                    <div className="border-t border-gray-200 p-6 bg-white bg-opacity-80 backdrop-blur-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">✨ Avantages spécifiques</h4>
                          <p className="text-sm text-gray-600">
                            Méthodes pédagogiques adaptées à chaque tranche d'âge avec un suivi personnalisé.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">🎯 Objectifs principaux</h4>
                          <p className="text-sm text-gray-600">
                            Développement harmonieux de l'enfant dans un environnement bienveillant et stimulant.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-12 text-center">
            <div className="inline-flex flex-col items-center gap-4 p-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl shadow-2xl text-white">
              <h3 className="text-2xl font-bold">{ctaSection?.title || 'Prêt à rejoindre notre famille éducative ?'}</h3>
              <p className="text-emerald-100 max-w-md">
                {ctaSection?.description || 'Découvrez comment nous pouvons accompagner votre enfant dans son parcours éducatif.'}
              </p>
              <button className="bg-white text-emerald-600 px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                {ctaSection?.buttonText || 'Nous contacter'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CyclesFroebel; 