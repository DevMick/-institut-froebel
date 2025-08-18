import React from 'react';
import HeaderTulipe from '../components/HeaderTulipe';
import FooterTulipe from '../components/FooterTulipe';
import { FaSchool, FaUserShield, FaUtensils, FaFutbol, FaUsers, FaBook, FaStar, FaHeart, FaShieldAlt, FaAppleAlt, FaGamepad, FaTrophy, FaBookReader } from 'react-icons/fa';
import VieScolaireHero from '../components/VieScolaireHero';

const sections = [
  {
    icon: <FaUsers className="text-purple-500 text-4xl" />,
    title: 'Encadrement & Bienveillance',
    description: 'Nos équipes pédagogiques et éducatives assurent une présence constante, attentive et respectueuse. Chaque enfant est connu, reconnu et accompagné dans son individualité.',
    features: ['Équipe qualifiée', 'Suivi personnalisé', 'Relation de confiance', 'Écoute active'],
    color: 'from-purple-50 to-indigo-100',
    border: 'border-purple-200',
    accentIcon: <FaHeart className="text-purple-400" />,
  },
  {
    icon: <FaUserShield className="text-emerald-500 text-4xl" />,
    title: 'Cadre sécurisé',
    description: 'Nos établissements sont situés dans des quartiers accessibles, avec des dispositifs de sécurité (agents, portails surveillés, environnement fermé) garantissant la tranquillité des parents.',
    features: ['Culture', 'Art', 'Sport'],
    color: 'from-emerald-50 to-teal-100',
    border: 'border-emerald-200',
    accentIcon: <FaShieldAlt className="text-emerald-400" />,
  },
  {
    icon: <FaUtensils className="text-orange-500 text-4xl" />,
    title: 'Cantine Scolaire',
    description: 'Nos cantines proposent des repas équilibrés, cuisinés sur place, dans le respect des normes d\'hygiène. Les menus sont pensés pour s\'adapter aux besoins nutritionnels des enfants.',
    features: ['Repas équilibrés', 'Cuisine sur place', 'Normes d\'hygiène', 'Menus adaptés'],
    color: 'from-orange-50 to-red-100',
    border: 'border-orange-200',
    accentIcon: <FaAppleAlt className="text-orange-400" />,
  },
  {
    icon: <FaFutbol className="text-blue-500 text-4xl" />,
    title: 'Culture, Art et sport',
    description: 'L\'épanouissement passe aussi par le mouvement et la créativité. Nos écoles offrent un large éventail d\'activités extrascolaires',
    features: ['Danse & Théâtre', 'Musique & Cuisine', 'Football & Karaté', 'Jeux collectifs'],
    color: 'from-blue-50 to-cyan-100',
    border: 'border-blue-200',
    accentIcon: <FaGamepad className="text-blue-400" />,
  },
  {
    icon: <FaStar className="text-pink-500 text-4xl" />,
    title: 'Événements & Célébrations',
    description: 'Tout au long de l\'année, la vie scolaire est rythmée par des moments forts qui créent des souvenirs inoubliables.',
    features: ['Remises de prix', 'Journées thématiques', 'Fêtes scolaires', 'Compétitions'],
    color: 'from-pink-50 to-rose-100',
    border: 'border-pink-200',
    accentIcon: <FaTrophy className="text-pink-400" />,
  },
  {
    icon: <FaBook className="text-amber-500 text-4xl" />,
    title: 'Salle Polyvalente',
    description: 'Un espace moderne équipé de bibliothèque et ordinateurs, destiné aux recherches scolaires et à la formation continue.',
    features: ['Bibliothèque moderne', 'Ordinateurs', 'Recherches scolaires', 'Formations externes'],
    color: 'from-amber-50 to-yellow-100',
    border: 'border-amber-200',
    accentIcon: <FaBookReader className="text-amber-400" />,
  },
];

const VieScolaire = () => {
  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <HeaderTulipe />
      <VieScolaireHero />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12">
        {/* Header stylé comme Nos Cycles */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4 bg-white rounded-full shadow-xl px-8 py-4">
            <FaSchool className="text-emerald-600 text-3xl md:text-4xl" />
            <span className="text-3xl md:text-5xl font-extrabold text-emerald-600">Vie Scolaire</span>
          </div>
        </div>
        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section, idx) => (
            <section key={section.title} className={`rounded-3xl bg-gradient-to-br ${section.color} ${section.border} border shadow-lg p-8 md:p-12`}>
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex-shrink-0">
                  <div className="p-6 rounded-2xl bg-white shadow-md flex items-center justify-center mb-4 md:mb-0">
                    {section.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {section.accentIcon}
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800">{section.title}</h2>
                  </div>
                  <p className="text-gray-700 mb-4 text-lg">{section.description}</p>
                  <ul className="list-disc list-inside text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {section.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>
      <FooterTulipe />
    </div>
  );
};

export default VieScolaire; 