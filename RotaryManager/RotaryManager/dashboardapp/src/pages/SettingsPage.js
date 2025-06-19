import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';

const SettingsPage = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
      <Sidebar />
      <main className="flex-1 w-full transition-all duration-300 bg-gray-100 min-h-screen overflow-x-hidden">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Paramètres</h1>
            <Link 
              to="/dashboard" 
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <FaArrowLeft className="mr-2" />
              Retour au tableau de bord
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Paramètres du compte</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800">Profil</h3>
                      <p className="text-sm text-gray-600">Gérer vos informations personnelles</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Modifier
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800">Sécurité</h3>
                      <p className="text-sm text-gray-600">Changer votre mot de passe</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Modifier
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Préférences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800">Notifications</h3>
                      <p className="text-sm text-gray-600">Gérer vos préférences de notifications</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Configurer
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-800">Apparence</h3>
                      <p className="text-sm text-gray-600">Personnaliser l'interface</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Personnaliser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage; 