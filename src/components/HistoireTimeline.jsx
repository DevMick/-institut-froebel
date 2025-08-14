import React from 'react';
import { FaGraduationCap } from 'react-icons/fa';
import notreHistoireImg from '../assets/images/notre histoire.jpg';

const timeline = [
  {
    year: '1970',
    title: "Naissance de l'Institut",
    desc: "Ouverture de la première école à Treichville, marquant le début d'une aventure éducative exceptionnelle."
  },
  {
    year: '1978',
    title: 'Expansion à Yopougon',
    desc: "Extension des activités avec l'ouverture d'un nouveau site à Yopougon, répondant à la demande croissante."
  },
  {
    year: '1983',
    title: 'Implantation à Abobo',
    desc: "Création d'un troisième établissement à Abobo, consolidant la présence de l'Institut dans Abidjan."
  },
  {
    year: '1984',
    title: 'Création du Cycle Secondaire',
    desc: "Lancement du cycle secondaire, permettant un parcours complet de la maternelle au baccalauréat."
  },
  {
    year: '2010-2016',
    title: 'Modernisation & Nouveaux Sites',
    desc: "Période de modernisation avec l'implantation de nouveaux établissements à Marcory et la rénovation des sites existants."
  }
];

const HistoireTimeline = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-green-700 text-center mb-10">NOTRE HISTOIRE</h2>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Bloc vision */}
          <div className="md:w-1/2 bg-white rounded-xl shadow p-6 border-t-4 border-green-400">
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-green-100 p-4 rounded-full text-green-600 text-3xl shadow"><FaGraduationCap /></span>
              <span className="text-lg font-bold text-green-700">Une Vision Pédagogique Révolutionnaire</span>
            </div>

            {/* Image illustrative de notre histoire */}
            <div className="mb-6">
              <img
                src={notreHistoireImg}
                alt="Notre Histoire - Institut Froebel"
                className="w-full h-48 object-cover rounded-xl shadow-md"
              />
            </div>

            <p className="text-gray-700 mb-4">
              L'Institut Froebel est né de la passion de <span className="font-semibold">Madame Marguerite Messou épouse Kadio</span>, éducatrice visionnaire formée à l'école Froebélienne de Bruxelles. Inspirée par Friedrich Froebel, pionnier de la pédagogie préscolaire, elle a voulu transposer en Côte d'Ivoire une éducation centrée sur l'enfant, la bienveillance et le développement global.
            </p>
            <p className="text-gray-700 mb-4">
              Depuis l'ouverture de la première école à Treichville en 1970, l'Institut n'a cessé de croître, portant toujours cette vision d'excellence éducative et d'épanouissement personnel.
            </p>
            <blockquote className="bg-green-50 border-l-4 border-yellow-400 p-4 italic text-green-800 mb-2">
              En hommage à notre fondatrice : <span className="font-semibold">Une pionnière qui a révolutionné l'éducation en Côte d'Ivoire avec sa conviction que chaque enfant mérite une éducation de qualité, bienveillante et adaptée à son développement.</span>
            </blockquote>
          </div>
          {/* Timeline verticale */}
          <div className="md:w-1/2 relative mt-8 md:mt-0">
            <div className="absolute left-6 top-0 h-full w-1 bg-green-200 rounded"></div>
            <ul className="space-y-12">
              {timeline.map((item, idx) => (
                <li key={item.year} className="relative flex items-start">
                  <span className="z-10 flex items-center justify-center w-12 h-12 rounded-full bg-white border-4 border-green-400 shadow absolute -left-6 top-0">
                    <span className="bg-green-500 text-white font-bold rounded-full px-3 py-1 text-sm shadow">{item.year}</span>
                  </span>
                  <div className={`ml-12 bg-white rounded-lg shadow p-6 w-full ${idx % 2 === 0 ? 'mt-0' : 'md:mt-12'}`}>
                    <h4 className="text-green-700 font-bold mb-2">{item.title}</h4>
                    <p className="text-gray-700 text-sm">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HistoireTimeline; 