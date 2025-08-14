import React from 'react';
import { FaSchool, FaChalkboardTeacher, FaLaptop, FaBook, FaRunning, FaShieldAlt, FaPalette, FaMusic, FaFlask, FaUsers, FaComments } from 'react-icons/fa';
import ecoleImage from '../assets/images/primaire.jpg';

const chiffres = [
  { valeur: '45+', label: "Années d'expérience" },
  { valeur: '30+', label: 'Salles de classe' },
  { valeur: '100%', label: 'Sécurité' },
  { valeur: 'CP à CM2', label: 'Tous niveaux' },
];

const infrastructures = [
  {
    icon: <FaChalkboardTeacher className="text-green-600 text-3xl mb-2" />,
    titre: 'Salles de Classe Équipées',
    desc: "Salles de classe spacieuses et lumineuses, adaptées aux enfants du primaire. Chaque classe est équipée de matériel pédagogique moderne pour favoriser un apprentissage interactif et engageant.",
  },
  {
    icon: <FaLaptop className="text-green-600 text-3xl mb-2" />,
    titre: 'Salles Informatiques',
    desc: "Espaces informatiques dédiés aux enfants avec ordinateurs adaptés et logiciels éducatifs. Nos élèves développent leurs compétences numériques dès le plus jeune âge dans un environnement sécurisé.",
  },
  {
    icon: <FaBook className="text-green-600 text-3xl mb-2" />,
    titre: 'Bibliothèques',
    desc: "Bibliothèques riches et variées avec des livres adaptés à chaque niveau du primaire. Un espace calme et inspirant pour développer le goût de la lecture et de la recherche chez nos élèves.",
  },
  {
    icon: <FaRunning className="text-green-600 text-3xl mb-2" />,
    titre: 'Espaces Récréatifs',
    desc: "Cours de récréation sécurisées et aire de jeux adaptées aux enfants. Des espaces verts et des zones de détente pour que nos élèves puissent se divertir et socialiser en toute sécurité.",
  },
  {
    icon: <FaShieldAlt className="text-green-600 text-3xl mb-2" />,
    titre: 'Environnement Sécurisé',
    desc: "Sécurité renforcée avec surveillance continue et accès contrôlé. La sécurité et le bien-être de nos élèves sont notre priorité absolue dans un environnement protégé et bienveillant.",
  },
];

const activites = [
  { icon: <FaRunning className="text-green-600 text-2xl" />, titre: 'Éducation Physique' },
  { icon: <FaPalette className="text-green-600 text-2xl" />, titre: 'Arts Plastiques' },
  { icon: <FaMusic className="text-green-600 text-2xl" />, titre: 'Éveil Musical' },
  { icon: <FaFlask className="text-green-600 text-2xl" />, titre: 'Éveil Scientifique' },
  { icon: <FaComments className="text-green-600 text-2xl" />, titre: 'Expression Orale' },
  { icon: <FaUsers className="text-green-600 text-2xl" />, titre: 'Vie de Groupe' },
];

const equipeBadges = [
  'Spécialistes Primaire',
  'Pédagogie Adaptée',
  'Suivi Personnalisé',
  'Bienveillance',
];

const InstallationsVieScolaire = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-green-600 text-center mb-2">NOS INSTALLATIONS & VIE SCOLAIRE</h2>
        <div className="flex items-center justify-center gap-2 mb-8">
          <FaSchool className="text-green-600 text-xl" />
          <span className="text-green-700 font-medium">Des écoles primaires modernes et accueillantes</span>
        </div>
        {/* Bloc principal */}
        <div className="bg-green-50 rounded-2xl shadow p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center mb-12">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Écoles Primaires Modernes</h3>
            <p className="text-gray-600 mb-6">Nos écoles primaires offrent un environnement d'apprentissage exceptionnel avec des infrastructures adaptées aux enfants, conçues pour favoriser leur épanouissement et leur réussite scolaire dans un cadre sécurisé et stimulant.</p>
            <div className="grid grid-cols-2 gap-4">
              {chiffres.map((c, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow p-4 flex flex-col items-center">
                  <div className="text-green-600 text-2xl font-extrabold mb-1">{c.valeur}</div>
                  <div className="text-gray-600 text-xs md:text-sm text-center">{c.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative w-full max-w-md">
            <img src={ecoleImage} alt="École primaire moderne" className="rounded-xl shadow-lg w-full object-cover" />
            <span className="absolute top-4 left-4 bg-green-600 text-white text-xs font-semibold px-4 py-1 rounded-full shadow">Excellence Primaire<br /><span className='font-normal'>Des écoles pensées pour les enfants</span></span>
          </div>
        </div>
        {/* Infrastructures */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {infrastructures.slice(0,3).map((infra, idx) => (
            <div key={infra.titre} className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center border border-green-100">
              {infra.icon}
              <h4 className="text-lg font-bold text-gray-800 mb-2">{infra.titre}</h4>
              <p className="text-gray-600 text-sm">{infra.desc}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {infrastructures.slice(3).map((infra, idx) => (
            <div key={infra.titre} className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center border border-green-100">
              {infra.icon}
              <h4 className="text-lg font-bold text-gray-800 mb-2">{infra.titre}</h4>
              <p className="text-gray-600 text-sm">{infra.desc}</p>
            </div>
          ))}
        </div>
        {/* Activités enrichissantes */}
        <div className="bg-green-50 rounded-2xl p-8 flex flex-col items-center mb-12">
          <h3 className="text-xl md:text-2xl font-extrabold text-green-600 mb-6">Activités Enrichissantes</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-3xl">
            {activites.map((a, idx) => (
              <div key={a.titre} className="bg-white rounded-xl shadow flex flex-col items-center p-4">
                <span className="mb-2">{a.icon}</span>
                <span className="font-semibold text-gray-700 text-sm md:text-base text-center">{a.titre}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Équipe pédagogique */}
        <div className="bg-green-50 rounded-2xl p-8 flex flex-col items-center">
          <h3 className="text-xl md:text-2xl font-extrabold text-green-600 mb-4">Équipe Pédagogique Spécialisée</h3>
          <p className="text-gray-600 text-center mb-6 max-w-2xl">Notre équipe d'instituteurs et institutrices est spécialement formée pour l'enseignement primaire. Passionnés et dévoués, ils accompagnent chaque enfant dans son développement académique et personnel avec bienveillance et professionnalisme.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            {equipeBadges.map((badge, idx) => (
              <span key={badge} className="bg-green-600 text-white font-semibold px-5 py-2 rounded-full shadow text-sm">{badge}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstallationsVieScolaire; 