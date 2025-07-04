import React from 'react';
import { FaFolderOpen } from 'react-icons/fa';

const dossiersParClasse = {
  '6ème': [
    "Formulaire d'inscription rempli et signé",
    "Photocopie du Certificat de fin d'études primaires (CEPE)",
    "Photocopie de l'extrait d'acte de naissance",
    "2 photos d'identité récentes",
    "Photocopie du carnet de vaccination",
    "Frais d'inscription (reçu de paiement)"
  ],
  '5ème': [
    "Formulaire d'inscription rempli et signé",
    "Bulletin de la 6ème (photocopie)",
    "Certificat de scolarité de l'année précédente",
    "Photocopie de l'extrait d'acte de naissance",
    "2 photos d'identité récentes",
    "Photocopie du carnet de vaccination",
    "Frais d'inscription (reçu de paiement)"
  ],
  '4ème': [
    "Formulaire d'inscription rempli et signé",
    "Bulletin de la 5ème (photocopie)",
    "Certificat de scolarité de l'année précédente",
    "Photocopie de l'extrait d'acte de naissance",
    "2 photos d'identité récentes",
    "Photocopie du carnet de vaccination",
    "Frais d'inscription (reçu de paiement)"
  ],
  '3ème': [
    "Formulaire d'inscription rempli et signé",
    "Bulletin de la 4ème (photocopie)",
    "Certificat de scolarité de l'année précédente",
    "Photocopie de l'extrait d'acte de naissance",
    "2 photos d'identité récentes",
    "Photocopie du carnet de vaccination",
    "Frais d'inscription (reçu de paiement)"
  ]
};

const classes = ['6ème', '5ème', '4ème', '3ème'];

const DossiersSection = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {classes.map(classe => (
          <div key={classe} className="bg-white rounded-2xl shadow p-6">
            <h4 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
              <FaFolderOpen className="text-emerald-500" />
              Dossier à fournir en {classe}
            </h4>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              {dossiersParClasse[classe].map((piece, i) => (
                <li key={i}>{piece}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DossiersSection; 