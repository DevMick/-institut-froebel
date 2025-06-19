import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaBuilding, FaCalendarAlt, FaImage } from 'react-icons/fa';

const MemberForm = ({ onSubmit, initialData = null, submitLabel = 'Enregistrer', onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    department: '',
    position: '',
    profilePictureUrl: '',
    joinedDate: '',
    isActive: true
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email || '',
        password: '', // On ne pré-remplit pas le mot de passe pour des raisons de sécurité
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        phoneNumber: initialData.phoneNumber || '',
        department: initialData.department || '',
        position: initialData.position || '',
        profilePictureUrl: initialData.profilePictureUrl || '',
        joinedDate: initialData.joinedDate ? new Date(initialData.joinedDate).toISOString().split('T')[0] : '',
        isActive: initialData.isActive ?? true
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      dto: {
        nom: formData.nom || null,
        description: formData.description || null
      }
    });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow max-w-xl mx-auto">
      <h3 className="text-xl font-bold text-blue-800 mb-4 border-b pb-2">Informations du membre</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaEnvelope className="text-gray-400" />
            </div>
            <input
              name="email"
              type="email"
              placeholder="email@exemple.com" 
              value={formData.email}
              onChange={handleChange}
              className="pl-10 p-2.5 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="col-span-1 md:col-span-2 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="text-gray-400" />
            </div>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 caractères" 
              value={formData.password}
              onChange={handleChange}
              className="pl-10 p-2.5 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-20"
              required={!initialData}
            />
            <button 
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-blue-600 hover:text-blue-800"
              onClick={toggleShowPassword}
            >
              {showPassword ? 'Cacher' : 'Afficher'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Le mot de passe doit contenir au moins 8 caractères.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-gray-400" />
            </div>
            <input
              name="firstName"
              placeholder="Prénom" 
              value={formData.firstName}
              onChange={handleChange}
              className="pl-10 p-2.5 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              maxLength={100}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-gray-400" />
            </div>
            <input
              name="lastName"
              placeholder="Nom" 
              value={formData.lastName}
              onChange={handleChange}
              className="pl-10 p-2.5 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              maxLength={100}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaPhone className="text-gray-400" />
            </div>
            <input
              name="phoneNumber"
              placeholder="0123456789" 
              value={formData.phoneNumber}
              onChange={handleChange}
              className="pl-10 p-2.5 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaBuilding className="text-gray-400" />
            </div>
            <input
              name="department"
              placeholder="Ex: Ressources Humaines" 
              value={formData.department}
              onChange={handleChange}
              className="pl-10 p-2.5 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={100}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaUser className="text-gray-400" />
            </div>
            <input
              name="position"
              placeholder="Ex: Président, Trésorier, etc." 
              value={formData.position}
              onChange={handleChange}
              className="pl-10 p-2.5 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={100}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL de la photo de profil</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaImage className="text-gray-400" />
            </div>
            <input
              name="profilePictureUrl"
              type="url"
              placeholder="https://exemple.com/photo.jpg" 
              value={formData.profilePictureUrl}
              onChange={handleChange}
              className="pl-10 p-2.5 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={200}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date d'adhésion</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaCalendarAlt className="text-gray-400" />
            </div>
            <input
              name="joinedDate"
              type="date" 
              value={formData.joinedDate}
              onChange={handleChange}
              className="pl-10 p-2.5 border rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="col-span-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Membre actif
            </label>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 mt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default MemberForm; 