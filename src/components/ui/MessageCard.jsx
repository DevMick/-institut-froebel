import React from 'react';
import { BookOpen, Info, Smile, Heart } from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';

const typeConfig = {
  devoirs: { color: 'text-orange-500', icon: <BookOpen size={20} /> },
  info: { color: 'text-blue-500', icon: <Info size={20} /> },
  comportement: { color: 'text-green-500', icon: <Smile size={20} /> },
  sante: { color: 'text-red-500', icon: <Heart size={20} /> },
};

const MessageCard = ({ message, onMarkLu, loading }) => {
  const { titre, message: contenu, type, luParParent, dateCreation, createdByName, id } = message;
  const config = typeConfig[type] || typeConfig['info'];
  return (
    <div
      className={`relative bg-white border rounded-lg p-4 shadow-sm mb-2 transition-opacity duration-300 ${luParParent ? 'opacity-60' : 'opacity-100'} flex flex-col gap-1`}
      aria-label={`Message ${type}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={config.color}>{config.icon}</span>
        <span className="font-semibold text-gray-800 text-base">{titre}</span>
        {!luParParent && (
          <span className="ml-2 bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full animate-pulse">Non lu</span>
        )}
      </div>
      <div className="text-gray-700 text-sm mb-1">{contenu}</div>
      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
        <span>Par {createdByName}</span>
        <span>•</span>
        <span>{formatDateTime(dateCreation)}</span>
      </div>
      {!luParParent && (
        <button
          onClick={() => onMarkLu(id)}
          disabled={loading}
          className="mt-2 self-end bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1 rounded transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Marquer comme lu"
        >
          {loading ? '...' : 'Marquer comme lu'}
        </button>
      )}
    </div>
  );
};

export default MessageCard; 