import React from 'react';
import vacance from '../assets/images/Vacance.jpg';
import atelier from '../assets/images/Atelier.jpg';
import inscription from '../assets/images/inscription.jpg';
import evenement from '../assets/images/Evenement.jpg';
import v1 from '../assets/images/V1.jpg';
import v2 from '../assets/images/V2.jpg';
import v3 from '../assets/images/V3.jpg';
import b1 from '../assets/images/B1.jpg';
import b2 from '../assets/images/B2.jpg';
import b3 from '../assets/images/B3.jpg';
import o1 from '../assets/images/O1.jpg';
import o2 from '../assets/images/O2.jpg';
import o3 from '../assets/images/O3.jpg';
import j1 from '../assets/images/J1.jpg';
import j2 from '../assets/images/J2.jpg';
import j3 from '../assets/images/J3.jpg';
import j4 from '../assets/images/J4.jpg';
import f1 from '../assets/images/F1.jpg';
import f2 from '../assets/images/F2.jpg';
import f3 from '../assets/images/F3.jpg';
import f4 from '../assets/images/F4.jpg';
import g1 from '../assets/images/G1.jpg';
import g2 from '../assets/images/G2.jpg';
import g3 from '../assets/images/G3.jpg';
import g4 from '../assets/images/G4.jpg';

const activites = [
  {
    image: vacance,
    lien: 'https://soe-ci.org/article.716.la-institut-froebel-un-soutien-remarquable-pour-la-ong-soe.html',
  },
  {
    image: atelier,
    lien: 'https://www.christina-goh.com/post/institut-froebel-abidjan-les-40-ans',
  },
  {
    image: inscription,
    lien: 'http://institutfroebel.sch-ci.org/',
  },
  {
    image: evenement,
    lien: 'https://soe-ci.org/article.1116.les-toiles-soe-de-la-humanitaire-la-institut-froebel-entreprise-partenaire-de-la-ong-soe.html',
  },
];

const activitesSILA = [
  {
    image: v1,
    titre: 'Visite au SILA - Photo 1',
  },
  {
    image: v2,
    titre: 'Visite au SILA - Photo 2',
  },
  {
    image: v3,
    titre: 'Visite au SILA - Photo 3',
  },
];

// URL Cloudinary pour la vidéo de la visite au Banco
const visiteBancoVideo = 'https://res.cloudinary.com/dntyghmap/video/upload/v1757153869/Visite_au_Banco_pg6681.mp4';

// URL Cloudinary pour la vidéo de la célébration de la solidarité
const celebrationSolidariteVideo = 'https://res.cloudinary.com/dntyghmap/video/upload/v1757154294/C%C3%A9l%C3%A9bration_de_la_solidarit%C3%A9_des_%C3%A9l%C3%A8ves_zsrxbh.mp4';

const activitesBanco = [
  {
    image: b1,
    titre: 'Visite de la forêt du Banco - Photo 1',
    type: 'image'
  },
  {
    image: b2,
    titre: 'Visite de la forêt du Banco - Photo 2',
    type: 'image'
  },
  {
    image: b3,
    titre: 'Visite de la forêt du Banco - Photo 3',
    type: 'image'
  },
  {
    image: visiteBancoVideo,
    titre: 'Visite de la forêt du Banco - Vidéo',
    type: 'video'
  },
];

const activitesSolidarite = [
  {
    image: o1,
    titre: 'Célébration de la solidarité - Photo 1',
    type: 'image'
  },
  {
    image: o2,
    titre: 'Célébration de la solidarité - Photo 2',
    type: 'image'
  },
  {
    image: o3,
    titre: 'Célébration de la solidarité - Photo 3',
    type: 'image'
  },
  {
    image: celebrationSolidariteVideo,
    titre: 'Célébration de la solidarité - Vidéo',
    type: 'video'
  },
];

const activitesJourneeMerite = [
  {
    image: j1,
    titre: 'Journée du Mérite - Photo 1',
    type: 'image'
  },
  {
    image: j2,
    titre: 'Journée du Mérite - Photo 2',
    type: 'image'
  },
  {
    image: j3,
    titre: 'Journée du Mérite - Photo 3',
    type: 'image'
  },
  {
    image: j4,
    titre: 'Journée du Mérite - Photo 4',
    type: 'image'
  },
];

const activitesFinalesSportives = [
  {
    image: f1,
    titre: 'Finales des activités sportives - Photo 1',
    type: 'image'
  },
  {
    image: f2,
    titre: 'Finales des activités sportives - Photo 2',
    type: 'image'
  },
  {
    image: f3,
    titre: 'Finales des activités sportives - Photo 3',
    type: 'image'
  },
  {
    image: f4,
    titre: 'Finales des activités sportives - Photo 4',
    type: 'image'
  },
];

const activitesMardiGras = [
  {
    image: g1,
    titre: 'Célébration du Mardi Gras - Photo 1',
    type: 'image'
  },
  {
    image: g2,
    titre: 'Célébration du Mardi Gras - Photo 2',
    type: 'image'
  },
  {
    image: g3,
    titre: 'Célébration du Mardi Gras - Photo 3',
    type: 'image'
  },
  {
    image: g4,
    titre: 'Célébration du Mardi Gras - Photo 4',
    type: 'image'
  },
];

const ActivitesRecentes = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-froebel-blue text-center mb-8">NOS RÉCENTES ACTIVITÉS</h2>

        {/* Section Visite au SILA */}
        <div className="mb-12">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-6">Visite au SILA(Salon international du livre d'Abidjan)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activitesSILA.map((act, idx) => (
              <div
                key={idx}
                className="block"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition hover:scale-105">
                  <img src={act.image} alt={act.titre} className="w-full h-48 object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Visite de la forêt du Banco */}
        <div className="mb-12">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-6">Visite de la forêt du Banco</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activitesBanco.map((act, idx) => (
              <div
                key={idx}
                className="block"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition hover:scale-105">
                  {act.type === 'video' ? (
                    <video
                      className="w-full h-48 object-cover"
                      controls
                      muted
                      playsInline
                    >
                      <source src={act.image} type="video/mp4" />
                      Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
                  ) : (
                    <img src={act.image} alt={act.titre} className="w-full h-48 object-cover" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Célébration de la solidarité */}
        <div className="mb-12">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-6">Célébration de la solidarité des élèves à travers des dons à un orphelinat</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activitesSolidarite.map((act, idx) => (
              <div
                key={idx}
                className="block"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition hover:scale-105">
                  {act.type === 'video' ? (
                    <video
                      className="w-full h-48 object-cover"
                      controls
                      muted
                      playsInline
                    >
                      <source src={act.image} type="video/mp4" />
                      Votre navigateur ne supporte pas la lecture de vidéos.
                    </video>
                  ) : (
                    <img src={act.image} alt={act.titre} className="w-full h-48 object-cover" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Journée du Mérite */}
        <div className="mb-12">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-6">Cérémonie d'Excellence - Journée du Mérite</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activitesJourneeMerite.map((act, idx) => (
              <div
                key={idx}
                className="block"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition hover:scale-105">
                  <img src={act.image} alt={act.titre} className="w-full h-48 object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Finales des activités sportives */}
        <div className="mb-12">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-6">Finales des activités sportives</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activitesFinalesSportives.map((act, idx) => (
              <div
                key={idx}
                className="block"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition hover:scale-105">
                  <img src={act.image} alt={act.titre} className="w-full h-48 object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Célébration du Mardi Gras */}
        <div className="mb-12">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-6">Célébration du Mardi Gras - Fête des couleurs et de la joie</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activitesMardiGras.map((act, idx) => (
              <div
                key={idx}
                className="block"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition hover:scale-105">
                  <img src={act.image} alt={act.titre} className="w-full h-48 object-cover" />
                </div>
              </div>
            ))}
          </div>
        </div>


      </div>
    </section>
  );
};

export default ActivitesRecentes; 