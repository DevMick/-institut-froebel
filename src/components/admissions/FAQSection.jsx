import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaQuestionCircle, FaSpinner } from 'react-icons/fa';

const FAQSection = () => {
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);



  useEffect(() => {
    loadFAQ();
  }, []);

  const loadFAQ = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/ecoles/2/faq-admissions`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const faqDataFromAPI = Array.isArray(data) ? data : data.data || [];
        setFaqData(faqDataFromAPI);
      } else {
        console.error('Erreur API FAQ:', response.status, response.statusText);
        setFaqData([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la FAQ:', error);
      setFaqData([]);
    } finally {
      setLoading(false);
    }
  };

  const toggle = idx => setOpenIndex(openIndex === idx ? null : idx);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex justify-center items-center py-12">
        <FaSpinner className="animate-spin text-emerald-600 text-3xl" />
        <span className="ml-3 text-lg text-gray-600">Chargement de la FAQ...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 mb-8 flex items-center gap-3">
        <FaQuestionCircle className="text-emerald-500" />
        Questions fréquentes (FAQ Admissions)
      </h2>

      {faqData.length > 0 ? (
        <div className="space-y-4">
          {faqData.map((item, idx) => (
            <div key={item.id || idx} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4">
              <button
                className="w-full flex justify-between items-center text-left font-semibold text-emerald-700 text-lg focus:outline-none hover:text-emerald-800 transition-colors"
                onClick={() => toggle(idx)}
              >
                {item.titre}
                <FaChevronDown className={`ml-2 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === idx && (
                <div className="mt-4 text-gray-700 text-base animate-fade-in p-4 bg-gray-50 rounded-lg border-l-4 border-emerald-500">
                  {item.nom}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FaQuestionCircle className="text-gray-400 text-4xl mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Aucune question fréquente disponible pour le moment.</p>
        </div>
      )}

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
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