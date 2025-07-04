import React from 'react';

const FooterTulipe = () => {
  return (
    <footer className="w-full bg-white border-t mt-12 py-6">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
        <span>© {new Date().getFullYear()} La Tulipe – Institut Froebel</span>
        <span className="mt-2 md:mt-0">Tous droits réservés</span>
      </div>
    </footer>
  );
};

export default FooterTulipe; 