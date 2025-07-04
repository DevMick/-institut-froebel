import React from 'react';
import { FaUniversity } from 'react-icons/fa';
import { GiFlowerPot } from 'react-icons/gi';

const etablissements = [
  {
    nom: 'La Tulipe',
    adresse: 'Marcory Anoumabo',
    niveaux: ['Préscolaire', 'Primaire', 'Secondaire'],
    badge: 'Seul site avec secondaire',
    icon: <FaUniversity className="text-green-500 text-3xl mx-auto" />,
  },
  {
    nom: 'La Marguerite',
    adresse: 'Marcory Cité Jean-Baptiste Mockey',
    niveaux: ['Préscolaire', 'Primaire'],
    icon: <GiFlowerPot className="text-green-500 text-3xl mx-auto" />,
  },
  {
    nom: 'La Rose',
    adresse: 'Yopougon - Groupement Foncier',
    niveaux: ['Préscolaire', 'Primaire'],
    icon: <GiFlowerPot className="text-green-500 text-3xl mx-auto" />,
  },
  {
    nom: 'Les Orchidées',
    adresse: 'Yopougon - Groupement Foncier',
    niveaux: ['Préscolaire', 'Primaire'],
    icon: <GiFlowerPot className="text-green-500 text-3xl mx-auto" />,
  },
];

const Etablissements = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-green-700 text-center mb-2">NOS ÉTABLISSEMENTS</h2>
        <p className="text-gray-600 text-center mb-10">Quatre sites d'excellence répartis stratégiquement dans Abidjan, offrant un environnement sécurisé et propice à l'apprentissage.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {etablissements.map((etab, idx) => (
            <div key={etab.nom} className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center relative border border-gray-100 hover:shadow-lg transition">
              <div className="mb-4">{etab.icon}</div>
              <h3 className="text-lg font-bold text-gray-800 mb-1 text-center">{etab.nom}</h3>
              <p className="text-gray-500 text-center mb-4">{etab.adresse}</p>
              <div className="flex flex-wrap justify-center gap-2 mb-2">
                <span className="bg-green-50 text-green-700 font-semibold px-4 py-1 rounded-full text-sm">
                  {etab.niveaux.join(' • ')}
                </span>
              </div>
              {etab.badge && (
                <span className="bg-yellow-400 text-white font-semibold px-3 py-1 rounded-full text-xs mt-2 shadow">{etab.badge}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Etablissements; 