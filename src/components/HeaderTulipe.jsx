import React from 'react';
import Logo from '../assets/images/Logo.png';
import { Link } from 'react-router-dom';

const menuItems = [
  { label: 'Admission & Inscription', href: '/admissions', isRoute: true },
  { label: 'Nos cycles', href: '/cycles', isRoute: true },
  { label: 'Vie scolaire', href: '/vie-scolaire', isRoute: true },
  { label: 'Espace parents', href: '/login', isRoute: true },
];

const HeaderTulipe = () => {
  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-30">
      <nav className="max-w-6xl mx-auto flex flex-row items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src={Logo} alt="Institut Froebel Logo" className="h-10 w-auto" />
          </Link>
        </div>
        <ul className="flex flex-row items-center gap-4 md:gap-8 m-0 p-0">
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
      </nav>
    </header>
  );
};

export default HeaderTulipe; 