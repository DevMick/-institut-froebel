import React from 'react';
import { FaMoneyBillWave } from 'react-icons/fa';

const tarifsParClasse = {
  '6ème': {
    inscription: '20 000 FCFA',
    scolarite: '180 000 FCFA',
    autres: [
      'Tenue scolaire : 15 000 FCFA',
      "Frais d'AMOPA : 5 000 FCFA",
      'Assurance : 2 000 FCFA'
    ]
  },
  '5ème': {
    inscription: '20 000 FCFA',
    scolarite: '180 000 FCFA',
    autres: [
      'Tenue scolaire : 15 000 FCFA',
      "Frais d'AMOPA : 5 000 FCFA",
      'Assurance : 2 000 FCFA'
    ]
  },
  '4ème': {
    inscription: '20 000 FCFA',
    scolarite: '185 000 FCFA',
    autres: [
      'Tenue scolaire : 15 000 FCFA',
      "Frais d'AMOPA : 5 000 FCFA",
      'Assurance : 2 000 FCFA'
    ]
  },
  '3ème': {
    inscription: '20 000 FCFA',
    scolarite: '190 000 FCFA',
    autres: [
      'Tenue scolaire : 15 000 FCFA',
      "Frais d'AMOPA : 5 000 FCFA",
      'Assurance : 2 000 FCFA'
    ]
  }
};

const classes = ['6ème', '5ème', '4ème', '3ème'];

const TarifsSection = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {classes.map(classe => (
          <div key={classe} className="bg-white rounded-2xl shadow p-6">
            <h4 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
              <FaMoneyBillWave className="text-emerald-500" />
              Tarifs en {classe}
            </h4>
            <ul className="text-gray-700 space-y-2">
              <li><span className="font-semibold">Frais d'inscription :</span> {tarifsParClasse[classe].inscription}</li>
              <li><span className="font-semibold">Scolarité annuelle :</span> {tarifsParClasse[classe].scolarite}</li>
              {tarifsParClasse[classe].autres.map((autre, i) => (
                <li key={i}>{autre}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TarifsSection; 