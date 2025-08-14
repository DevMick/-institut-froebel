import React, { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaSpinner, FaEuroSign } from 'react-icons/fa';

const TarifsSection = () => {
  const [tarifs, setTarifs] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    loadTarifs();
  }, []);

  const loadTarifs = async () => {
    try {
      const response = await fetch(`/api/ecoles/2/tarifs`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const tarifsData = Array.isArray(data) ? data : data.data || [];
        setTarifs(tarifsData);
      } else {
        console.error('Erreur API tarifs:', response.status, response.statusText);
        setTarifs([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tarifs:', error);
      setTarifs([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center items-center py-12">
        <FaSpinner className="animate-spin text-emerald-600 text-3xl" />
        <span className="ml-3 text-lg text-gray-600">Chargement des tarifs...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {tarifs.map(tarif => (
          <div key={tarif.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
            <h4 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
              <FaMoneyBillWave className="text-emerald-500" />
              Tarifs en {tarif.classeNom}
            </h4>
            <div className="text-gray-700 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border-l-4 border-emerald-500">
                <FaEuroSign className="text-emerald-600 flex-shrink-0" />
                <span className="font-medium">{tarif.tarif.toLocaleString()} FCFA</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tarifs.length === 0 && (
        <div className="text-center py-12">
          <FaMoneyBillWave className="text-gray-400 text-4xl mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Aucun tarif disponible pour le moment.</p>
        </div>
      )}
    </div>
  );
};

export default TarifsSection; 