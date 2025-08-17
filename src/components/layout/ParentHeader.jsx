import React from 'react';
import EnfantSelector from '../ui/EnfantSelector';
import Logo from '../../assets/images/Logo.jpg';

const ParentHeader = ({ title = 'Espace Parents', onMenuClick }) => {
  return (
    <header className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14 shadow-sm">
      <div className="flex items-center gap-2">
        <button
          className="md:hidden mr-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Ouvrir le menu"
          onClick={onMenuClick}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <img src={Logo} alt="Institut Froebel" className="h-8 w-8" />
      </div>
      <span className="text-base font-semibold text-gray-800">{title}</span>
      <div>
        <EnfantSelector />
      </div>
    </header>
  );
};

export default ParentHeader; 