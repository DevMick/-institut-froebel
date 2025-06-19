import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getMandats } from '../../api/mandatService';
import { getMembres } from '../../api/membreService';

const CotisationForm = ({ onSubmit, onClose, initialData = null }) => {
  const [formData, setFormData] = useState({
    montant: initialData?.montant || '480000',
    membreId: initialData?.membreId || '',
    mandatId: initialData?.mandatId || ''
  });
  const [montantError, setMontantError] = useState('');

  const [mandats, setMandats] = useState([]);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [mandatsData, membresData] = await Promise.all([
          getMandats(user.clubId),
          getMembres(user.clubId)
        ]);
        
        console.log('=== Données des mandats reçues ===');
        console.log('Mandats bruts:', mandatsData);
        if (mandatsData && mandatsData.length > 0) {
          console.log('Premier mandat:', mandatsData[0]);
          console.log('Date de début:', mandatsData[0].dateDebut);
          console.log('Date de fin:', mandatsData[0].dateFin);
        }
        
        console.log('Données des membres:', membresData);
        if (membresData && membresData.length > 0) {
          console.log('Structure du premier membre:', membresData[0]);
        }
        
        setMandats(Array.isArray(mandatsData) ? mandatsData : []);
        setMembres(Array.isArray(membresData) ? membresData : []);
        
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données');
        setMandats([]);
        setMembres([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.clubId) {
      fetchData();
    }
  }, [user?.clubId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'montant') {
      const montantValue = parseInt(value, 10);
      if (montantValue < 480000) {
        setMontantError('Le montant minimum est de 480 000 FCFA');
      } else {
        setMontantError('');
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const montantValue = parseInt(formData.montant, 10);
    
    if (montantValue < 480000) {
      setMontantError('Le montant minimum est de 480 000 FCFA');
      return;
    }
    
    // Convertir le montant en nombre
    const dataToSubmit = {
      ...formData,
      montant: montantValue
    };
    onSubmit(dataToSubmit);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Membre */}
        <div>
          <label htmlFor="membreId" className="block text-sm font-medium text-gray-700">
            Membre
          </label>
          <select
            id="membreId"
            name="membreId"
            value={formData.membreId}
            onChange={handleChange}
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Sélectionner un membre</option>
            {membres && membres.length > 0 ? (
              membres.map(membre => (
                <option key={membre.id} value={membre.id}>
                  {membre.name || `${membre.firstName} ${membre.lastName}`}
                </option>
              ))
            ) : (
              <option value="" disabled>Aucun membre disponible</option>
            )}
          </select>
        </div>

        {/* Mandat */}
        <div>
          <label htmlFor="mandatId" className="block text-sm font-medium text-gray-700">
            Mandat
          </label>
          <select
            id="mandatId"
            name="mandatId"
            value={formData.mandatId}
            onChange={handleChange}
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Sélectionner un mandat</option>
            {mandats && mandats.length > 0 ? (
              mandats.map(mandat => {
                console.log('=== Affichage du mandat ===');
                console.log('Mandat:', mandat);
                console.log('Date de début:', mandat.dateDebut);
                console.log('Date de fin:', mandat.dateFin);
                return (
                  <option key={mandat.id} value={mandat.id}>
                    {mandat.annee} (du {mandat.dateDebut ? new Date(mandat.dateDebut).toLocaleDateString() : 'N/A'} au {mandat.dateFin ? new Date(mandat.dateFin).toLocaleDateString() : 'N/A'})
                  </option>
                );
              })
            ) : (
              <option value="" disabled>Aucun mandat disponible</option>
            )}
          </select>
        </div>

        {/* Montant */}
        <div>
          <label htmlFor="montant" className="block text-sm font-medium text-gray-700">
            Montant (FCFA)
          </label>
          <input
            type="number"
            id="montant"
            name="montant"
            value={formData.montant}
            onChange={handleChange}
            required
            min="480000"
            step="1000"
            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              montantError ? 'border-red-500 bg-red-50' : ''
            }`}
          />
          <p className="mt-1 text-sm text-gray-500">Montant minimum: 480 000 FCFA</p>
          {montantError && (
            <p className="mt-1 text-sm text-red-600">
              ⚠️ {montantError}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {initialData ? 'Modifier' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default CotisationForm; 