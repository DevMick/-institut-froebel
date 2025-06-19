import React, { useEffect, useState } from 'react';
import { getCommissions, createCommission, updateCommission, deleteCommission, activateCommission, deactivateCommission } from '../api/commissionService';
import { getUserPermissions, canEditClub, canCreateClub, getRolePermissions } from '../utils/roleUtils';
import CommissionForm from './CommissionForm';
import { FaEdit, FaTrash, FaUsers, FaCalendarAlt, FaBuilding, FaInfo } from 'react-icons/fa';
import { Building, Edit, Trash2, Calendar, CheckCircle, Search } from 'lucide-react';

const CommissionManager = ({ onEdit }) => {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editCommission, setEditCommission] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userPermissions, setUserPermissions] = useState(getUserPermissions());
  const [userInfo, setUserInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      console.log('Fetching commissions...');
      const data = await getCommissions();
      console.log('Commissions data received:', data);
      if (Array.isArray(data)) {
        setCommissions(data);
        setError(null);
      } else {
        console.error('Received data is not an array:', data);
        setError('Format de données invalide');
      }
    } catch (err) {
      console.error('Error fetching commissions:', err);
      setError('Erreur lors du chargement des commissions');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (!canCreateClub(userPermissions)) {
      setError("Vous n'avez pas les droits nécessaires pour créer une commission. Seuls les administrateurs peuvent créer de nouvelles commissions.");
      return;
    }
    setEditCommission(null);
    setShowForm(true);
    setSuccess(null);
    setError(null);
  };

  const handleEdit = (commission) => {
    if (!canEditClub(commission.club, userPermissions)) {
      setError("Vous n'avez pas les droits nécessaires pour modifier cette commission. Seuls les administrateurs et les présidents du club peuvent modifier les informations.");
      return;
    }
    
    setEditCommission(commission);
    setShowForm(true);
    setSuccess(null);
    setError(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commission ?')) {
      try {
        await deleteCommission(id);
        setCommissions(commissions.filter(commission => commission.id !== id));
      } catch (err) {
        console.error('Error deleting commission:', err);
        setError('Erreur lors de la suppression de la commission');
      }
    }
  };

  const handleToggleActive = async (commission) => {
    if (!canEditClub(commission.club, userPermissions)) {
      setError("Vous n'avez pas les droits nécessaires pour modifier cette commission.");
      return;
    }

    setError(null);
    setSuccess(null);
    
    try {
      const result = commission.estActive 
        ? await deactivateCommission(commission.id)
        : await activateCommission(commission.id);
      
      if (!result || !result.success) {
        const errorMessage = result?.error?.message || `Une erreur est survenue lors de la ${commission.estActive ? 'désactivation' : 'activation'} de la commission.`;
        setError(errorMessage);
        return;
      }
      
      setSuccess(`La commission "${commission.nom}" a été ${commission.estActive ? 'désactivée' : 'activée'} avec succès.`);
      fetchCommissions();
    } catch (e) {
      console.error('Erreur lors du changement de statut:', e);
      setError(`Une erreur est survenue lors de la ${commission.estActive ? 'désactivation' : 'activation'} de la commission.`);
    }
  };

  const handleFormSubmit = async (formData) => {
    setError(null);
    setSuccess(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Token d'authentification manquant. Veuillez vous reconnecter.");
      return;
    }

    try {
      if (editCommission) {
        if (!canEditClub(editCommission.club, userPermissions)) {
          setError("Vous n'avez pas les droits nécessaires pour modifier cette commission.");
          return;
        }

        const payload = {
          nom: formData.nom || null,
          description: formData.description || null
        };
        
        console.log('Payload envoyé pour la modification:', payload);
        
        const result = await updateCommission(editCommission.id, payload);
        
        if (!result || !result.success) {
          const errorData = result?.error || { message: "Une erreur s'est produite lors de la requête" };
          console.error('Erreur API (updateCommission):', errorData);
          
          if (result?.status === 403) {
            setError("Vous n'avez pas les droits nécessaires pour modifier cette commission.");
          } else if (result?.status === 401) {
            setError('Votre session a expiré. Veuillez vous reconnecter.');
          } else {
            const backendMessage = errorData.message || 
                                  errorData.Message || 
                                  (errorData.errors ? JSON.stringify(errorData.errors) : null) ||
                                  errorData.details || 
                                  `Erreur ${result?.status || 'inconnue'} lors de la modification de la commission.`;
            setError(backendMessage);
          }
          return;
        }
        
        setSuccess('Commission modifiée avec succès.');
      } else {
        if (!canCreateClub(userPermissions)) {
          setError("Vous n'avez pas les droits nécessaires pour créer une commission. Seuls les administrateurs peuvent créer de nouvelles commissions.");
          return;
        }

        const payload = {
          nom: formData.nom,
          description: formData.description || null
        };

        console.log('Payload envoyé pour la création:', payload);
        
        const result = await createCommission(payload);
        
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
          console.error('Erreur API (createCommission):', errorData);
          
          if (result?.status === 403) {
            setError("Vous n'avez pas les droits nécessaires pour créer une commission.");
          } else if (result?.status === 401) {
            setError('Votre session a expiré. Veuillez vous reconnecter.');
          } else {
            const backendMessage = errorData.message || 
                                  errorData.Message || 
                                  (errorData.errors ? JSON.stringify(errorData.errors) : null) ||
                                  errorData.details || 
                                  `Erreur ${result?.status || 'inconnue'} lors de la création de la commission.`;
            setError(backendMessage);
          }
          return;
        }
        
        setSuccess('Commission ajoutée avec succès.');
      }
      
      setShowForm(false);
      fetchCommissions();
    } catch (e) {
      console.error('Erreur catch (handleFormSubmit):', e);
      if (e.message && e.message.includes('Session expirée')) {
        setError('Votre session a expiré. Veuillez vous reconnecter.');
      } else {
        setError("Une erreur inattendue s'est produite lors de la sauvegarde de la commission.");
      }
    }
  };

  const renderErrorMessage = () => {
    if (!error) return null;

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

    return (
      <div className="text-red-600 bg-red-100 p-3 rounded mb-4">
        {error}
      </div>
    );
  };

  const filteredCommissions = commissions.filter(commission => {
    const matchesSearch = commission.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.objectifs?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleDeleteCommission = (commission) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commission ?')) {
      onEdit({ ...commission, action: 'delete' });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const CommissionCard = ({ commission }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative">
        <div className={`h-32 bg-gradient-to-r ${
          commission.estActive 
            ? 'from-blue-500 to-indigo-600' 
            : 'from-gray-500 to-gray-600'
        }`}></div>
        <div className="absolute -bottom-8 left-6">
          <div className="w-16 h-16 rounded-full bg-white p-1 shadow-lg">
            <div className={`w-full h-full rounded-full flex items-center justify-center ${
              commission.estActive 
                ? 'bg-gradient-to-br from-blue-400 to-indigo-500' 
                : 'bg-gradient-to-br from-gray-400 to-gray-500'
            }`}>
              <Building className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            commission.estActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {commission.estActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        {commission.estActive && (
          <div className="absolute top-4 left-4">
            <CheckCircle className="h-6 w-6 text-green-300" />
          </div>
        )}
      </div>
      
      <div className="pt-12 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {commission.nom}
        </h3>
        <p className="text-sm text-gray-600 mb-3">Commission</p>
        
        <div className="space-y-2 mb-4">
          {commission.description && (
            <div className="text-xs text-gray-500 mt-2 line-clamp-2">
              {commission.description}
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(commission)}
            className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center text-sm font-medium"
          >
            <Edit className="h-4 w-4 mr-1" />
            Modifier
          </button>
          <button
            onClick={() => handleDeleteCommission(commission)}
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center text-sm font-medium"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Erreur !</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Rechercher une commission..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <div className="grid grid-cols-2 gap-1 w-4 h-4">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-3 ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <div className="space-y-1 w-4 h-4">
                  <div className="bg-current h-1 rounded"></div>
                  <div className="bg-current h-1 rounded"></div>
                  <div className="bg-current h-1 rounded"></div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommissions.map(commission => (
                <CommissionCard key={commission.id} commission={commission} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-blue-600" />
                    Nos commissions ({filteredCommissions.length})
                  </h3>
                  <div className="text-sm text-blue-600">
                    {filteredCommissions.filter(c => c.estActive).length} actives • {filteredCommissions.filter(c => !c.estActive).length} inactives
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2" />
                          Nom
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Edit className="h-4 w-4 mr-2" />
                          Description
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Statut
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredCommissions.map((commission) => (
                      <tr key={commission.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="relative flex-shrink-0">
                              <div className={`h-12 w-12 rounded-full flex items-center justify-center ring-2 ring-white shadow-lg ${
                                commission.estActive 
                                  ? 'bg-gradient-to-br from-blue-400 to-indigo-500' 
                                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
                              }`}>
                                <Building className="h-6 w-6 text-white" />
                              </div>
                              {commission.estActive && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {commission.nom}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {commission.description || 'Aucune description'}
                          </div>
                        </td>

                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            commission.estActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {commission.estActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        <td className="px-6 py-5 whitespace-nowrap text-center">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => onEdit(commission)}
                              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteCommission(commission)}
                              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      Actives: {filteredCommissions.filter(c => c.estActive).length}
                    </span>
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                      Inactives: {filteredCommissions.filter(c => !c.estActive).length}
                    </span>
                  </div>
                  <div>
                    Total: {filteredCommissions.length} commission{filteredCommissions.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {filteredCommissions.length === 0 && (
            <div className="text-center py-12">
              <Building className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commission trouvée</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Essayez de modifier votre recherche.' : 'Commencez par créer une nouvelle commission.'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommissionManager; 