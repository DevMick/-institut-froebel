import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const conditionsParClasse = {
  '6ème': [
    "Dossier scolaire complet",
    "Certificat de fin d'études primaires (CEPE)",
    "Extrait d'acte de naissance",
    "2 photos d'identité",
    "Frais d'inscription"
  ],
  '5ème': [
    "Bulletin de la 6ème",
    "Certificat de scolarité",
    "Extrait d'acte de naissance",
    "2 photos d'identité",
    "Frais d'inscription"
  ],
  '4ème': [
    "Bulletin de la 5ème",
    "Certificat de scolarité",
    "Extrait d'acte de naissance",
    "2 photos d'identité",
    "Frais d'inscription"
  ],
  '3ème': [
    "Bulletin de la 4ème",
    "Certificat de scolarité",
    "Extrait d'acte de naissance",
    "2 photos d'identité",
    "Frais d'inscription"
  ]
};

const classes = ['6ème', '5ème', '4ème', '3ème'];

const ConditionsSection = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {classes.map(classe => (
          <div key={classe} className="bg-white rounded-2xl shadow p-6">
            <h4 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
              <FaCheckCircle className="text-emerald-500" />
              Conditions d'admission en {classe}
            </h4>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              {conditionsParClasse[classe].map((critere, i) => (
                <li key={i}>{critere}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConditionsSection; 