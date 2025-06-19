import React, { useState } from 'react';
import { Edit, Trash2, CheckCircle, AlertCircle, XCircle, Clock, User, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { updateCotisation, deleteCotisation } from '../../api/cotisationService';

const CotisationCard = ({ cotisation, viewMode, onUpdate, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'payee':
        return 'bg-green-100 text-green-800';
      case 'en_retard':
        return 'bg-red-100 text-red-800';
      case 'en_attente':
        return 'bg-yellow-100 text-yellow-800';
      case 'annulee':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'payee':
        return <CheckCircle className="w-5 h-5" />;
      case 'en_retard':
        return <AlertCircle className="w-5 h-5" />;
      case 'en_attente':
        return <Clock className="w-5 h-5" />;
      case 'annulee':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette cotisation ?')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      await deleteCotisation(cotisation.id);
      if (typeof onDelete === 'function') {
        onDelete(cotisation.id);
      }
    } catch (err) {
      setError('Erreur lors de la suppression de la cotisation');
      console.error('Erreur de suppression:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    console.log('handleEdit called with cotisation:', cotisation);
    if (typeof onUpdate === 'function') {
      onUpdate(cotisation);
    } else {
      console.error('onUpdate is not a function');
    }
  };

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  };

  const cardClasses = viewMode === 'grid' 
    ? 'bg-white rounded-lg shadow hover:shadow-md transition-shadow'
    : 'bg-white rounded-lg shadow hover:shadow-md transition-shadow flex items-center';

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {cotisation.membre?.nom} {cotisation.membre?.prenom}
                </h3>
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Mandat {cotisation.mandat?.annee}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {formatMontant(cotisation.montant)}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="p-2 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                aria-label="Modifier"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`p-2 text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md ${
                  isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label="Supprimer"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cardClasses}>
      <div className={viewMode === 'grid' ? 'p-4' : 'p-4 flex-1'}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {cotisation.membre?.nom} {cotisation.membre?.prenom}
            </h3>
            <p className="text-sm text-gray-600">
              Mandat {cotisation.mandat?.annee}
            </p>
          </div>
          <div className={`flex items-center px-2 py-1 rounded-full ${getStatusColor(cotisation.statut)}`}>
            {getStatusIcon(cotisation.statut)}
            <span className="ml-1 text-sm font-medium">
              {cotisation.statut === 'payee' && 'Payée'}
              {cotisation.statut === 'en_retard' && 'En retard'}
              {cotisation.statut === 'en_attente' && 'En attente'}
              {cotisation.statut === 'annulee' && 'Annulée'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Montant</span>
            <span className="font-semibold text-gray-900">{formatMontant(cotisation.montant)}</span>
          </div>
          
          {cotisation.datePaiement && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Date de paiement</span>
              <span className="text-sm text-gray-900">
                {format(new Date(cotisation.datePaiement), 'dd MMMM yyyy', { locale: fr })}
              </span>
            </div>
          )}

          {cotisation.dateEcheance && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Date d'échéance</span>
              <span className="text-sm text-gray-900">
                {format(new Date(cotisation.dateEcheance), 'dd MMMM yyyy', { locale: fr })}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
              isDeleting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Supprimer"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CotisationCard; 