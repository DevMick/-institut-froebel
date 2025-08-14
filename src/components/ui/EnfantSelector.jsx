import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const EnfantSelector = () => {
  const { user, selectedEnfant, setSelectedEnfant } = useAuth();
  if (!user || !user.enfants || user.enfants.length === 0) return null;
  if (user.enfants.length === 1) {
    return (
      <div className="text-sm font-medium" aria-label="Enfant sélectionné">
        <div className="text-white/90">Enfant sélectionné :</div>
        <div className="text-white font-semibold">
          {user.enfants[0].prenom} {user.enfants[0].nom}
        </div>
        <div className="text-white/70 text-xs">
          {user.enfants[0].classe}
        </div>
      </div>
    );
  }
  return (
    <div>
      <div className="text-white/90 text-xs mb-1">Sélectionner un enfant :</div>
      <select
        className="text-sm border border-white/20 bg-white/10 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-white/30 focus:border-white/50 backdrop-blur-sm"
        value={selectedEnfant?.id || ''}
        onChange={e => {
          const enfant = user.enfants.find(enf => enf.id === Number(e.target.value));
          if (enfant) setSelectedEnfant(enfant);
        }}
        aria-label="Sélectionner un enfant"
      >
        {user.enfants.map(enf => (
          <option key={enf.id} value={enf.id} className="text-gray-800 bg-white">
            {enf.prenom} {enf.nom} ({enf.classe})
          </option>
        ))}
      </select>
    </div>
  );
};

export default EnfantSelector; 