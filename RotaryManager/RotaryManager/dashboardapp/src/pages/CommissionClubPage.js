import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Edit, Trash2, MoreVertical, ArrowLeft, Menu, X, Plus, 
  CheckCircle, User, Settings, Calendar, UserPlus, 
  Building, Crown, Clock, Star, Search, Mail, Phone, Award
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getCommissions, assignCommissionToClub, getCommissionsByClub, deleteClubCommission } from '../api/commissionService';

// Composant CommissionForm personnalisé
const CommissionForm = ({ onSubmit, initialData = null, onCancel, submitLabel = 'Affecter', commissions = [] }) => {
  const [formData, setFormData] = useState({
    commissionId: '',
    estActive: true,
    notesSpecifiques: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        commissionId: initialData.commissionId || '',
        estActive: initialData.estActive !== undefined ? initialData.estActive : true,
        notesSpecifiques: initialData.notesSpecifiques || ''
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.commissionId) {
      newErrors.commissionId = 'La commission est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ name, label, type = "text", placeholder, icon: Icon, required = false, children, className = "" }) => (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        {children ? (
          <select
            name={name}
            value={formData[name]}
            onChange={handleChange}
            className={`pl-12 pr-4 py-3 border-2 rounded-xl w-full transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-400 ${
              errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
            required={required}
          >
            {children}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            name={name}
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleChange}
            rows={3}
            className={`pl-12 pr-4 py-3 border-2 rounded-xl w-full transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-400 resize-none ${
              errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
            required={required}
          />
        ) : (
          <input
            name={name}
            type={type}
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleChange}
            className={`pl-12 pr-4 py-3 border-2 rounded-xl w-full transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-400 ${
              errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
            required={required}
          />
        )}
        {errors[name] && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="w-4 h-4 mr-1">⚠️</span>
            {errors[name]}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 px-8 py-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Award className="mr-3 h-7 w-7" />
          {initialData ? 'Modifier la commission' : 'Affecter une commission au club'}
        </h2>
        <p className="text-blue-100 mt-1">
          {initialData ? 'Modifiez les paramètres de la commission ci-dessous' : 'Assignez une commission à votre club avec les paramètres appropriés'}
        </p>
      </div>

      <div className="p-8">
        <div className="space-y-8">
          {/* Section Commission */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
              <Award className="mr-2 h-5 w-5 text-blue-600" />
              Affectation de commission
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                name="commissionId"
                label="Commission"
                icon={Award}
                required
              >
                <option value="">Sélectionner une commission</option>
                {commissions.map((commission) => (
                  <option key={commission.id} value={commission.id}>
                    {commission.nom}
                  </option>
                ))}
              </InputField>

              <div className="flex items-center space-x-4 mt-8">
                <input
                  type="checkbox"
                  name="estActive"
                  id="estActive"
                  checked={formData.estActive}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="estActive" className="text-sm font-medium text-gray-700">
                  Commission active
                </label>
              </div>

              <div className="md:col-span-2">
                <InputField
                  name="notesSpecifiques"
                  label="Notes spécifiques"
                  type="textarea"
                  placeholder="Ajoutez des notes ou commentaires sur cette affectation..."
                  icon={Star}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 mt-8">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-100 font-medium"
              disabled={isLoading}
            >
              Annuler
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Affectation...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Composant CommissionManager personnalisé
const CommissionManager = ({ onEdit, onDelete, clubCommissions = [], commissions = [] }) => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const filteredCommissions = clubCommissions.filter(commission => {
    const commissionData = commissions.find(c => c.id === commission.commissionId);
    const matchesSearch = commissionData?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.notesSpecifiques?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleDeleteCommission = (commission) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette commission du club ?')) {
      onDelete(commission.id);
    }
  };

  const getCommissionName = (commissionId) => {
    const commission = commissions.find(c => c.id === commissionId);
    return commission?.nom || 'Commission inconnue';
  };

  const getCommissionDescription = (commissionId) => {
    const commission = commissions.find(c => c.id === commissionId);
    return commission?.description || 'Aucune description';
  };

  const CommissionCard = ({ commission }) => (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="absolute -bottom-8 left-6">
          <div className="w-16 h-16 rounded-full bg-white p-1 shadow-lg">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <Award className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            commission.estActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {commission.estActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="absolute top-4 left-4">
          <Star className="h-6 w-6 text-yellow-400" />
        </div>
      </div>
      
      <div className="pt-12 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {getCommissionName(commission.commissionId)}
        </h3>
        <p className="text-sm text-gray-600 mb-3">{getCommissionDescription(commission.commissionId)}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Star className="h-4 w-4 mr-2" />
            Notes: {commission.notesSpecifiques || 'Aucune note'}
          </div>
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

  return (
    <div className="space-y-6">
      {/* Barre de recherche et boutons de vue */}
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

      {/* Affichage conditionnel selon le mode de vue */}
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
                    <Award className="h-5 w-5 mr-2 text-blue-600" />
                    Commissions du club ({filteredCommissions.length})
                  </h3>
                  <div className="text-sm text-blue-600">
                    {filteredCommissions.length} commission{filteredCommissions.length > 1 ? 's' : ''} affectée{filteredCommissions.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Award className="h-4 w-4 mr-2" />
                          Nom
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-2" />
                          Description
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Statut
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-2" />
                          Notes
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center justify-center">
                          <MoreVertical className="h-4 w-4 mr-2" />
                          Actions
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredCommissions.map((commission) => (
                      <tr key={commission.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 group">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="relative flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ring-2 ring-white shadow-lg">
                                <Award className="h-6 w-6 text-white" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {getCommissionName(commission.commissionId)}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {getCommissionDescription(commission.commissionId)}
                          </div>
                        </td>

                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            commission.estActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {commission.estActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {commission.notesSpecifiques || 'Aucune note'}
                          </div>
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

              {/* Footer du tableau */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                      Total: {filteredCommissions.length}
                    </span>
                  </div>
                  <div>
                    {filteredCommissions.length} commission{filteredCommissions.length > 1 ? 's' : ''} affectée{filteredCommissions.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {filteredCommissions.length === 0 && (
            <div className="text-center py-12">
              <Award className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune commission affectée</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Essayez de modifier votre recherche.' : 'Commencez par affecter des commissions au club.'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Composant principal CommissionClubPage
const CommissionClubPage = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [clubCommissions, setClubCommissions] = useState([]);
  const [editingCommission, setEditingCommission] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userObj = JSON.parse(storedUser);
        setUserInfo(userObj);
      } catch (e) {
        console.error('Erreur lors de la récupération des informations utilisateur:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (userInfo?.clubId) {
      fetchData();
    }
  }, [userInfo]);

  const fetchData = async () => {
    try {
      // Import des services d'API
      const { getCommissions } = await import('../api/commissionService');
      const { getCommissionsByClub } = await import('../api/commissionService');

      const commissionsResponse = await getCommissions();
      setCommissions(commissionsResponse || []);

      const clubCommissionsResponse = await getCommissionsByClub(userInfo.clubId);
      setClubCommissions(clubCommissionsResponse || []);
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError('Erreur lors du chargement des données');
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { assignCommissionToClub } = await import('../api/commissionService');
      
      const result = await assignCommissionToClub({
        clubId: userInfo.clubId,
        commissionId: formData.commissionId,
        estActive: formData.estActive,
        notesSpecifiques: formData.notesSpecifiques
      });

      if (result.success) {
        setSuccess('Commission affectée avec succès au club !');
        setActiveTab('list');
        fetchData(); // Recharger les données
        
        // Effacer le message de succès après 3 secondes
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error?.message || 'Erreur lors de l\'affectation de la commission');
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de l\'affectation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commissionId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cette commission du club ?')) return;
    
    try {
      const { deleteClubCommission } = await import('../api/commissionService');
      
      const result = await deleteClubCommission(userInfo.clubId, commissionId);
      if (result.success) {
        setSuccess('Commission supprimée avec succès du club');
        fetchData(); // Recharger les données
        setError(null);
        
        // Effacer le message de succès après 3 secondes
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error?.message || 'Erreur lors de la suppression de la commission');
      }
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression : ' + (err.message || ''));
      setSuccess(null);
    }
  };

  const handleEdit = (commission) => {
    setEditingCommission(commission);
    setActiveTab('form');
  };

  const handleCancel = () => {
    setEditingCommission(null);
    setActiveTab('list');
  };

  const handleToggleCollapse = useCallback((collapsed) => {
    setIsCollapsed(collapsed);
  }, []);

  const sidebarWidth = isCollapsed ? '4rem' : '18rem';

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Overlay pour mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={toggleSidebar}
        />
      )}

      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      <main 
        className="flex-1 w-full transition-all duration-300 min-h-screen overflow-x-hidden" 
        style={{ 
          marginLeft: isMobile ? '0' : `calc(${sidebarWidth})`,
          width: isMobile ? '100%' : `calc(100% - ${sidebarWidth})`
        }}
      >
        {/* Navigation sticky */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {isMobile && (
                  <button
                    onClick={toggleSidebar}
                    className="mr-4 text-gray-600 hover:text-gray-800 focus:outline-none p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                )}
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center">
                    <Award className="mr-3 h-7 w-7 text-blue-600" />
                    Gestion des commissions
                </h1>
                  <p className="text-sm text-gray-600 mt-1">Affectez et gérez les commissions de votre club</p>
                </div>
              </div>
              <Link 
                to="/dashboard" 
                className="flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden md:inline">Retour au tableau de bord</span>
                <span className="md:hidden">Retour</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Messages de notification */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center">
              <X className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {/* Onglets de navigation */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-2">
              <nav className="flex space-x-2">
                <button
                  onClick={() => { setActiveTab('form'); setEditingCommission(null); }}
                  className={`flex-1 py-3 px-6 font-medium text-sm rounded-xl transition-all duration-200 flex items-center justify-center ${
                    activeTab === 'form'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {editingCommission ? 'Modifier la commission' : 'Affecter une commission'}
                </button>
                <button
                  onClick={() => { setActiveTab('list'); setEditingCommission(null); }}
                  className={`flex-1 py-3 px-6 font-medium text-sm rounded-xl transition-all duration-200 flex items-center justify-center ${
                    activeTab === 'list'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Commissions du club
                </button>
              </nav>
            </div>
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'form' ? (
            <CommissionForm
              onSubmit={handleSubmit}
              initialData={editingCommission}
              submitLabel={submitting ? 'Affectation...' : editingCommission ? 'Mettre à jour' : 'Affecter la commission'}
              onCancel={handleCancel}
              commissions={commissions}
            />
          ) : (
            <CommissionManager 
              onEdit={handleEdit}
              onDelete={handleDelete} 
              clubCommissions={clubCommissions}
              commissions={commissions}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default CommissionClubPage; 