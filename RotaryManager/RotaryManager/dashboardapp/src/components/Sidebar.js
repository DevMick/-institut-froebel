import React, { useState, useEffect } from "react";
import { FiHome, FiUsers, FiSettings, FiLogOut, FiChevronLeft, FiChevronRight, FiBriefcase, FiList, FiCalendar, FiAward, FiUserCheck, FiChevronDown, FiChevronUp, FiClock, FiFileText, FiDollarSign, FiCreditCard, FiFile, FiImage, FiBarChart2, FiFolder, FiUser, FiEdit2, FiMail, FiPhone, FiMapPin, FiEye, FiEyeOff, FiSave, FiX, FiArrowLeft, FiCheck, FiCamera, FiUserPlus, FiTable, FiTag, FiGift } from "react-icons/fi";
import { UserOutlined, MailOutlined, PhoneOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import { fonctionService } from '../api/fonctionService';
import { FaMoneyBillWave } from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({});
  const { user } = useAuth();
  const [firstFonctionId, setFirstFonctionId] = useState(null);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    fonction: '',
    motDePasse: '',
    confirmMotDePasse: ''
  });

  const menuItems = [
    {
      key: 'dashboard',
      icon: <FiHome />,
      label: 'Tableau de bord',
      to: '/dashboard'
    },
    
    // SECTION GOUVERNANCE
    {
      key: 'section-gouvernance',
      isSection: true,
      icon: <FiBriefcase />,
      label: 'GOUVERNANCE'
    },
    {
      key: 'membres',
      icon: <FiUsers />,
      label: "Membres",
      children: [
        { icon: <FiUsers />, label: "Liste des membres", to: "/membres" },
        { icon: <FiAward />, label: "Rôles et Responsabilités", to: '/fonctions/roles-responsabilites' },
        { icon: <FiCalendar />, label: "Mandats", to: "/mandats" }
      ]
    },
   
    {
      key: 'commissions',
      icon: <FiList />,
      label: "Commissions",
      children: [
        { icon: <FiList />, label: "Gestion des commissions", to: "/commissions" },
        { icon: <FiUsers />, label: "Affectation des membres", to: "/gestion-commissions" }
      ]
    },
    {
      key: 'comites',
      icon: <FiUsers />,
      label: "Comités",
      children: [
        { icon: <FiList />, label: 'Liste des fonctions', to: '/fonctions' },
        { icon: <FiClock />, label: 'Échéances', to: '/fonctions/echeances' },
        { icon: <FiUserCheck />, label: 'Affectation des membres', to: '/affectation-comite' }
      ]
    },

    // SECTION RÉUNIONS & ÉVÉNEMENTS
    {
      key: 'section-reunions-evenements',
      isSection: true,
      icon: <FiCalendar />,
      label: 'RÉUNIONS & ÉVÉNEMENTS'
    },
    {
      key: 'reunions',
      icon: <FiCalendar />,
      label: 'Réunions',
      children: [
        { icon: <FiClock />, label: 'Types de réunion', to: `/clubs/${user?.clubId}/types-reunion` },
        { icon: <FiCalendar />, label: 'Calendrier des réunions', to: `/clubs/${user?.clubId}/reunions` },
        { icon: <FiFileText />, label: 'Ordres du jour', to: `/clubs/${user?.clubId}/ordres-du-jour` },
        { icon: <FiFileText />, label: 'Documents de réunion', to: `/clubs/${user?.clubId}/documents` },
        { icon: <FiUserCheck />, label: 'Liste de présence', to: `/clubs/${user?.clubId}/liste-presence` },
        { icon: <FiUserPlus />, label: 'Liste des invités', to: `/clubs/${user?.clubId}/invites-reunion` },
        { icon: <FiFileText />, label: 'Compte-rendu', to: `/clubs/${user?.clubId}/compte-rendu` }
      ]
    },
    {
      key: 'evenements',
      icon: <FiCalendar />,
      label: "Événements",
      children: [
        { icon: <FiCalendar />, label: "Liste des événements", to: "/evenements" },
        { icon: <FiDollarSign />, label: "Budgets événements", to: "/evenement-budget" },
        { icon: <FiDollarSign />, label: "Recettes d'événements", to: "/evenement-recettes" },
        { icon: <FiFile />, label: "Documents d'événements", to: "/evenement-documents" },
        { icon: <FiImage />, label: "Médiathèque", to: "/evenement-images" }
      ]
    },
    {
      key: 'galas',
      icon: <FiAward />,
      label: "Galas",
      children: [
        { icon: <FiCalendar />, label: "Liste des galas", to: "/galas" },
        { icon: <UserOutlined />, label: 'Liste des Invités', to: '/gala-invites' },
        { icon: <FiTable />, label: 'Liste des Tables', to: '/gala-tables' },
        { icon: <FiTable />, label: 'Affectation Tables', to: '/gala-table-affectations' },
        { icon: <FiTag />, label: 'Gestion des Tickets Gala', to: '/gala-tickets' },
        { icon: <FiGift />, label: 'Gestion des Souches Tombola', to: '/gala-tombolas' }
      ]
    },

    // SECTION FINANCES
    {
      key: 'section-finances',
      isSection: true,
      icon: <FiDollarSign />,
      label: 'FINANCES'
    },
    {
      key: 'budget',
      icon: <FiBarChart2 />,
      label: 'Budget',
      children: [
        { icon: <FiDollarSign />, label: 'Types de budget', to: '/types-budget' },
        { icon: <FiList />, label: 'Catégories budget', to: `/clubs/${user?.clubId}/categories-budget` },
        { icon: <FiList />, label: 'Sous-catégories budget', to: `/clubs/${user?.clubId}/sous-categories-budget` },
        { icon: <FiFileText />, label: 'Rubriques budget', to: '/rubriques-budget' },
        { icon: <FaMoneyBillWave />, label: 'Réalisés', to: '/realisations-budget' }
      ]
    },
    {
      key: 'Cotisations',
      icon: <FiDollarSign />,
      label: 'Cotisations',
      children: [
        { icon: <FiDollarSign />, label: "Situation ", to: "/cotisations" },
        { icon: <FiCreditCard />, label: "Paiements", to: '/paiements-cotisations' }

      ]
    },

    // SECTION DOCUMENTS
    {
      key: 'section-documents',
      isSection: true,
      icon: <FiFileText />,
      label: 'DOCUMENTS'
    },
    {
      key: 'bibliotheque',
      icon: <FiFolder />,
      label: 'Bibliothèque',
      children: [
        { icon: <FiFileText />, label: 'Liste des documents', to: '/documents' },
        { icon: <FiFile />, label: 'Types de documents', to: '/documents/types' },
        { icon: <FiFolder />, label: 'Catégories', to: '/documents/categories' }
      ]
    }
  ];

  // Fonction pour déterminer quel menu doit être ouvert selon la route courante
  const getActiveMenuFromPath = (pathname) => {
    const activeMenus = {};
    
    menuItems.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => {
          // Vérification exacte ou pour les routes dynamiques avec clubId
          return child.to === pathname || 
                 (child.to.includes('${user?.clubId}') && 
                  pathname.includes(child.to.replace('${user?.clubId}', user?.clubId || '')));
        });
        
        if (hasActiveChild) {
          activeMenus[item.label] = true;
        }
      }
    });
    
    return activeMenus;
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        onToggleCollapse(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [onToggleCollapse]);

  // Effet pour ouvrir automatiquement le bon menu selon la route courante
  useEffect(() => {
    const activeMenus = getActiveMenuFromPath(location.pathname);
    setOpenMenus(prevMenus => ({
      ...prevMenus,
      ...activeMenus
    }));
  }, [location.pathname, user?.clubId]);

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/dashboard');
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    async function fetchFonctions() {
      try {
        const res = await fonctionService.getFonctions();
        if (res && res.length > 0) {
          setFirstFonctionId(res[0].id);
        }
      } catch (e) {
        // fallback: nothing
      }
    }
    fetchFonctions();
  }, []);

  // Fonction pour obtenir les initiales de l'utilisateur
  const getUserInitials = (user) => {
    if (!user) return 'U';
    const nom = user.nom || user.lastName || '';
    const prenom = user.prenom || user.firstName || '';
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U';
  };

  // Charger les données du profil utilisateur
  useEffect(() => {
    if (user && (showProfilePanel || isEditing)) {
      setProfileData({
        nom: user.nom || user.lastName || '',
        prenom: user.prenom || user.firstName || '',
        email: user.email || '',
        telephone: user.telephone || user.phone || user.phoneNumber || '',
        motDePasse: '',
        confirmMotDePasse: ''
      });
    }
  }, [user, showProfilePanel, isEditing]);

  const handleProfileUpdate = async () => {
    try {
      // Validation
      if (profileData.motDePasse && profileData.motDePasse !== profileData.confirmMotDePasse) {
        alert('Les mots de passe ne correspondent pas');
        return;
      }

      if (profileData.motDePasse && profileData.motDePasse.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }

      // Ici vous devrez implémenter l'appel API pour mettre à jour le profil
      // const updatedUser = await userService.updateProfile(profileData);
      
      alert('Profil mis à jour avec succès');
      setIsEditing(false);
      setEditingField(null);
      setShowPassword(false);
      setProfileData(prev => ({ ...prev, motDePasse: '', confirmMotDePasse: '' }));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      alert('Erreur lors de la mise à jour du profil');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleNavigation = (to) => {
    if (isMobile) {
      onClose();
    }
    navigate(to);
  };

  const toggleSubMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  // Fonction pour vérifier si un sous-menu est actif
  const isSubMenuActive = (subItemTo) => {
    if (subItemTo.includes('${user?.clubId}') && user?.clubId) {
      const resolvedPath = subItemTo.replace('${user?.clubId}', user.clubId);
      return location.pathname === resolvedPath;
    }
    return location.pathname === subItemTo;
  };

  const handleFieldEdit = (field) => {
    setEditingField(field);
    setIsEditing(true);
  };

  const handleFieldSave = (field) => {
    setEditingField(null);
    // Ici vous pouvez ajouter la logique pour sauvegarder le champ spécifique
  };

  const closeProfilePanel = () => {
    setShowProfilePanel(false);
    setIsEditing(false);
    setEditingField(null);
    setShowPassword(false);
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-gradient-to-b from-gray-50 to-white shadow-xl z-50
          transition-all duration-300 ease-in-out border-r border-gray-200
          ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
          ${isCollapsed ? 'w-16' : 'w-72'}
        `}
        style={{ '--sidebar-width': isCollapsed ? '4rem' : '18rem' }}
      >
        <div className="flex flex-col h-full">
          {/* En-tête moderne */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-white">
            {!isCollapsed && (
              <div className="flex items-center justify-center">
                <img 
                  src="https://rotaryclubabidjandeuxplateaux.org/wp-content/uploads/2023/09/Logo_II_Plateaux_Abidjan_v2.png" 
                  alt="Rotary Club Abidjan Deux Plateaux"
                  className="w-100 h-10 object-contain"
                />
              </div>
            )}
            <button
              onClick={() => onToggleCollapse(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.key || item.to || item.label}>
                  {item.isSection ? (
                    // Titre de section style ABP
                    <div className={`
                      mt-6 first:mt-2 mb-3
                      ${isCollapsed ? 'px-2' : 'px-3'}
                    `}>
                      {isCollapsed ? (
                        <div className="flex justify-center py-2 border-b border-gray-200">
                          <span className="text-blue-600 text-lg">{item.icon}</span>
                        </div>
                      ) : (
                        <div className="flex items-center pb-2 border-b border-gray-200">
                          <span className="text-blue-600 mr-2 text-sm">{item.icon}</span>
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {item.label}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : item.children ? (
                    // Menu avec sous-menus style ABP
                    <div className="mb-1">
                      <button
                        onClick={() => toggleSubMenu(item.label)}
                        className={`
                          w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                          transition-all duration-200 text-sm font-medium
                          ${openMenus[item.label] 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }
                          focus:outline-none focus:ring-2 focus:ring-blue-500
                        `}
                        aria-label={item.label}
                      >
                        <div className="flex items-center">
                          <span className={`
                            flex-shrink-0 mr-3 text-lg
                            ${openMenus[item.label] ? 'text-blue-600' : 'text-gray-500'}
                          `}>
                            {item.icon}
                          </span>
                          {!isCollapsed && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </div>
                        {!isCollapsed && (
                          <span className={`
                            ml-auto transition-transform duration-200
                            ${openMenus[item.label] ? 'rotate-180' : ''}
                          `}>
                            <FiChevronDown className="w-4 h-4" />
                          </span>
                        )}
                      </button>
                      
                      {/* Sous-menus avec animation */}
                      <div className={`
                        overflow-hidden transition-all duration-300 ease-in-out
                        ${openMenus[item.label] && !isCollapsed 
                          ? 'max-h-96 opacity-100 mt-1' 
                          : 'max-h-0 opacity-0'
                        }
                      `}>
                        <ul className="pl-6 space-y-1">
                          {item.children.map((subItem) => (
                            <li key={subItem.to}>
                              <button
                                onClick={() => handleNavigation(subItem.to)}
                                className={`
                                  w-full flex items-center px-3 py-2 rounded-md
                                  transition-all duration-200 text-sm
                                  ${isSubMenuActive(subItem.to)
                                    ? 'bg-blue-100 text-blue-700 font-medium border-l-2 border-blue-500'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                  }
                                  focus:outline-none focus:ring-2 focus:ring-blue-500
                                `}
                                aria-label={subItem.label}
                              >
                                <span className="flex-shrink-0 mr-2 text-base opacity-70">
                                  {subItem.icon}
                                </span>
                                <span className="truncate">{subItem.label}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    // Menu simple
                    <button
                      onClick={() => handleNavigation(item.to)}
                      className={`
                        w-full flex items-center px-3 py-2.5 rounded-lg
                        transition-all duration-200 text-sm font-medium
                        ${location.pathname === item.to
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                      `}
                      aria-label={item.label}
                    >
                      <span className={`
                        flex-shrink-0 mr-3 text-lg
                        ${location.pathname === item.to ? 'text-blue-600' : 'text-gray-500'}
                      `}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Pied de page avec profil utilisateur - Style Claude */}
          <div className="p-4 border-t border-gray-200 bg-white relative">
            <button
              onClick={() => setShowProfilePanel(!showProfilePanel)}
              className="flex items-center w-full px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 group"
              aria-label="Profil utilisateur"
            >
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                  {getUserInitials(user)}
                </div>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="truncate font-medium text-gray-900 text-sm">
                    {user?.prenom || user?.firstName} {user?.nom || user?.lastName}
                  </span>
                  <span className="truncate text-xs text-gray-500">
                    {user?.fonction || user?.role || 'Membre'}
                  </span>
                </div>
              )}
              {!isCollapsed && (
                <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showProfilePanel ? 'rotate-180' : ''}`} />
              )}
            </button>

            {/* Dropdown du profil - Style Claude */}
            {showProfilePanel && !isCollapsed && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                {/* Email de l'utilisateur */}
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                </div>

                {/* Menu Personnel */}
                <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer group" onClick={() => setIsEditing(true)}>
                  <div className="flex items-center space-x-2">
                    <FiUser className="w-5 h-5" />
                    <span className="text-sm font-medium text-gray-900">Profil</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-1"></div>

                {/* Se déconnecter */}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm text-gray-700">Se déconnecter</p>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal de paramètres - Style Claude */}
        {isEditing && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity duration-300"
              onClick={() => {
                setIsEditing(false);
                setEditingField(null);
                setShowPassword(false);
              }}
            />
            
            {/* Modal */}
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
                {/* En-tête */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Paramètres du profil</h2>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditingField(null);
                      setShowPassword(false);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FiX className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Contenu */}
                <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
                  {/* Avatar section */}
                  <div className="p-6 text-center border-b border-gray-100">
                    <div className="relative inline-block">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        {getUserInitials(user)}
                      </div>
                      <button className="absolute bottom-0 right-0 w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg">
                        <FiCamera className="w-3 h-3 text-white" />
                      </button>
                    </div>
                    <h3 className="mt-3 font-medium text-gray-900">
                      {user?.prenom || user?.firstName} {user?.nom || user?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>

                  {/* Formulaire avec champs sur une seule ligne */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Nom */}
                      <div className="form-group relative">
                        <label className="form-label">
                          <span className="required-asterisk">* </span>
                          Nom
                        </label>
                        <input
                          type="text"
                          value={profileData.nom}
                          onChange={(e) => setProfileData(prev => ({ ...prev, nom: e.target.value }))}
                          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors modern-input"
                          placeholder="Votre nom"
                        />
                        <UserOutlined className="absolute left-3 top-[38px] text-blue-500" />
                      </div>

                      {/* Prénom */}
                      <div className="form-group relative">
                        <label className="form-label">
                          <span className="required-asterisk">* </span>
                          Prénom
                        </label>
                        <input
                          type="text"
                          value={profileData.prenom}
                          onChange={(e) => setProfileData(prev => ({ ...prev, prenom: e.target.value }))}
                          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors modern-input"
                          placeholder="Votre prénom"
                        />
                        <UserOutlined className="absolute left-3 top-[38px] text-blue-500" />
                      </div>

                      {/* Email */}
                      <div className="form-group relative">
                        <label className="form-label">
                          <span className="required-asterisk">* </span>
                          Email
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors modern-input"
                          placeholder="votre.email@exemple.com"
                        />
                        <MailOutlined className="absolute left-3 top-[38px] text-blue-500" />
                      </div>

                      {/* Téléphone */}
                      <div className="form-group relative">
                        <label className="form-label">
                          <span className="required-asterisk">* </span>
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          value={profileData.telephone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, telephone: e.target.value }))}
                          className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors modern-input"
                          placeholder="+225 XX XX XX XX"
                        />
                        <PhoneOutlined className="absolute left-3 top-[38px] text-blue-500" />
                      </div>

                      {/* Nouveau mot de passe */}
                      <div className="form-group relative">
                        <label className="form-label">
                          Nouveau mot de passe
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={profileData.motDePasse}
                            onChange={(e) => setProfileData(prev => ({ ...prev, motDePasse: e.target.value }))}
                            className="w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors modern-input"
                            placeholder="Laisser vide pour ne pas changer"
                          />
                          <LockOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pied du modal */}
                <div className="flex justify-center space-x-3 p-6 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditingField(null);
                      setShowPassword(false);
                      setProfileData(prev => ({ ...prev, motDePasse: '', confirmMotDePasse: '' }));
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleProfileUpdate}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            </div>

            {/* Styles CSS pour les champs */}
            <style jsx>{`
              
              .form-label {
                display: block;
                margin-bottom: 0.5rem;
                font-size: 14px;
                font-weight: 500;
                color: #374151;
              }
              
              .required-asterisk {
                color: #ef4444;
              }
              
              .modern-input {
                border: 1px solid #e5e7eb !important;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
                transition: all 0.2s ease !important;
              }
              
              .modern-input:hover {
                border-color: #3b82f6 !important;
                box-shadow: 0 1px 3px rgba(59, 130, 246, 0.1) !important;
              }
              
              .modern-input:focus {
                border-color: #3b82f6 !important;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
              }
            `}</style>
          </>
        )}
      </aside>
    </>
  );
};

export default Sidebar;