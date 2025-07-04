import React from 'react';

const TabNavigation = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <nav className="flex flex-wrap justify-center gap-2 md:gap-4 bg-white rounded-full shadow p-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 text-base md:text-lg
            ${activeTab === tab.key
              ? 'bg-emerald-600 text-white shadow-md scale-105'
              : 'bg-gray-100 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-600'}`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};

export default TabNavigation; 