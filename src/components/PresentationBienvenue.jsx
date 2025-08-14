import React from 'react';
import maternelleImg from '../assets/images/maternelle.jpg';
import primaireImg from '../assets/images/primaire.jpg';
import secondaireImg from '../assets/images/secondaire.jpg';

const niveaux = [
  {
    titre: "ÉCOLE MATERNELLE",
    description: "Un cadre accueillant où les plus jeunes découvrent le plaisir d'apprendre à travers des activités ludiques et éducatives.",
    image: maternelleImg,
  },
  {
    titre: "ÉCOLE PRIMAIRE",
    description: "Un programme solide qui combine apprentissage académique et développement des compétences sociales.",
    image: primaireImg,
  },
  {
    titre: "SÉCONDAIRE",
    description: "Un environnement structuré pour renforcer les acquis et préparer les élèves aux défis du secondaire.",
    image: secondaireImg,
  },
];

const PresentationBienvenue = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-green-700 text-center mb-4">BIENVENUE À L'INSTITUT FROEBEL</h2>
        <p className="text-gray-700 text-center mb-10 max-w-2xl mx-auto">
          Ancré dans des valeurs d'excellence et d'innovation pédagogique, l'Institut Froebel se positionne comme une référence éducative à Abidjan, avec des établissements dédiés à chaque étape du parcours scolaire.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {niveaux.map((n, idx) => (
            <div key={n.titre} className="bg-green-50 rounded-2xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition">
              <img src={n.image} alt={n.titre} className="w-full h-40 object-cover rounded-xl mb-4" />
              <h3 className="text-lg font-bold text-green-800 mb-2 text-center">{n.titre}</h3>
              <p className="text-gray-600 text-center">{n.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PresentationBienvenue; 