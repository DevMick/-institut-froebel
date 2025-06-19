import React, { useState, useEffect } from 'react';
import { FaBuilding, FaCheck, FaInfoCircle } from 'react-icons/fa';
import { getCommissions } from '../api/commissionService';

const CommissionClubForm = ({ onSubmit, initialData = null, submitLabel = 'Affecter', onCancel }) => {
  const [formData, setFormData] = useState({
    commissionId: '',
    estActive: true,
    notesSpecifiques: ''
  });
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const data = await getCommissions();
        setCommissions(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des commissions:', error);
        setError('Erreur lors de la récupération des commissions');
      } finally {
        setLoading(false);
      }
    };

    fetchCommissions();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        commissionId: initialData.commissionId || '',
        estActive: initialData.estActive ?? true,
        notesSpecifiques: initialData.notesSpecifiques || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow max-w-xl mx-auto">
      <h3 className="text-xl font-bold text-blue-800 mb-4 border-b pb-2">Affecter une commission au club</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Commission</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaBuilding className="text-gray-400" />
            </div>
            <select
              name="commissionId"
              value={formData.commissionId}
              onChange={handleChange}
              className="pl-10 p-2.5 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Sélectionner une commission</option>
              {commissions.map(commission => (
                <option key={commission.id} value={commission.id}>
                  {commission.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes spécifiques</label>
          <div className="relative">
            <div className="absolute top-3 left-3 flex items-start pointer-events-none">
              <FaInfoCircle className="text-gray-400" />
            </div>
            <textarea
              name="notesSpecifiques"
              placeholder="Notes spécifiques pour cette commission dans le club..."
              value={formData.notesSpecifiques}
              onChange={handleChange}
              className="pl-10 p-2.5 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              maxLength={500}
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="estActive"
            name="estActive"
            checked={formData.estActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="estActive" className="ml-2 block text-sm text-gray-700">
            Commission active
          </label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
        >
          <FaCheck className="mr-2" />
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default CommissionClubForm; 