import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';

const ConditionsSection = () => {
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    loadConditions();
  }, []);

  const loadConditions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/ecoles/2/conditions-admission`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const conditionsData = Array.isArray(data) ? data : data.data || [];
        setConditions(conditionsData);
      } else {
        console.error('Erreur API conditions:', response.status, response.statusText);
        setConditions([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conditions:', error);
      setConditions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex justify-center items-center py-12">
        <FaSpinner className="animate-spin text-emerald-600 text-3xl" />
        <span className="ml-3 text-lg text-gray-600">Chargement des conditions d'admission...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {conditions.map(condition => (
          <div key={condition.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
            <h4 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-emerald-500" />
              Conditions d'admission en {condition.classeNom}
            </h4>
            <div className="text-gray-700 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>{condition.nom}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {conditions.length === 0 && (
        <div className="text-center py-12">
          <FaCheckCircle className="text-gray-400 text-4xl mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Aucune condition d'admission disponible pour le moment.</p>
        </div>
      )}
    </div>
  );
};

export default ConditionsSection; 