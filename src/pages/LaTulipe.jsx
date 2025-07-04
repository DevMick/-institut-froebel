import React from 'react';
import HeaderTulipe from '../components/HeaderTulipe';
import FooterTulipe from '../components/FooterTulipe';

const LaTulipe = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <HeaderTulipe />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8">
        {/* Section Vie scolaire */}
        <section id="vie-scolaire" className="mb-16">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Vie scolaire</h2>
          <div className="bg-white rounded-xl shadow p-6 min-h-[120px]" />
        </section>
        {/* Section Admission & Inscription */}
        <section id="admission" className="mb-16">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Admission & Inscription</h2>
          <div className="bg-white rounded-xl shadow p-6 min-h-[120px]" />
        </section>
        {/* Section Espace parents */}
        <section id="parents" className="mb-16">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Espace parents</h2>
          <div className="bg-white rounded-xl shadow p-6 min-h-[120px]" />
        </section>
        {/* Section Nos cycles */}
        <section id="cycles" className="mb-16">
          <h2 className="text-2xl font-bold text-green-700 mb-4">Nos cycles</h2>
          <div className="bg-white rounded-xl shadow p-6 min-h-[120px]" />
        </section>
      </main>
      <FooterTulipe />
    </div>
  );
};

export default LaTulipe; 