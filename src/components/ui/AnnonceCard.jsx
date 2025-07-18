import React from 'react';
import { formatDate } from '../../utils/dateUtils';

const typeConfig = {
  generale: { color: 'bg-blue-500', label: 'Générale' },
  cantine: { color: 'bg-green-500', label: 'Cantine' },
  activite: { color: 'bg-yellow-500', label: 'Activité' },
  urgent: { color: 'bg-red-500 animate-pulse', label: 'Urgent' },
};

const AnnonceCard = ({ annonce }) => {
  const { titre, contenu, type, datePublication, dateExpiration, createdByName } = annonce;
  const config = typeConfig[type] || typeConfig['generale'];
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm mb-3">
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-xs px-2 py-0.5 rounded-full text-white font-semibold ${config.color}`}>{config.label}</span>
        <span className="font-bold text-gray-800 text-base">{titre}</span>
      </div>
      <div className="text-gray-700 text-sm mb-2">{contenu}</div>
      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
        <span>Par {createdByName}</span>
        <span>•</span>
        <span>Publiée le {formatDate(datePublication)}</span>
        {dateExpiration && <><span>•</span><span>Expire le {formatDate(dateExpiration)}</span></>}
      </div>
    </div>
  );
};

export default AnnonceCard; 