import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Megaphone, Calendar, LogOut, ChevronLeft, ChevronRight, X, Menu, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../../assets/images/Logo.png';

const navItems = [
  { label: 'Dashboard', to: '/espace-parents', icon: <Home size={20} /> },
  { label: 'Cahier de Liaison', to: '/espace-parents/cahier-liaison', icon: <BookOpen size={20} /> },
  { label: 'Annonces', to: '/espace-parents/annonces', icon: <Megaphone size={20} /> },
];

const ParentSidebar = ({ mobile = false, onClose }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Gestion du redimensionnement pour desktop
  useEffect(() => {
    if (mobile) return;
    const mainContent = document.querySelector('.parent-main-content');
    if (mainContent) {
      if (collapsed) {
        mainContent.style.marginLeft = '4rem';
      } else {
        mainContent.style.marginLeft = '16rem';
      }
    }
  }, [collapsed, mobile]);

  // Fermer le menu mobile au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuOpen && !event.target.closest('.mobile-sidebar')) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // Header mobile avec hamburger menu
  const MobileHeader = () => (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/espace-parents" className="flex items-center">
          <img src={Logo} alt="Institut Froebel" className="h-10 w-auto object-contain" />
          <span className="ml-2 text-sm font-bold text-green-700">INSTITUT FROEBEL</span>
        </Link>
        
        <div className="flex items-center gap-3">
          {/* Informations utilisateur compactes */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User size={16} />
            <span className="hidden sm:block font-medium">{user?.name || 'Parent'}</span>
          </div>
          
          {/* Bouton hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors duration-200"
            aria-label="Ouvrir le menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );

  // Overlay pour mobile
  const MobileOverlay = () => (
    mobileMenuOpen && (
      <div 
        className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={() => setMobileMenuOpen(false)}
      />
    )
  );

  // Sidebar mobile
  const MobileSidebar = () => (
    <aside 
      className={`mobile-sidebar md:hidden fixed top-0 right-0 h-full w-full max-w-xs bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      aria-label="Navigation parent espace"
    >
      {/* Header du menu mobile */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
            <User size={24} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{user?.name || 'Parent Utilisateur'}</h3>
            <p className="text-sm text-gray-500">{user?.email || 'parent@froebel.edu'}</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Fermer le menu"
        >
          <X size={24} className="text-gray-500" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-2 px-4">
          {navItems.map((item, index) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                  location.pathname === item.to
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-50 hover:shadow-md'
                }`}
                onClick={() => setMobileMenuOpen(false)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className={`flex-shrink-0 p-2 rounded-lg ${
                  location.pathname === item.to 
                    ? 'bg-white bg-opacity-20' 
                    : 'bg-gray-100'
                }`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
                {location.pathname === item.to && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer avec déconnexion */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <button
          onClick={() => {
            logout();
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200"
        >
          <LogOut size={20} />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );

  // Sidebar desktop (version existante améliorée)
  const DesktopSidebar = () => (
    <aside
      className={`parent-sidebar ${collapsed ? 'collapsed' : 'expanded'} hidden md:flex flex-col bg-white border-r border-gray-200 h-screen transition-all duration-300 shadow-lg`}
      style={{ width: collapsed ? '4rem' : '16rem' }}
      aria-label="Navigation parent espace"
    >
      {/* Header desktop */}
      <div className="flex items-center justify-between h-20 px-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
        <Link to="/espace-parents" className={`flex-1 flex items-center ${collapsed ? 'justify-center' : 'justify-start'} min-w-0`}>
          <img src={Logo} alt="Institut Froebel" className="h-12 w-auto object-contain" />
        </Link>
        <button
          className="p-2 rounded-lg hover:bg-emerald-100 transition-colors flex-shrink-0 text-emerald-600"
          aria-label={collapsed ? 'Déplier la sidebar' : 'Réduire la sidebar'}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      
      {/* Navigation desktop */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-2 px-3">
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 group ${
                  location.pathname === item.to
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-50 hover:shadow-md'
                }`}
                aria-current={location.pathname === item.to ? 'page' : undefined}
                title={collapsed ? item.label : undefined}
              >
                <span className={`flex-shrink-0 p-1 rounded-lg transition-all duration-200 ${
                  location.pathname === item.to 
                    ? 'bg-white bg-opacity-20' 
                    : 'group-hover:bg-gray-100'
                }`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="truncate font-medium">{item.label}</span>
                )}
                {!collapsed && location.pathname === item.to && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer desktop */}
      <div className="mt-auto p-4 border-t border-gray-100">
        {!collapsed && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User size={16} />
              <div className="truncate">
                <p className="font-medium truncate">{user?.name || 'Parent'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 text-red-600 hover:text-red-700 transition-colors w-full px-3 py-2 rounded-lg hover:bg-red-50"
          aria-label="Déconnexion"
          title={collapsed ? "Déconnexion" : undefined}
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!collapsed && <span className="truncate font-medium">Déconnexion</span>}
        </button>
      </div>
    </aside>
  );

  // Rendu principal
  return (
    <>
      {/* Header mobile avec hamburger */}
      <MobileHeader />
      
      {/* Overlay mobile */}
      <MobileOverlay />
      
      {/* Sidebar mobile */}
      <MobileSidebar />
      
      {/* Sidebar desktop */}
      <DesktopSidebar />

      {/* Styles pour les animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .mobile-sidebar nav ul li {
          animation: slideInRight 0.3s ease-out forwards;
          opacity: 0;
        }
        
        .mobile-sidebar nav ul li:nth-child(1) { animation-delay: 0.1s; }
        .mobile-sidebar nav ul li:nth-child(2) { animation-delay: 0.15s; }
        .mobile-sidebar nav ul li:nth-child(3) { animation-delay: 0.2s; }
        .mobile-sidebar nav ul li:nth-child(4) { animation-delay: 0.25s; }
        .mobile-sidebar nav ul li:nth-child(5) { animation-delay: 0.3s; }
      `}</style>
    </>
  );
};

export default ParentSidebar; 