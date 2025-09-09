import React, { useState, useEffect } from 'react';
import HeaderTulipe from '../components/HeaderTulipe';
import FooterTulipe from '../components/FooterTulipe';
import { FaSchool, FaUserShield, FaUtensils, FaFutbol, FaUsers, FaBook, FaStar, FaHeart, FaShieldAlt, FaAppleAlt, FaGamepad, FaTrophy, FaBookReader } from 'react-icons/fa';
import VieScolaireHero from '../components/VieScolaireHero';
import { fetchVieScolaireData } from '../services/vieScolaireApi';

// Configuration des icônes et couleurs pour chaque section
const sectionConfig = {
  'encadrement': {
    icon: <FaUsers className="text-purple-500 text-4xl" />,
    color: 'from-purple-50 to-indigo-100',
    border: 'border-purple-200',
    accentIcon: <FaHeart className="text-purple-400" />,
  },
  'cadre-securise': {
    icon: <FaUserShield className="text-emerald-500 text-4xl" />,
    color: 'from-emerald-50 to-teal-100',
    border: 'border-emerald-200',
    accentIcon: <FaShieldAlt className="text-emerald-400" />,
  },
  'cantine': {
    icon: <FaUtensils className="text-orange-500 text-4xl" />,
    color: 'from-orange-50 to-red-100',
    border: 'border-orange-200',
    accentIcon: <FaAppleAlt className="text-orange-400" />,
  },
  'culture-art-sport': {
    icon: <FaFutbol className="text-blue-500 text-4xl" />,
    color: 'from-blue-50 to-cyan-100',
    border: 'border-blue-200',
    accentIcon: <FaGamepad className="text-blue-400" />,
  },
  'evenements': {
    icon: <FaStar className="text-pink-500 text-4xl" />,
    color: 'from-pink-50 to-rose-100',
    border: 'border-pink-200',
    accentIcon: <FaTrophy className="text-pink-400" />,
  },
  'salle-polyvalente': {
    icon: <FaBook className="text-amber-500 text-4xl" />,
    color: 'from-amber-50 to-yellow-100',
    border: 'border-amber-200',
    accentIcon: <FaBookReader className="text-amber-400" />,
  },
};

const VieScolaire = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchVieScolaireData();
        if (result.success) {
          setData(result.data);
        } else {
          console.error('Erreur lors du chargement des données:', result.error);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Affichage de chargement
  if (loading) {
    return (
      <div className="flex flex-col bg-gray-50 min-h-screen">
        <HeaderTulipe />
        <VieScolaireHero />
        <main className="flex-1 max-w-6xl mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement...</p>
            </div>
          </div>
        </main>
        <FooterTulipe />
      </div>
    );
  }

  // Si pas de données, utiliser un titre par défaut
  const mainTitle = data?.mainTitle || 'Vie Scolaire';
  const sections = data?.sections || [];

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <HeaderTulipe />
      <VieScolaireHero />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12">
        {/* Header stylé comme Nos Cycles */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4 bg-white rounded-full shadow-xl px-8 py-4">
            <FaSchool className="text-emerald-600 text-3xl md:text-4xl" />
            <span className="text-3xl md:text-5xl font-extrabold text-emerald-600">{mainTitle}</span>
          </div>
        </div>
        {/* Sections */}
        <div className="space-y-12">
          {sections.map((section, idx) => {
            const config = sectionConfig[section.id] || sectionConfig['encadrement']; // Fallback
            return (
              <section key={section.id} className={`rounded-3xl bg-gradient-to-br ${config.color} ${config.border} border shadow-lg p-8 md:p-12`}>
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="flex-shrink-0">
                    <div className="p-6 rounded-2xl bg-white shadow-md flex items-center justify-center mb-4 md:mb-0">
                      {config.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {config.accentIcon}
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
            );
          })}
        </div>
      </main>
      <FooterTulipe />
    </div>
  );
};

export default VieScolaire; 