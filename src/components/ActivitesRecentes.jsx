import React from 'react';
import vacance from '../assets/images/Vacance.jpg';
import atelier from '../assets/images/Atelier.jpg';
import inscription from '../assets/images/inscription.jpg';
import evenement from '../assets/images/Evenement.jpg';

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

const ActivitesRecentes = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-green-700 text-center mb-8">NOS RÉCENTES ACTIVITÉS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {activites.map((act, idx) => (
            <a
              key={idx}
              href={act.lien}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition hover:scale-105">
                <img src={act.image} alt="Activité" className="w-full h-40 object-cover" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActivitesRecentes; 