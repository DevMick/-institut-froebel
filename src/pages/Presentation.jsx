import React from 'react';
import NotrePedagogie from '../components/NotrePedagogie';
import InstallationsVieScolaire from '../components/InstallationsVieScolaire';

// URL Cloudinary pour la vidéo (optimisée pour le web)
const spotEcoleVideo = 'https://res.cloudinary.com/dntyghmap/video/upload/v1755144106/Spot_Ecole_hrko3u.mp4';

const Presentation = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative w-full h-[320px] md:h-[380px] flex items-center justify-center mb-12">
        <video
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={spotEcoleVideo} type="video/mp4" />
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
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