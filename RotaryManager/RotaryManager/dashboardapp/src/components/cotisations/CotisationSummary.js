import React from 'react';
import { TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const CotisationSummary = ({ cotisations }) => {
  const calculateStats = () => {
    const total = cotisations.length;
    const payees = cotisations.filter(c => c.statut === 'payee').length;
    const enRetard = cotisations.filter(c => c.statut === 'en_retard').length;
    const enAttente = cotisations.filter(c => c.statut === 'en_attente').length;
    
    const totalMontant = cotisations.reduce((sum, c) => sum + c.montant, 0);
    const montantPaye = cotisations
      .filter(c => c.statut === 'payee')
      .reduce((sum, c) => sum + c.montant, 0);
    const montantEnRetard = cotisations
      .filter(c => c.statut === 'en_retard')
      .reduce((sum, c) => sum + c.montant, 0);
    const montantEnAttente = cotisations
      .filter(c => c.statut === 'en_attente')
      .reduce((sum, c) => sum + c.montant, 0);

    const tauxRecouvrement = total > 0 ? (payees / total) * 100 : 0;

    return {
      total,
      payees,
      enRetard,
      enAttente,
      totalMontant,
      montantPaye,
      montantEnRetard,
      montantEnAttente,
      tauxRecouvrement
    };
  };

  const stats = calculateStats();

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(montant);
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Résumé des Cotisations</h2>
      
      <div className="space-y-4">
        <StatCard
          title="Total des Cotisations"
          value={stats.total}
          icon={TrendingUp}
          color="bg-blue-500"
        />
        
       
        
        
       
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-4">Montants</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total</span>
            <span className="font-semibold text-gray-900">{formatMontant(stats.totalMontant)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Payé</span>
            <span className="font-semibold text-green-600">{formatMontant(stats.montantPaye)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">En retard</span>
            <span className="font-semibold text-red-600">{formatMontant(stats.montantEnRetard)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">En attente</span>
            <span className="font-semibold text-yellow-600">{formatMontant(stats.montantEnAttente)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">

        

        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                {stats.tauxRecouvrement.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
            <div
              style={{ width: `${stats.tauxRecouvrement}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CotisationSummary; 