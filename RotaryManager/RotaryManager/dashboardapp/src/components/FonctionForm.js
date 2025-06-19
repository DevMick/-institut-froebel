import React, { useState } from 'react';

const FonctionForm = ({ onSubmit, submitLabel, onCancel, initialData = null }) => {
  const [nomFonction, setNomFonction] = useState(initialData?.nomFonction || '');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!nomFonction.trim()) {
      setError('Le nom de la fonction est requis');
      return;
    }

    try {
      await onSubmit({ nomFonction: nomFonction.trim() });
      if (!initialData) {
        setNomFonction('');
      }
    } catch (err) {
      setError(err.response?.data || 'Une erreur est survenue lors de la soumission du formulaire');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="nomFonction" className="block text-sm font-medium text-gray-700">
          Nom de la fonction
        </label>
        <input
          type="text"
          id="nomFonction"
          value={nomFonction}
          onChange={(e) => setNomFonction(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Entrez le nom de la fonction"
          maxLength={100}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default FonctionForm; 