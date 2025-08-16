import React from 'react';
import { FaGraduationCap, FaMoneyBillWave, FaUserGraduate } from 'react-icons/fa';
import image5 from '../assets/images/image5.jpeg';

const pedagogies = [
  {
    icon: <FaMoneyBillWave className="text-green-600 text-3xl mb-2" />,
    titre: 'Méthodes Innovantes',
    desc: "Technologie éducative intégrée avec des outils numériques de pointe. Tableaux interactifs, plateformes d'apprentissage en ligne et ressources multimédias enrichissent l'expérience éducative de nos élèves.",
  },
  {
    icon: <FaUserGraduate className="text-green-600 text-3xl mb-2" />,
    titre: 'Apprentissage Personnalisé',
    desc: "Accompagnement adapté à chaque élève selon ses besoins, son rythme et son style d'apprentissage. Nos enseignants qualifiés offrent un suivi individualisé pour maximiser le potentiel de chaque enfant.",
  },
];

const NotrePedagogie = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-green-600 text-center mb-2">NOTRE PÉDAGOGIE</h2>
        <div className="flex items-center justify-center gap-2 mb-8">
          <FaGraduationCap className="text-green-600 text-xl" />
          <span className="text-green-700 font-medium">Ce qui nous différencie</span>
        </div>
        {/* Bloc principal */}
        <div className="bg-white rounded-2xl shadow p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center border border-green-200 mb-12">
          <div className="flex-1">
            <p className="text-gray-700 mb-6">
              À l'Institut Froebel, notre approche pédagogique unique combine tradition académique et innovation moderne pour offrir une éducation d'excellence adaptée aux défis du 21ème siècle.
            </p>
            <div className="bg-green-50 border-l-4 border-green-500 rounded p-4">
              <h3 className="text-green-700 font-bold mb-1">Notre Philosophie Éducative</h3>
              <p className="text-gray-700 text-sm">
                Nous croyons que chaque élève est unique et possède un potentiel extraordinaire. Notre mission est de créer un environnement d'apprentissage stimulant qui favorise l'épanouissement intellectuel, créatif et social de chaque enfant.
              </p>
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <img src={image5} alt="Élèves en classe - Institut Froebel" className="rounded-xl shadow-lg w-full max-w-xs object-cover" />
            <span className="absolute top-4 left-4 bg-green-600 text-white text-xs font-semibold px-4 py-1 rounded-full shadow">Innovation Pédagogique</span>
          </div>
        </div>
        {/* Cartes pédagogiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {pedagogies.map((p, idx) => (
            <div key={p.titre} className="bg-green-50 rounded-2xl shadow p-6 flex flex-col items-center text-center border border-green-100">
              {p.icon}
              <h4 className="text-lg font-bold text-gray-800 mb-2">{p.titre}</h4>
              <p className="text-gray-600 text-sm">{p.desc}</p>
            </div>
          ))}
        </div>
        {/* Développement Complet */}
        <div className="bg-green-50 rounded-2xl p-8 flex flex-col items-center">
          <h3 className="text-xl md:text-2xl font-extrabold text-green-600 mb-6">Développement Complet</h3>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <div className="flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow border-2 border-green-200">
              <span className="bg-green-500 text-white rounded-full p-2"><svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 20v-6m0 0V4m0 10l-3-3m3 3l3-3' /></svg></span>
              <span className="font-semibold text-gray-700">Créativité</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow">
              <span className="bg-green-500 text-white rounded-full p-2"><svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 3.13a4 4 0 010 7.75M8 3.13a4 4 0 000 7.75' /></svg></span>
              <span className="font-semibold text-gray-700">Leadership</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow">
              <span className="bg-green-500 text-white rounded-full p-2"><svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' /></svg></span>
              <span className="font-semibold text-gray-700">Autonomie</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotrePedagogie; 