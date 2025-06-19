import React, { useState } from 'react';
import { Search, Grid, List, Download, RefreshCw } from 'lucide-react';
import CotisationCard from './CotisationCard';

const CotisationManager = ({ cotisations, loading, onRefresh, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  const filteredCotisations = cotisations.filter(cotisation => {
    const searchString = searchTerm.toLowerCase();
    return (
      cotisation.membre?.nom?.toLowerCase().includes(searchString) ||
      cotisation.membre?.prenom?.toLowerCase().includes(searchString) ||
      cotisation.mandat?.annee?.toString().includes(searchString)
    );
  });

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleExport = () => {
    // TODO: Implémenter l'export des données
    console.log('Export des données');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Toolbar */}
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={handleSearch}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* View Mode */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-md ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Vue grille"
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-md ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                aria-label="Vue liste"
              >
                <List className="h-5 w-5" />
              </button>
            </div>

            {/* Export */}
            <button
              onClick={handleExport}
              className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
              aria-label="Exporter"
            >
              <Download className="h-5 w-5" />
            </button>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
              aria-label="Rafraîchir"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {filteredCotisations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucune cotisation trouvée</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
            {filteredCotisations.map(cotisation => (
              <CotisationCard
                key={cotisation.id}
                cotisation={cotisation}
                viewMode={viewMode}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CotisationManager; 