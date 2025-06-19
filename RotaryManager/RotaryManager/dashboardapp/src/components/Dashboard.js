import React from 'react';
import { FiUsers, FiCalendar, FiAward, FiList } from 'react-icons/fi';

export default function Dashboard() {
  const stats = [
    { icon: <FiUsers />, label: "Total Membres", value: "150" },
    { icon: <FiCalendar />, label: "Mandats Actifs", value: "3" },
    { icon: <FiAward />, label: "Fonctions", value: "12" },
    { icon: <FiList />, label: "Commissions", value: "8" }
  ];

  return (
    <div className="w-full space-y-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
        <p className="text-gray-600 mt-2">Bienvenue sur votre espace de gestion</p>
      </div>

      {/* Grille de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="bg-white rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0 ml-4">
                <span className="text-blue-600 text-xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cartes d'activité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Carte des dernières activités */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Dernières activités</h2>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">Nouveau membre ajouté</p>
                <p className="text-xs text-gray-500">Il y a 2 heures</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-800 truncate">Commission mise à jour</p>
                <p className="text-xs text-gray-500">Il y a 5 heures</p>
              </div>
            </div>
          </div>
        </div>

        {/* Carte des tâches */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tâches en cours</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center min-w-0 flex-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3 flex-shrink-0"></div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">Mise à jour des mandats</p>
                  <p className="text-xs text-gray-500">En attente</p>
                </div>
              </div>
              <span className="text-xs font-medium text-yellow-600 ml-4 flex-shrink-0">En cours</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center min-w-0 flex-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">Réunion de commission</p>
                  <p className="text-xs text-gray-500">Planifiée</p>
                </div>
              </div>
              <span className="text-xs font-medium text-purple-600 ml-4 flex-shrink-0">À venir</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 