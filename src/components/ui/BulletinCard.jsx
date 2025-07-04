import React from 'react';
import { Download, FileText } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

const BulletinCard = ({ bulletin, onDownload }) => {
  const { trimestre, anneeScolaire, moyenneGenerale, datePublication, nomFichier, estTelechargeable } = bulletin;
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm mb-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <FileText className="text-emerald-600" size={24} />
        <div>
          <div className="font-semibold text-gray-800">Trimestre {trimestre} - {anneeScolaire}</div>
          <div className="text-sm text-gray-600">Moyenne générale : <span className="font-bold text-emerald-600">{moyenneGenerale}/20</span></div>
          <div className="text-xs text-gray-500">Publié le {formatDate(datePublication)}</div>
        </div>
      </div>
      <button
        onClick={() => onDownload(nomFichier)}
        disabled={!estTelechargeable}
        className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg font-semibold flex items-center gap-2 transition disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500"
        aria-label={estTelechargeable ? `Télécharger ${nomFichier}` : 'Non disponible'}
      >
        <Download size={16} />
        {estTelechargeable ? 'Télécharger' : 'Non disponible'}
      </button>
    </div>
  );
};

export default BulletinCard; 