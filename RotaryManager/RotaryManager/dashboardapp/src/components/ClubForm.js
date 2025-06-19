import React, { useState, useEffect } from 'react';

const initialState = {
  name: '',
  code: '',
  logoUrl: '',
  description: '',
  address: '',
  city: '',
  country: '',
  phoneNumber: '',
  email: '',
  website: '',
  foundedDate: '',
  isActive: true,
};

const ClubForm = ({ onSubmit, initialData = {}, submitLabel = 'Enregistrer', onCancel }) => {
  const [form, setForm] = useState({ ...initialState, ...initialData });

  // Mettre à jour le formulaire si initialData change
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      // Formater la date correctement si elle existe
      const formattedData = { ...initialData };
      if (formattedData.foundedDate) {
        formattedData.foundedDate = typeof formattedData.foundedDate === 'string' 
          ? formattedData.foundedDate.split('T')[0] 
          : new Date(formattedData.foundedDate).toISOString().split('T')[0];
      }
      
      setForm({ ...initialState, ...formattedData });
      console.log("Formulaire initialisé avec:", formattedData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // S'assurer que tous les champs nécessaires sont inclus
    // et qu'ils ne sont pas envoyés comme chaînes vides si nullables
    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description?.trim() || '',
      address: form.address?.trim() || '',
      city: form.city?.trim() || '',
      country: form.country?.trim() || '',
      phoneNumber: form.phoneNumber?.trim() || '',
      email: form.email?.trim() || '',
      website: form.website?.trim() || '',
      logoUrl: form.logoUrl?.trim() || '',
      foundedDate: form.foundedDate?.trim() ? form.foundedDate : null,
      isActive: form.isActive
    };
    
    // Validation de base côté client
    if (!payload.name) {
      alert("Le nom du club est requis");
      return;
    }
    
    if (!payload.code) {
      alert("Le code du club est requis");
      return;
    }
    
    // Soumettre les données
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow max-w-xl mx-auto">
      <div className="grid grid-cols-2 gap-4">
        <input 
          name="name" 
          placeholder="Nom du club" 
          value={form.name} 
          onChange={handleChange} 
          className="p-2 border rounded" 
          required 
        />
        <input 
          name="code" 
          placeholder="Code" 
          value={form.code} 
          onChange={handleChange} 
          className="p-2 border rounded" 
          required 
        />
        <input 
          name="logoUrl" 
          placeholder="Logo URL" 
          value={form.logoUrl || ''} 
          onChange={handleChange} 
          className="p-2 border rounded" 
        />
        <input 
          name="description" 
          placeholder="Description" 
          value={form.description || ''} 
          onChange={handleChange} 
          className="p-2 border rounded" 
        />
        <input 
          name="address" 
          placeholder="Adresse" 
          value={form.address || ''} 
          onChange={handleChange} 
          className="p-2 border rounded" 
        />
        <input 
          name="city" 
          placeholder="Ville" 
          value={form.city || ''} 
          onChange={handleChange} 
          className="p-2 border rounded" 
        />
        <input 
          name="country" 
          placeholder="Pays" 
          value={form.country || ''} 
          onChange={handleChange} 
          className="p-2 border rounded" 
        />
        <input 
          name="phoneNumber" 
          placeholder="Téléphone" 
          value={form.phoneNumber || ''} 
          onChange={handleChange} 
          className="p-2 border rounded" 
        />
        <input 
          name="email" 
          type="email" 
          placeholder="Email" 
          value={form.email || ''} 
          onChange={handleChange} 
          className="p-2 border rounded" 
        />
        <input 
          name="website" 
          placeholder="Site web" 
          value={form.website || ''} 
          onChange={handleChange} 
          className="p-2 border rounded" 
        />
        <input 
          name="foundedDate" 
          type="date" 
          placeholder="Date de création" 
          value={form.foundedDate?.slice(0,10) || ''} 
          onChange={handleChange} 
          className="p-2 border rounded" 
        />
        <label className="flex items-center space-x-2">
          <input 
            name="isActive" 
            type="checkbox" 
            checked={form.isActive} 
            onChange={handleChange} 
          />
          <span>Actif</span>
        </label>
      </div>
      <div className="flex space-x-2 justify-end">
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Annuler
          </button>
        )}
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ClubForm;