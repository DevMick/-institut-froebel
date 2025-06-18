// src/components/ClubManager.js
import React, { useEffect, useState } from 'react';
import { getClubs, createClub, updateClub, checkClubCodeUnique, deleteClub } from '../api/clubService';
import { getUserPermissions, canEditClub, canCreateClub, getRolePermissions } from '../utils/roleUtils';
import ClubForm from './ClubForm';

const mapToUpdateClubInfoRequest = (form, originalClub) => {
  // Si on est en mode édition et que le code n'a pas été modifié, utiliser le code original
  const code = form.code || (originalClub ? originalClub.code : '');
  
  return {
    name: form.name || '',
    code: code,
    description: form.description || '',
    address: form.address || '',
    city: form.city || '',
    country: form.country || '',
    phoneNumber: form.phoneNumber || '',
    email: form.email || '',
    website: form.website || '',
    logoUrl: form.logoUrl || '',
  foundedDate: form.foundedDate && form.foundedDate.trim() !== '' 
    ? new Date(form.foundedDate).toISOString() 
    : null,
    isActive: form.isActive !== undefined ? form.isActive : true,
  };
};

const ClubManager = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editClubData, setEditClubData] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userPermissions, setUserPermissions] = useState(getUserPermissions());

  const fetchClubs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClubs();
      setClubs(data);
    } catch (e) {
      console.error('Erreur lors du chargement des clubs:', e);
      if (e.message && e.message.includes('Session expirée')) {
        setError('Votre session a expiré. Veuillez vous reconnecter.');
      } else {
        setError('Erreur lors du chargement des clubs.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  const handleAdd = () => {
    if (!canCreateClub(userPermissions)) {
      setError("Vous n'avez pas les droits nécessaires pour créer un club. Seuls les administrateurs peuvent créer de nouveaux clubs.");
      return;
    }
    setEditClubData(null);
    setShowForm(true);
    setSuccess(null);
    setError(null);
  };

  const handleEdit = (club) => {
    if (!canEditClub(club, userPermissions)) {
      setError("Vous n'avez pas les droits nécessaires pour modifier ce club. Seuls les administrateurs et les présidents du club peuvent modifier les informations.");
      return;
    }
    setEditClubData({
      id: club.id,
      name: club.name || '',
      code: club.code || '',
      logoUrl: club.logoUrl || '',
      description: club.description || '',
      address: club.address || '',
      city: club.city || '',
      country: club.country || '',
      phoneNumber: club.phoneNumber || '',
      email: club.email || '',
      website: club.website || '',
      foundedDate: club.foundedDate || '',
      isActive: club.isActive !== undefined ? club.isActive : true,
    });
    setShowForm(true);
    setSuccess(null);
    setError(null);
  };

  const handleFormSubmit = async (formData) => {
    setError(null);
    setSuccess(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Token d'authentification manquant. Veuillez vous reconnecter.");
      return;
    }

    // Validation du code du club
    if (!formData.code || formData.code.trim() === '') {
      setError("Le code du club ne peut pas être vide.");
      return;
    }

    try {
      if (editClubData) {
        // Mode modification
        if (!canEditClub(editClubData, userPermissions)) {
          setError("Vous n'avez pas les droits nécessaires pour modifier ce club.");
          return;
        }

        // Vérifier si le code a changé et s'il est unique
        if (formData.code !== editClubData.code) {
          try {
            const isCodeUnique = await checkClubCodeUnique(formData.code, editClubData.id);
            if (!isCodeUnique) {
              setError("Ce code de club est déjà utilisé par un autre club. Veuillez en choisir un autre.");
              return;
            }
          } catch (error) {
            console.error("Erreur lors de la vérification de l'unicité du code:", error);
            // Continuer même si la vérification échoue
          }
        }

        const payload = mapToUpdateClubInfoRequest(formData, editClubData);
        console.log('Payload envoyé pour la modification:', payload);
        const result = await updateClub(editClubData.id, payload, token);
        
        if (!result || !result.success) {
          const errorData = result?.error || { message: "Une erreur s'est produite lors de la requête" };
          console.error('Erreur API (updateClub):', errorData);
          
          if (result?.status === 403 || errorData.message?.includes('administrateurs') || errorData.message?.includes('présidents')) {
            setError("Vous n'avez pas les droits nécessaires pour modifier ce club. Seuls les administrateurs et les gestionnaires du club peuvent effectuer cette action.");
          } else if (result?.status === 401) {
            setError('Votre session a expiré. Veuillez vous reconnecter.');
          } else {
            const backendMessage = errorData.message || 
                                  errorData.Message || 
                                  (errorData.errors ? JSON.stringify(errorData.errors) : null) ||
                                  errorData.details || 
                                  errorData.detailedError ||
                                  `Erreur ${result?.status || 'inconnue'} lors de la modification du club.`;
            setError(backendMessage);
          }
          return;
        }
        setSuccess('Club modifié avec succès.');
        setShowForm(false);
        // Recharge les données après modification
        fetchClubs();
      } else {
        // Mode création
        if (!canCreateClub(userPermissions)) {
          setError("Vous n'avez pas les droits nécessaires pour créer un club. Seuls les administrateurs peuvent créer de nouveaux clubs.");
          return;
        }

        // Vérifier si le code est unique
        try {
          const isCodeUnique = await checkClubCodeUnique(formData.code);
          if (!isCodeUnique) {
            setError("Ce code de club est déjà utilisé. Veuillez en choisir un autre.");
            return;
          }
        } catch (error) {
          console.error("Erreur lors de la vérification de l'unicité du code:", error);
          // Continuer même si la vérification échoue
        }

        const formattedData = mapToUpdateClubInfoRequest(formData);
        console.log('Payload envoyé pour la création:', formattedData);
        const result = await createClub(formattedData, token);
        if (!result || !result.success) {
          if (result?.error?.errors) {
            const validationErrors = Object.entries(result.error.errors)
              .map(([field, messages]) => {
                const messageArray = Array.isArray(messages) ? messages : [messages];
                return `${field}: ${messageArray.join(', ')}`;
              })
              .join('\n');
            setError(`Erreurs de validation:\n${validationErrors}`);
            return;
          }
          const errorData = result?.error || result || { message: "Une erreur s'est produite lors de la requête" };
          console.error('Erreur API (createClub):', errorData);
          if (result?.status === 403) {
            setError("Vous n'avez pas les droits nécessaires pour créer un club.");
          } else if (result?.status === 401) {
            setError('Votre session a expiré. Veuillez vous reconnecter.');
          } else {
            const backendMessage = errorData.message || 
                                  errorData.Message || 
                                  (errorData.errors ? JSON.stringify(errorData.errors) : null) ||
                                  errorData.details || 
                                  errorData.detailedError ||
                                  `Erreur ${result?.status || 'inconnue'} lors de la création du club.`;
            setError(backendMessage);
          }
          return;
        }
        setSuccess('Club ajouté avec succès.');
        setShowForm(false);
        fetchClubs();
      }
    } catch (e) {
      console.error('Erreur catch (handleFormSubmit):', e);
      if (e.message && e.message.includes('Session expirée')) {
        setError('Votre session a expiré. Veuillez vous reconnecter.');
      } else {
        setError("Une erreur inattendue s'est produite lors de la sauvegarde du club.");
      }
    }
  };

  const handleDelete = async (club) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le club "${club.name}" ? Cette action est irréversible.`)) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const result = await deleteClub(club.id);
      
      if (!result.success) {
        const errorData = result.error || { message: "Une erreur s'est produite lors de la suppression" };
        
        if (result.status === 403) {
          setError("Vous n'avez pas les droits nécessaires pour supprimer ce club.");
        } else if (result.status === 401) {
          setError('Votre session a expiré. Veuillez vous reconnecter.');
        } else {
          const backendMessage = errorData.message || 
                               errorData.Message || 
                               (errorData.errors ? JSON.stringify(errorData.errors) : null) ||
                               errorData.details || 
                               errorData.detailedError ||
                               `Erreur ${result.status || 'inconnue'} lors de la suppression du club.`;
          setError(backendMessage);
        }
        return;
      }

      setSuccess('Club supprimé avec succès.');
      fetchClubs();
    } catch (e) {
      console.error('Erreur lors de la suppression du club:', e);
      if (e.message && e.message.includes('Session expirée')) {
        setError('Votre session a expiré. Veuillez vous reconnecter.');
      } else {
        setError("Une erreur inattendue s'est produite lors de la suppression du club.");
      }
    }
  };

  // Fonction pour afficher les erreurs
  const renderErrorMessage = () => {
    if (!error) return null;

    // Si l'erreur est une chaîne avec des sauts de ligne
    if (typeof error === 'string' && error.includes('\n')) {
      return (
        <div className="text-red-600 bg-red-100 p-3 rounded mb-4">
          <div className="font-semibold mb-1">Erreurs :</div>
          {error.split('\n').map((line, index) => (
            <div key={index} className="text-sm">{line}</div>
          ))}
        </div>
      );
    }

    // Si l'erreur est un tableau
    if (Array.isArray(error)) {
      return (
        <div className="text-red-600 bg-red-100 p-3 rounded mb-4">
          <div className="font-semibold mb-1">Erreurs :</div>
          <ul className="list-disc list-inside">
            {error.map((err, idx) => (
              <li key={idx} className="text-sm">{err}</li>
            ))}
          </ul>
        </div>
      );
    }

    // Erreur simple
    return (
      <div className="text-red-600 bg-red-100 p-3 rounded mb-4">
        {error}
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4 sm:gap-0">
        <h2 className="text-xl font-bold">Gestion des clubs</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={fetchClubs} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
            disabled={loading}
          >
            {loading ? 'Chargement...' : 'Rafraîchir'}
          </button>
          {canCreateClub(userPermissions) && (
            <button 
              onClick={handleAdd} 
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto"
            >
              Ajouter un club
            </button>
          )}
        </div>
      </div>
      
      {/* Affichage des informations utilisateur */}
      {userPermissions && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p className="text-sm text-gray-600">
            Connecté en tant que : <span className="font-semibold">{userPermissions.role}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {getRolePermissions(userPermissions.role)}
          </p>
        </div>
      )}
      
      {/* Message de succès */}
      {success && (
        <div className="text-green-600 bg-green-100 p-3 rounded mb-4">
          {success}
        </div>
      )}
      
      {/* Messages d'erreur */}
      {renderErrorMessage()}
      
      {loading && !showForm ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-600">Chargement...</div>
        </div>
      ) : showForm ? (
        <ClubForm
          onSubmit={handleFormSubmit}
          initialData={editClubData}
          submitLabel={editClubData ? 'Modifier' : 'Ajouter'}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <div className="bg-white rounded-lg shadow">
          <div className="block md:hidden">
            {/* Version mobile avec toutes les colonnes */}
        <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Nom</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Code</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Ville</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Pays</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Email</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Téléphone</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Actif</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b sticky right-0 bg-gray-50 z-10 border-l border-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clubs.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                        Aucun club trouvé
                      </td>
                    </tr>
                  ) : (
                    clubs.map(club => (
                      <tr key={club.id} className="hover:bg-gray-50 group">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{club.name}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{club.code}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{club.city || '-'}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{club.country || '-'}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{club.email || '-'}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{club.phoneNumber || '-'}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            club.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {club.isActive ? 'Oui' : 'Non'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap sticky right-0 bg-white z-10 border-l border-gray-200 group-hover:bg-gray-50">
                          <div className="flex space-x-2">
                            {canEditClub(club, userPermissions) && (
                              <button 
                                onClick={() => handleEdit(club)} 
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                              >
                                Modifier
                              </button>
                            )}
                            {userPermissions.isAdmin && ( /* Condition rétablie */
                              <button
                                onClick={() => handleDelete(club)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                              >
                                Supprimer
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Version desktop: tableau complet avec défilement horizontal */}
          <div className="hidden md:block relative">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Nom</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Code</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Ville</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Pays</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Email</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Téléphone</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Actif</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 z-10 border-b border-l border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clubs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    Aucun club trouvé
                  </td>
                </tr>
              ) : (
                clubs.map(club => (
                      <tr key={club.id} className="hover:bg-gray-50 group">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{club.name}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{club.code}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{club.city || '-'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{club.country || '-'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{club.email || '-'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{club.phoneNumber || '-'}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        club.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {club.isActive ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap sticky right-0 bg-white z-10 border-l border-gray-200 group-hover:bg-gray-50">
                      <div className="flex space-x-2">
                        {canEditClub(club, userPermissions) && (
                          <button 
                            onClick={() => handleEdit(club)} 
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                          >
                            Modifier
                          </button>
                        )}
                        {userPermissions.isAdmin && ( /* Condition rétablie */
                          <button
                            onClick={() => handleDelete(club)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubManager;