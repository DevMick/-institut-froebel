import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../assets/images/Logo.png';
import { FaFacebookF, FaTwitter, FaTelegramPlane, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaChevronUp } from 'react-icons/fa';

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <footer className="bg-[#fff1f1] text-gray-800 pt-16 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center">
              <img src={Logo} alt="Institut Froebel Logo" className="h-14 w-auto" />
            </div>
            <p className="text-sm">
              Ancré dans des valeurs d'excellence et d'innovation pédagogique, l'Institut Froebel se positionne comme une référence éducative à Abidjan depuis plus de 45 ans.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-9 h-9 bg-froebel-green text-white rounded-full flex items-center justify-center hover:bg-froebel-dark transition-colors">
                <FaFacebookF />
              </a>
              <a href="#" className="w-9 h-9 bg-froebel-green text-white rounded-full flex items-center justify-center hover:bg-froebel-dark transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="w-9 h-9 bg-froebel-green text-white rounded-full flex items-center justify-center hover:bg-froebel-dark transition-colors">
                <FaTelegramPlane />
              </a>
            </div>
          </div>

          {/* Column 2: Liens Rapides */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-froebel-green relative pb-2">
              LIENS RAPIDES
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-froebel-green"></span>
            </h3>
            <ul className="space-y-2">
              <li><Link to="/accueil" className="hover:text-froebel-green transition-colors">Accueil</Link></li>
              <li><Link to="/presentation" className="hover:text-froebel-green transition-colors">Présentation</Link></li>
              <li><Link to="/schools" className="hover:text-froebel-green transition-colors">Nos écoles</Link></li>
              <li><Link to="/contact" className="hover:text-froebel-green transition-colors">Contact</Link></li>
              <li><Link to="/actualites" className="hover:text-froebel-green transition-colors">Actualités</Link></li>
            </ul>
          </div>

          {/* Column 3: Nos Programmes */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-froebel-green relative pb-2">
              NOS PROGRAMMES
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-froebel-green"></span>
            </h3>
            <ul className="space-y-4">
              <li>
                <h4 className="font-bold">École Maternelle</h4>
                <p className="text-sm text-gray-600">Épanouissement et découverte</p>
              </li>
              <li>
                <h4 className="font-bold">École Primaire</h4>
                <p className="text-sm text-gray-600">Apprentissage et développement</p>
              </li>
              <li>
                <h4 className="font-bold">Collège</h4>
                <p className="text-sm text-gray-600">Excellence et préparation</p>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-froebel-green relative pb-2">
              CONTACT
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-froebel-green"></span>
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <div className="w-9 h-9 bg-froebel-green text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <h4 className="font-bold">Adresse</h4>
                  <p className="text-sm">06 BP 2597 Abidjan 06<br/>Côte d'Ivoire</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-9 h-9 bg-froebel-green text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <FaPhoneAlt />
                </div>
                <div>
                  <h4 className="font-bold">Téléphone</h4>
                  <p className="text-sm">(225) 27 22 40 00 99<br/>(225) 01 02 90 40 02</p>
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-9 h-9 bg-froebel-green text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <FaEnvelope />
                </div>
                <div>
                  <h4 className="font-bold">Email</h4>
                  <p className="text-sm">info@institutroebel-ci.net</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-300 pt-4 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} École Intl.Institut Froebel - Abidjan | Réalisation - SUPRÊME COMMUNICATION</p>
        </div>
      </div>

      {/* Scroll to top button */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-5 right-5 w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-pink-600 transition-colors"
        >
          <FaChevronUp className="w-6 h-6" />
        </button>
      )}
    </footer>
  );
};

export default Footer; 