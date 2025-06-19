import React, { useState, useEffect } from 'react';
import { getCommissions } from '../api/commissionService';
import { getUserPermissions } from '../utils/roleUtils';

const initialState = {
  commissionId: '',
  estActive: true,
  notesSpecifiques: '',
};

const CommissionClubAssignmentForm = ({ onSubmit, initialData = {}, submitLabel = 'Affecter', onCancel }) => {
  const [form, setForm] = useState({ ...initialState, ...initialData });
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userPermissions, setUserPermissions] = useState(getUserPermissions());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const commissionsData = await getCommissions();
        setCommissions(commissionsData);
      } catch (err) {
        setError('Impossible de charger les données');
        console.error('Erreur lors du chargement des données:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation basique
    if (!form.commissionId) {
      setError('Veuillez sélectionner une commission');
      return;
    }
    
    // Ajouter l'ID du club de l'utilisateur connecté
    const formData = {
      ...form,
      clubId: userPermissions.clubId
    };
    
    onSubmit(formData);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Affecter une commission à votre club</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label htmlFor="commissionId" className="block text-sm font-medium text-gray-700 mb-1">
            Commission <span className="text-red-500">*</span>
          </label>
          <select
            id="commissionId"
            name="commissionId"
            value={form.commissionId}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Sélectionnez une commission</option>
            {commissions.map(commission => (
              <option key={commission.id} value={commission.id}>
                {commission.nom}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notesSpecifiques" className="block text-sm font-medium text-gray-700 mb-1">
            Notes spécifiques
          </label>
          <textarea
            id="notesSpecifiques"
            name="notesSpecifiques"
            placeholder="Notes ou instructions spécifiques pour cette affectation"
            value={form.notesSpecifiques}
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded-md w-full h-24 resize-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            id="estActive"
            name="estActive"
            type="checkbox"
            checked={form.estActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="estActive" className="ml-2 block text-sm text-gray-700">
            Commission active pour votre club
          </label>
        </div>
      </div>
      
      <div className="flex space-x-3 justify-end mt-6">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Annuler
          </button>
        )}
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default CommissionClubAssignmentForm; 