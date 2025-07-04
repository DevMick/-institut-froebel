import React from 'react';
import herosectionpre from '../assets/images/herosectionpre.jpg';
import NotrePedagogie from '../components/NotrePedagogie';
import InstallationsVieScolaire from '../components/InstallationsVieScolaire';

const Presentation = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative w-full h-[320px] md:h-[380px] flex items-center justify-center mb-12">
        <img
          src={herosectionpre}
          alt="Présentation Institut Froebel"
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        />
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="relative z-20 flex flex-col items-center justify-center w-full h-full text-center px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 drop-shadow-lg" style={{ color: '#00A86B' }}>Présentation de l'Institut Froebel</h1>
          <p className="text-white text-lg md:text-2xl font-medium drop-shadow max-w-2xl mx-auto">
            Découvrez notre école, nos valeurs et notre engagement pour l'excellence éducative depuis 1994.
          </p>
        </div>
      </section>
      <NotrePedagogie />
      <InstallationsVieScolaire />
    </div>
  );
};

export default Presentation; 