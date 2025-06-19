import React, { useState, useEffect } from 'react';

const RegisterForm = ({ onSubmit, clubs = [] }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    clubId: clubs[0]?.id || ''
  });

  useEffect(() => {
    if (clubs.length > 0) {
      setForm((prev) => ({ ...prev, clubId: clubs[0].id }));
    }
  }, [clubs]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-4 bg-white rounded shadow">
      <input name="firstName" placeholder="Prénom" value={form.firstName} onChange={handleChange} className="w-full p-2 border rounded" required />
      <input name="lastName" placeholder="Nom" value={form.lastName} onChange={handleChange} className="w-full p-2 border rounded" required />
      <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full p-2 border rounded" required />
      <input name="password" type="password" placeholder="Mot de passe" value={form.password} onChange={handleChange} className="w-full p-2 border rounded" required />
      <input name="phoneNumber" placeholder="Téléphone" value={form.phoneNumber} onChange={handleChange} className="w-full p-2 border rounded" />
      <select name="clubId" value={form.clubId} onChange={handleChange} className="w-full p-2 border rounded" required>
        {clubs.map((club) => (
          <option key={club.id} value={club.id}>{club.name}</option>
        ))}
      </select>
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">S'inscrire</button>
    </form>
  );
};

export default RegisterForm; 