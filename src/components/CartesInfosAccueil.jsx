import React from 'react';
import { Link } from 'react-router-dom';
import image2 from '../assets/images/image2.jpg';
import nosEcolesImg from '../assets/images/_DSC0253.jpg';
import inscriptionImg from '../assets/images/inscription.jpg';

const cartes = [
  {
    titre: 'QUI SOMMES-NOUS',
    sousTitre: 'Découvrez notre histoire et nos valeurs',
    image: image2,
    lien: '/presentation',
  },
  {
    titre: 'NOS ÉCOLES',
    sousTitre: 'Explorez nos établissements',
    image: nosEcolesImg,
    lien: '#ecoles',
  },
  {
    titre: 'NOTRE PROGRAMME',
    sousTitre: 'Découvrez notre pédagogie',
    image: inscriptionImg,
    lien: '#programme',
  },
];

const CartesInfosAccueil = () => {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cartes.map((carte, idx) => {
            const CardContent = () => (
              <div
                className="relative rounded-2xl overflow-hidden shadow-lg group hover:shadow-2xl transition"
                style={{ minHeight: 270 }}
              >
                <img
                  src={carte.image}
                  alt={carte.titre}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="relative z-10 flex flex-col justify-end h-full p-6">
                  <h3 className="text-2xl font-extrabold text-white mb-2 drop-shadow-lg">{carte.titre}</h3>
                  <p className="text-white text-base mb-6 drop-shadow">{carte.sousTitre}</p>
                  <a
                    href={carte.lien}
                    className="inline-block bg-white text-green-600 font-semibold px-6 py-2 rounded-full border-2 border-green-500 hover:bg-green-50 transition shadow text-sm group"
                  >
                    En savoir plus <span aria-hidden>→</span>
                  </a>
                </div>
              </div>
            );

            // Si c'est QUI SOMMES-NOUS, utiliser Link pour la navigation React Router
            if (carte.titre === 'QUI SOMMES-NOUS') {
              return (
                <Link key={carte.titre} to={carte.lien} className="block hover:scale-105 transition-transform">
                  <CardContent />
                </Link>
              );
            }

            // Sinon, afficher la carte normale avec le lien href
            return (
              <div key={carte.titre}>
                <CardContent />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CartesInfosAccueil; 