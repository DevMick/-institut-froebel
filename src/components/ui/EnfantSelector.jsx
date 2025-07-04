import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const EnfantSelector = () => {
  const { user, selectedEnfant, setSelectedEnfant } = useAuth();
  if (!user || !user.enfants || user.enfants.length === 0) return null;
  if (user.enfants.length === 1) {
    return (
      <span className="text-sm text-gray-700 font-medium" aria-label="Enfant sélectionné">
        {user.enfants[0].prenom} {user.enfants[0].nom}
      </span>
    );
  }
  return (
    <select
      className="text-sm border border-gray-200 rounded px-2 py-1 focus:ring-emerald-500 focus:border-emerald-500"
      value={selectedEnfant?.id || ''}
      onChange={e => {
        const enfant = user.enfants.find(enf => enf.id === Number(e.target.value));
        if (enfant) setSelectedEnfant(enfant);
      }}
      aria-label="Sélectionner un enfant"
    >
      {user.enfants.map(enf => (
        <option key={enf.id} value={enf.id}>
          {enf.prenom} {enf.nom} ({enf.classe})
        </option>
      ))}
    </select>
  );
};

export default EnfantSelector; 