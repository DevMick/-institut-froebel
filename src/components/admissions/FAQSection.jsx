import React, { useState } from 'react';
import { FaChevronDown, FaQuestionCircle } from 'react-icons/fa';

const faqData = [
  {
    question: "Quels sont les documents nécessaires pour l'inscription de mon enfant ?",
    answer: "Vous trouverez la liste complète des pièces à fournir dans l'onglet « Dossier à fournir », adaptée à chaque niveau (6ème à 3ème)."
  },
  {
    question: "À quel moment puis-je inscrire mon enfant ?",
    answer: "Les inscriptions sont ouvertes chaque année à partir du mois de mai, jusqu'à épuisement des places disponibles."
  },
  {
    question: "Mon enfant vient d'un autre établissement, peut-il s'inscrire ?",
    answer: "Oui, l'admission est possible sur présentation du dossier scolaire, des bulletins de l'année précédente et après étude du dossier par la direction."
  },
  {
    question: "Y a-t-il un test d'entrée ?",
    answer: "Pour certains niveaux, un entretien ou un test de positionnement peut être demandé afin d'évaluer le niveau de l'élève."
  },
  {
    question: "Les frais d'inscription sont-ils remboursables ?",
    answer: "Non, les frais d'inscription ne sont pas remboursables, sauf cas exceptionnel (déménagement, force majeure, etc.)."
  },
  {
    question: "Proposez-vous des facilités de paiement pour la scolarité ?",
    answer: "Oui, le paiement de la scolarité peut être échelonné en plusieurs tranches. Merci de contacter le service comptabilité pour plus de détails."
  },
  {
    question: "Y a-t-il une cantine et un service de transport ?",
    answer: "Oui, une cantine et un service de transport sont proposés en option. Les tarifs sont disponibles à l'accueil."
  },
  {
    question: "Comment suivre la scolarité de mon enfant ?",
    answer: "Un espace parents en ligne est disponible pour consulter les bulletins, les annonces et échanger avec l'équipe pédagogique."
  },
  {
    question: "Qui contacter pour plus d'informations ?",
    answer: "Vous pouvez contacter le secrétariat de l'établissement par téléphone, email ou via le formulaire de contact sur notre site."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = idx => setOpenIndex(openIndex === idx ? null : idx);

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 mb-8 flex items-center gap-3">
        <FaQuestionCircle className="text-emerald-500" />
        Questions fréquentes (FAQ Admissions)
      </h2>
      <div className="space-y-4">
        {faqData.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow p-4">
            <button
              className="w-full flex justify-between items-center text-left font-semibold text-emerald-700 text-lg focus:outline-none"
              onClick={() => toggle(idx)}
            >
              {item.question}
              <FaChevronDown className={`ml-2 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === idx && (
              <div className="mt-3 text-gray-700 text-base animate-fade-in">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default FAQSection; 