import React, { useState } from 'react';
import { BookOpen, Info, Smile, Heart, Clock, User, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

const typeConfig = {
  devoirs: { 
    color: 'text-orange-500', 
    bgColor: 'bg-orange-50', 
    borderColor: 'border-orange-200',
    icon: <BookOpen size={20} />, 
    label: 'Devoirs' 
  },
  travail: { 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-50', 
    borderColor: 'border-blue-200',
    icon: <BookOpen size={20} />, 
    label: 'Travail' 
  },
  info: { 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-50', 
    borderColor: 'border-blue-200',
    icon: <Info size={20} />, 
    label: 'Information' 
  },
  information: { 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-50', 
    borderColor: 'border-blue-200',
    icon: <Info size={20} />, 
    label: 'Information' 
  },
  comportement: { 
    color: 'text-green-500', 
    bgColor: 'bg-green-50', 
    borderColor: 'border-green-200',
    icon: <Smile size={20} />, 
    label: 'Comportement' 
  },
  sante: { 
    color: 'text-red-500', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-200',
    icon: <Heart size={20} />, 
    label: 'Santé' 
  },
  urgent: { 
    color: 'text-red-600', 
    bgColor: 'bg-red-50', 
    borderColor: 'border-red-300',
    icon: <Info size={20} />, 
    label: 'Urgent' 
  },
};

const EnhancedMessageCard = ({ message, onMarkLu, loading }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { titre, message: contenu, type, luParParent, dateCreation, createdByName, createdByNom, id } = message;
  const config = typeConfig[type] || typeConfig['info'];
  const authorName = createdByName || createdByNom || 'Enseignant';

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Tronquer le message si trop long
  const shouldTruncate = contenu && contenu.length > 150;
  const displayMessage = shouldTruncate && !isExpanded 
    ? contenu.substring(0, 150) + '...' 
    : contenu;

  return (
    <div className={`
      relative bg-white border-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-200
      ${luParParent ? 'opacity-75' : 'opacity-100'}
      ${config.borderColor}
      ${!luParParent ? 'ring-2 ring-orange-100' : ''}
    `}>
      {/* En-tête du message */}
      <div className={`${config.bgColor} px-4 py-3 rounded-t-xl border-b ${config.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${config.color} p-2 bg-white rounded-lg shadow-sm`}>
              {config.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">{titre}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={14} />
                <span>{authorName}</span>
                <span>•</span>
                <Clock size={14} />
                <span>{formatDate(dateCreation)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Badge de type */}
            <span className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${config.color} ${config.bgColor} border ${config.borderColor}
            `}>
              {config.label}
            </span>
            
            {/* Statut de lecture */}
            {!luParParent ? (
              <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                Non lu
              </span>
            ) : (
              <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium">
                Lu
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Contenu du message */}
      <div className="p-4">
        <div className="text-gray-700 leading-relaxed">
          {displayMessage}
        </div>
        
        {/* Bouton pour développer/réduire */}
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} />
                Voir moins
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                Voir plus
              </>
            )}
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Message #{id}
          </div>
          
          {!luParParent && (
            <button
              onClick={() => onMarkLu(id)}
              disabled={loading}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                ${loading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md'
                }
              `}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  Marquage...
                </>
              ) : (
                <>
                  <Eye size={16} />
                  Marquer comme lu
                </>
              )}
            </button>
          )}
          
          {luParParent && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <EyeOff size={16} />
              Message lu
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedMessageCard;
