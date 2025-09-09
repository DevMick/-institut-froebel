import React, { useState, useEffect } from 'react';
import HeaderTulipe from '../components/HeaderTulipe';
import FooterTulipe from '../components/FooterTulipe';
import CyclesFroebel from './CyclesFroebel';
import { FaBookOpen } from 'react-icons/fa';
import { fetchCyclesData } from '../services/cyclesApi';

const Cycles = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les données au montage du composant
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchCyclesData();
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
  const mainTitle = data?.mainTitle || 'Nos Cycles Éducatifs';

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <HeaderTulipe />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4 bg-white rounded-full shadow-xl px-8 py-4">
            <FaBookOpen className="text-emerald-600 text-3xl md:text-4xl" />
            <span className="text-3xl md:text-5xl font-extrabold text-emerald-600">{mainTitle}</span>
          </div>
        </div>
        <CyclesFroebel data={data} />
      </main>
      <FooterTulipe />
    </div>
  );
};

export default Cycles; 