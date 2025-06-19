import React, { useState, useEffect } from 'react';
import { getFonctions, deleteFonction } from '../api/fonctionService';
import { getUserPermissions } from '../utils/roleUtils';
import { useNavigate } from 'react-router-dom';

const FonctionManager = () => {
  const [fonctions, setFonctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userPermissions, setUserPermissions] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const permissions = getUserPermissions();
    setUserPermissions(permissions);
    fetchFonctions();
  }, []);

  const fetchFonctions = async () => {
    try {
      setLoading(true);
      const data = await getFonctions();
      setFonctions(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des fonctions');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette fonction ?')) {
      try {
        await deleteFonction(id);
        setSuccess('Fonction supprimée avec succès');
        fetchFonctions();
      } catch (err) {
        setError('Erreur lors de la suppression de la fonction');
        console.error('Erreur:', err);
      }
    }
  };

  const handleUpdate = (fonction) => {
    navigate(`/fonctions/${fonction.id}/edit`, { state: { fonction } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-600">{success}</p>
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              Nom de la fonction
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {fonctions.map((fonction) => (
            <tr key={fonction.id} className="hover:bg-gray-50">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                {fonction.nomFonction}
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                {userPermissions?.isAdmin && (
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleUpdate(fonction)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(fonction.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FonctionManager; 