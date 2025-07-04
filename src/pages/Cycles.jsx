import React from 'react';
import HeaderTulipe from '../components/HeaderTulipe';
import FooterTulipe from '../components/FooterTulipe';
import CyclesFroebel from './CyclesFroebel';
import { FaBookOpen } from 'react-icons/fa';

const Cycles = () => {
  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      <HeaderTulipe />
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12">
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-4 bg-white rounded-full shadow-xl px-8 py-4">
            <FaBookOpen className="text-emerald-600 text-3xl md:text-4xl" />
            <span className="text-3xl md:text-5xl font-extrabold text-emerald-600">Nos Cycles Éducatifs</span>
          </div>
        </div>
        <CyclesFroebel />
      </main>
      <FooterTulipe />
    </div>
  );
};

export default Cycles; 