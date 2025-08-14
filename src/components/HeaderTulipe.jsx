import React, { useState } from 'react';
import Logo from '../assets/images/Logo.png';
import { Link } from 'react-router-dom';

const menuItems = [
  { label: 'Admission & Inscription', href: '/admissions', isRoute: true },
  { label: 'Nos cycles', href: '/cycles', isRoute: true },
  { label: 'Vie scolaire', href: '/vie-scolaire', isRoute: true },
  { label: 'Espace parents', href: '/login', isRoute: true },
];

const HeaderTulipe = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-30">
      <nav className="max-w-6xl mx-auto flex flex-row items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src={Logo} alt="Institut Froebel Logo" className="h-10 w-auto" />
          </Link>
        </div>

        {/* Menu Desktop */}
        <ul className="hidden md:flex flex-row items-center gap-4 md:gap-8 m-0 p-0">
          {menuItems.map((item) => (
            <li key={item.label} className="list-none">
              {item.isRoute ? (
                <Link
                  to={item.href}
                  className="text-gray-700 hover:text-green-600 font-medium px-2 py-1 rounded transition"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  href={item.href}
                  className="text-gray-700 hover:text-green-600 font-medium px-2 py-1 rounded transition"
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        {/* Bouton Hamburger Mobile */}
        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Menu"
        >
          <svg
            className="w-6 h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-2 space-y-1">
            {menuItems.map((item) => (
              <div key={item.label}>
                {item.isRoute ? (
                  <Link
                    to={item.href}
                    className="block px-3 py-3 text-gray-700 hover:text-green-600 hover:bg-gray-50 font-medium rounded transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className="block px-3 py-3 text-gray-700 hover:text-green-600 hover:bg-gray-50 font-medium rounded transition"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderTulipe; 