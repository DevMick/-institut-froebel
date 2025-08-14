import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../assets/images/Logo.png';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  // Vérifier si l'utilisateur a le rôle SuperAdmin
  const isSuperAdmin = user?.roles?.includes('SuperAdmin');

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-[#fff1f1] shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity">
              <img 
                src={Logo} 
                alt="Institut Froebel Logo" 
                className="h-12 w-auto"
              />
            </Link>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/" 
              className={`px-3 py-2 text-base font-medium transition-colors ${
                isActive('/') 
                  ? 'text-froebel-green border-b-2 border-froebel-green' 
                  : 'text-gray-700 hover:text-froebel-green'
              }`}
            >
              Accueil
            </Link>
            <Link 
              to="/presentation" 
              className={`px-3 py-2 text-base font-medium transition-colors ${
                isActive('/presentation') 
                  ? 'text-froebel-green border-b-2 border-froebel-green' 
                  : 'text-gray-700 hover:text-froebel-green'
              }`}
            >
              Présentation
            </Link>
            {/* Menu déroulant "Nos écoles" */}
            <div className="relative group">
              <button className="px-3 py-2 text-base font-medium text-gray-700 hover:text-froebel-green transition-colors flex items-center">
                Nos écoles
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <Link 
                    to="/vie-scolaire" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-froebel-green"
                  >
                    La Tulipe
                  </Link>
                  <Link 
                    to="/schools/marguerite" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-froebel-green"
                  >
                    La Marguerite
                  </Link>
                  <Link 
                    to="/schools/rose" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-froebel-green"
                  >
                    La Rose
                  </Link>
                  <Link 
                    to="/schools/orchidees" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-froebel-green"
                  >
                    Les Orchidées
                  </Link>
                </div>
              </div>
            </div>
            <Link 
              to="/contact" 
              className={`px-3 py-2 text-base font-medium transition-colors ${
                isActive('/contact') 
                  ? 'text-froebel-green border-b-2 border-froebel-green' 
                  : 'text-gray-700 hover:text-froebel-green'
              }`}
            >
              Contact
            </Link>
            {/* Afficher "Interface Super Admin" seulement si l'utilisateur est connecté et a le rôle SuperAdmin */}
            {isAuthenticated && isSuperAdmin && (
              <Link 
                to="/superadmin" 
                className={`px-3 py-2 text-base font-medium transition-colors ${
                  isActive('/superadmin') 
                    ? 'text-froebel-green border-b-2 border-froebel-green' 
                    : 'text-gray-700 hover:text-froebel-green'
                }`}
              >
                Interface Super Admin
              </Link>
            )}
          </nav>

          {/* Bouton Connexion/Déconnexion */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Bonjour, {user?.prenom} {user?.nom}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="bg-froebel-green text-white px-6 py-3 rounded-md text-base font-medium hover:bg-froebel-dark transition-colors"
              >
                Connexion
              </button>
            )}
          </div>

          {/* Menu Mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-froebel-green focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link to="/" className="block px-3 py-2 text-gray-700 hover:text-froebel-green">Accueil</Link>
              <Link to="/presentation" className="block px-3 py-2 text-gray-700 hover:text-froebel-green">Présentation</Link>
              {/* Section Nos écoles avec sous-menus */}
              <div className="px-3 py-2 text-gray-700 font-medium">Nos écoles</div>
              <Link to="/vie-scolaire" className="block px-6 py-2 text-gray-600 hover:text-froebel-green">La Tulipe</Link>
              <Link to="/schools/marguerite" className="block px-6 py-2 text-gray-600 hover:text-froebel-green">La Marguerite</Link>
              <Link to="/schools/rose" className="block px-6 py-2 text-gray-600 hover:text-froebel-green">La Rose</Link>
              <Link to="/schools/orchidees" className="block px-6 py-2 text-gray-600 hover:text-froebel-green">Les Orchidées</Link>
              <Link to="/contact" className="block px-3 py-2 text-gray-700 hover:text-froebel-green">Contact</Link>
              {/* Afficher "Interface Super Admin" seulement si l'utilisateur est connecté et a le rôle SuperAdmin */}
              {isAuthenticated && isSuperAdmin && (
                <Link to="/superadmin" className="block px-3 py-2 text-gray-700 hover:text-froebel-green">
                  Interface Super Admin
                </Link>
              )}
              {/* Bouton Connexion/Déconnexion mobile */}
              {isAuthenticated ? (
                <div className="px-3 py-2">
                  <div className="text-sm text-gray-600 mb-2">
                    Bonjour, {user?.prenom} {user?.nom}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full text-left bg-froebel-green text-white px-3 py-2 rounded-md text-sm font-medium mt-2 block"
                >
                  Connexion
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 