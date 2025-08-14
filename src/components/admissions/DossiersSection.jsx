import React, { useState, useEffect } from 'react';
import { FaFolderOpen, FaSpinner, FaFileAlt } from 'react-icons/fa';

const DossiersSection = () => {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    loadDossiers();
  }, []);

  const loadDossiers = async () => {
    try {
      const response = await fetch(`/api/ecoles/2/dossier-a-fournir`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const dossiersData = Array.isArray(data) ? data : data.data || [];
        setDossiers(dossiersData);
      } else {
        console.error('Erreur API dossiers:', response.status, response.statusText);
        setDossiers([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des dossiers:', error);
      setDossiers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center items-center py-12">
        <FaSpinner className="animate-spin text-emerald-600 text-3xl" />
        <span className="ml-3 text-lg text-gray-600">Chargement des dossiers à fournir...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {dossiers.map(dossier => (
          <div key={dossier.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
            <h4 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
              <FaFolderOpen className="text-emerald-500" />
              Dossier à fournir en {dossier.classeNom}
            </h4>
            <div className="text-gray-700 space-y-3">
              <div className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                <FaFileAlt className="text-emerald-500 mt-1 flex-shrink-0" />
                <span>{dossier.nom}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {dossiers.length === 0 && (
        <div className="text-center py-12">
          <FaFolderOpen className="text-gray-400 text-4xl mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Aucun dossier à fournir disponible pour le moment.</p>
        </div>
      )}
    </div>
  );
};

export default DossiersSection; 