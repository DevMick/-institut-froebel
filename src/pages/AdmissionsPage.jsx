import React, { useState } from 'react';
import HeaderTulipe from '../components/HeaderTulipe';
import FooterTulipe from '../components/FooterTulipe';
import TabNavigation from '../components/admissions/TabNavigation';
import ConditionsSection from '../components/admissions/ConditionsSection';
import DossiersSection from '../components/admissions/DossiersSection';
import TarifsSection from '../components/admissions/TarifsSection';
import PreInscriptionForm from '../components/admissions/PreInscriptionForm';
import FAQSection from '../components/admissions/FAQSection';

const TABS = [
  { label: 'Conditions d\'admission', key: 'conditions' },
  { label: 'Dossier à fournir', key: 'dossiers' },
  { label: 'Tarifs', key: 'tarifs' },
  { label: 'Pré-inscription en ligne', key: 'preinscription' },
  { label: 'FAQ Admissions', key: 'faq' },
];

const AdmissionsPage = () => {
  const [activeTab, setActiveTab] = useState('conditions');

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <HeaderTulipe />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12">
        {/* Header stylé */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4 bg-white rounded-full shadow-xl px-8 py-4">
            <span className="text-emerald-600 text-3xl md:text-4xl"><i className="fa fa-file-alt" /></span>
            <span className="text-3xl md:text-5xl font-extrabold text-emerald-600">Admissions & Inscriptions</span>
          </div>
        </div>
        <TabNavigation tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-8">
          {activeTab === 'conditions' && <ConditionsSection />}
          {activeTab === 'dossiers' && <DossiersSection />}
          {activeTab === 'tarifs' && <TarifsSection />}
          {activeTab === 'preinscription' && <PreInscriptionForm />}
          {activeTab === 'faq' && <FAQSection />}
        </div>
      </main>
      <FooterTulipe />
    </div>
  );
};

export default AdmissionsPage; 