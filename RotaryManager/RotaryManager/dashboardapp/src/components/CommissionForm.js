import React, { useState, useEffect } from 'react';
import { Building, Edit, Calendar, Star, CheckCircle } from 'lucide-react';

const CommissionForm = ({ onSubmit, initialData = null, submitLabel = 'Enregistrer', onCancel }) => {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    objectifs: '',
    presidentId: '',
    dateCreation: '',
    estActive: true
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nom: initialData.nom || '',
        description: initialData.description || '',
        objectifs: initialData.objectifs || '',
        presidentId: initialData.presidentId || '',
        dateCreation: initialData.dateCreation ? initialData.dateCreation.slice(0, 10) : '',
        estActive: initialData.estActive ?? true
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom de la commission est requis';
    } else if (formData.nom.trim().length < 3) {
      newErrors.nom = 'Le nom doit contenir au moins 3 caractères';
    }
    
    if (!formData.dateCreation) {
      newErrors.dateCreation = 'La date de création est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onSubmit({
        nom: formData.nom.trim(),
        description: formData.description.trim(),
        objectifs: formData.objectifs.trim(),
        presidentId: formData.presidentId || null,
        dateCreation: formData.dateCreation,
        estActive: formData.estActive
      });
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ name, label, type = "text", placeholder, icon: Icon, required = false, maxLength, className = "" }) => (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        {type === 'textarea' ? (
          <textarea
            name={name}
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleChange}
            maxLength={maxLength}
            rows={3}
            className={`pl-12 pr-4 py-3 border-2 rounded-xl w-full transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-400 resize-none ${
              errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
            required={required}
          />
        ) : (
          <input
            name={name}
            type={type}
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleChange}
            maxLength={maxLength}
            className={`pl-12 pr-4 py-3 border-2 rounded-xl w-full transition-all duration-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-gray-400 ${
              errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
            required={required}
          />
        )}
        {errors[name] && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <span className="w-4 h-4 mr-1">⚠️</span>
            {errors[name]}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 px-8 py-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Building className="mr-3 h-7 w-7" />
          {initialData ? 'Modifier la commission' : 'Nouvelle commission'}
        </h2>
        <p className="text-blue-100 mt-1">
          {initialData ? 'Modifiez les informations de la commission ci-dessous' : 'Créez une nouvelle commission pour votre organisation'}
        </p>
      </div>

      <div className="p-8">
        <div className="space-y-8">
          {/* Section Informations principales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
              <Building className="mr-2 h-5 w-5 text-blue-600" />
              Informations principales
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                name="nom"
                label="Nom de la commission"
                placeholder="Ex: Commission des finances"
                icon={Building}
                required
                maxLength={100}
              />

              <InputField
                name="dateCreation"
                label="Date de création"
                type="date"
                icon={Calendar}
                required
              />

              <div className="md:col-span-2">
                <InputField
                  name="description"
                  label="Description"
                  type="textarea"
                  placeholder="Décrivez le rôle et les missions de cette commission..."
                  icon={Edit}
                  maxLength={500}
                />
              </div>

              <div className="md:col-span-2">
                <InputField
                  name="objectifs"
                  label="Objectifs"
                  type="textarea"
                  placeholder="Listez les objectifs principaux de cette commission..."
                  icon={Star}
                  maxLength={1000}
                />
              </div>
            </div>
          </div>

          {/* Section Statut */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-blue-600" />
              Statut de la commission
            </h3>
            
            <div className="flex items-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
              <input
                type="checkbox"
                id="estActive"
                name="estActive"
                checked={formData.estActive}
                onChange={handleChange}
                className="h-6 w-6 text-green-600 focus:ring-green-500 border-gray-300 rounded-lg transition-all"
              />
              <label htmlFor="estActive" className="ml-4 flex items-center text-gray-700 font-medium">
                <CheckCircle className="h-6 w-6 mr-3 text-green-500" />
                <div>
                  <div className="font-semibold">Commission active</div>
                  <div className="text-sm text-gray-500">Cette commission est actuellement en activité</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200 mt-8">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-100 font-medium"
              disabled={isLoading}
            >
              Annuler
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                {submitLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommissionForm; 