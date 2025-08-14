import React from 'react';
import maternelleImg from '../assets/images/maternelle.jpg';
import blio from '../assets/images/blio.jpg';
import salleClasseImg from '../assets/images/_DSC0230.jpg';
import cours from '../assets/images/cours.jpg';
import eleve from '../assets/images/eleve.jpg';
import secondaireImg from '../assets/images/secondaire.jpg';
import sallePolyvalenteImg from '../assets/images/salle polyvalente.jpg';
import transportImg from '../assets/images/_DSC0278.jpg';

const photos = [
  {
    src: maternelleImg,
    titre: "École Maternelle",
    desc: "Nos plus jeunes élèves évoluent dans un environnement coloré et adapté à leur développement",
  },
  {
    src: blio,
    titre: "Bibliothèque Moderne",
    desc: "Un espace de lecture et de découverte équipé des dernières technologies pour encourager l'amour des livres",
  },
  {
    src: salleClasseImg,
    titre: "Salles de Classe",
    desc: "Environnement d'apprentissage lumineux et technologiquement avancé",
  },
  {
    src: blio,
    titre: "Laboratoire Sciences",
    desc: "Équipements modernes pour l'expérimentation et la découverte scientifique",
  },
  {
    src: cours,
    titre: "Cour de Récréation",
    desc: "Grand espace de jeu sécurisé où nos élèves peuvent se détendre et socialiser",
  },
  {
    src: eleve,
    titre: "Nos Élèves du Primaire",
    desc: "Des enfants curieux et motivés qui développent leurs compétences fondamentales avec passion",
  },
  {
    src: secondaireImg,
    titre: "Sécondaire",
    desc: "Formation secondaire d'excellence avec accompagnement personnalisé",
  },
  {
    src: sallePolyvalenteImg,
    titre: "Salle Polyvalente",
    desc: "Nos salles informatique modernes équipées pour l'apprentissage numérique",
  },
  {
    src: transportImg,
    titre: "Moyen de Transport",
    desc: "Service de transport scolaire sécurisé pour nos élèves",
  },
];

const chiffres = [
  { valeur: '2500', label: 'Nos élèves' },
  { valeur: '300', label: 'Nos Enseignants' },
  { valeur: '99', label: 'Taux de réussite (%)' },
  { valeur: '20', label: "Années d'excellence" },
];

const GaleriePhoto = () => {
  return (
    <section className="py-16 bg-green-50">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-green-700 text-center mb-2">GALERIE PHOTO</h2>
        <p className="text-gray-500 text-center mb-8">Découvrez nos espaces d'apprentissage et de vie</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {photos.map((photo, idx) => (
            <div key={idx} className="relative rounded-xl overflow-hidden group shadow-lg">
              <img src={photo.src} alt={photo.titre} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center text-center p-4">
                <h3 className="text-lg font-bold text-white mb-2">{photo.titre}</h3>
                <p className="text-white text-sm">{photo.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white rounded-xl shadow p-6">
          {chiffres.map((c, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="text-2xl md:text-3xl font-extrabold text-green-700 mb-1">{c.valeur}</div>
              <div className="text-gray-600 text-sm md:text-base text-center">{c.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GaleriePhoto; 