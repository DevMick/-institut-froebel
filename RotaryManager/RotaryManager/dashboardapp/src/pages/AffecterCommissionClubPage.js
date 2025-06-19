import React, { useState, useEffect } from 'react';
import { FaUsers, FaEdit } from 'react-icons/fa';
import { getCommissions, getCommissionsByClub, assignCommissionToClub, updateClubCommission } from '../api/commissionService';

const AffecterCommissionClubPage = () => {
  const [commissions, setCommissions] = useState([]);
  const [clubCommissions, setClubCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingCommission, setEditingCommission] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const userInfoStr = localStorage.getItem('userInfo');
    if (userInfoStr) {
      setUserInfo(JSON.parse(userInfoStr));
    }
  }, []);

  useEffect(() => {
    if (userInfo?.clubId) {
      fetchCommissions();
      fetchClubCommissions();
    }
  }, [userInfo]);

  const fetchCommissions = async () => {
    try {
      const data = await getCommissions();
      console.log('Commissions disponibles:', data);
      setCommissions(data);
    } catch (error) {
      console.error('Erreur lors du chargement des commissions:', error);
      setError('Erreur lors du chargement des commissions');
    }
  };

  const fetchClubCommissions = async () => {
    try {
      const data = await getCommissionsByClub(userInfo.clubId);
      console.log('Commissions du club:', data);
      setClubCommissions(data);
    } catch (error) {
      console.error('Erreur lors du chargement des commissions du club:', error);
      setError('Erreur lors du chargement des commissions du club');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCommission = async (commissionId) => {
    try {
      const result = await assignCommissionToClub({
        clubId: userInfo.clubId,
        commissionId: commissionId,
        estActive: true
      });

      if (result.success) {
        setSuccess('Commission affectée avec succès');
        fetchClubCommissions();
      } else {
        setError(result.error?.message || 'Erreur lors de l\'affectation de la commission');
      }
    } catch (error) {
      console.error('Erreur lors de l\'affectation:', error);
      setError('Erreur lors de l\'affectation de la commission');
    }
  };

  const handleEditCommission = async (commissionClubId, formData) => {
    try {
      const result = await updateClubCommission(userInfo.clubId, commissionClubId, {
        estActive: formData.estActive,
        notesSpecifiques: formData.notesSpecifiques
      });

      if (result.success) {
        setSuccess('Commission modifiée avec succès');
        setEditingCommission(null);
        fetchClubCommissions();
      } else {
        setError(result.error?.message || 'Erreur lors de la modification de la commission');
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      setError('Erreur lors de la modification de la commission');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Affecter des commissions au club</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Liste des commissions disponibles */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Commissions disponibles</h2>
          <div className="space-y-4">
            {commissions.length === 0 ? (
              <p className="text-gray-500">Aucune commission disponible</p>
            ) : (
              commissions.map(commission => (
                <div key={commission.id} className="border rounded p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{commission.nom}</h3>
                    <p className="text-sm text-gray-600">{commission.description}</p>
                  </div>
                  <button
                    onClick={() => handleAssignCommission(commission.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Affecter
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Liste des commissions affectées */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Commissions affectées</h2>
          <div className="space-y-4">
            {clubCommissions.length === 0 ? (
              <p className="text-gray-500">Aucune commission affectée</p>
            ) : (
              clubCommissions.map(commission => (
                <div key={commission.id} className="border rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{commission.nom}</h3>
                      <p className="text-sm text-gray-600">{commission.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingCommission(commission)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                      >
                        <FaEdit className="inline mr-1" /> Modifier
                      </button>
                    </div>
                  </div>
                  {editingCommission?.id === commission.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded">
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.target);
                        handleEditCommission(commission.id, {
                          estActive: formData.get('estActive') === 'true',
                          notesSpecifiques: formData.get('notesSpecifiques')
                        });
                      }}>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Statut
                          </label>
                          <select
                            name="estActive"
                            className="w-full p-2 border rounded"
                            defaultValue={commission.estActive}
                          >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                          </select>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes spécifiques
                          </label>
                          <textarea
                            name="notesSpecifiques"
                            className="w-full p-2 border rounded"
                            rows="3"
                            defaultValue={commission.notesSpecifiques}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => setEditingCommission(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Enregistrer
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffecterCommissionClubPage; 