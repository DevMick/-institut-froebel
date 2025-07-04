import React from 'react';
import { FaCrown, FaPhoneAlt } from 'react-icons/fa';
import DirectriceImg from '../assets/images/directrice.png';

const DirectriceMessage = () => {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row gap-8">
        {/* Colonne gauche : photo + infos */}
        <div className="md:w-1/3 flex flex-col items-center bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-400 relative">
          <img
            src={DirectriceImg}
            alt="Directrice Centrale"
            className="w-32 h-32 object-cover rounded-full shadow-md border-4 border-white mb-4"
          />
          <h3 className="text-lg font-bold text-gray-900 text-center">KADIO Dyana Roselyne</h3>
          <p className="text-green-600 text-center mb-4">Directrice Centrale</p>
          <div className="w-full bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-600">Expérience</span>
              <span className="text-green-700 font-bold">50+ ans</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-600">Élèves</span>
              <span className="text-green-700 font-bold">1700+</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-600">École</span>
              <span className="text-green-700 font-bold">4 écoles</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-gray-600">Contact</span>
              <span className="text-green-700 font-bold">21 26 02 70</span>
            </div>
          </div>
          <span className="absolute top-4 right-4 bg-yellow-400 text-white rounded-full p-1 shadow"><FaCrown /></span>
        </div>
        {/* Colonne droite : message */}
        <div className="md:w-2/3 bg-green-50 rounded-xl shadow-lg p-8 flex flex-col justify-between">
          <h2 className="text-2xl md:text-3xl font-extrabold text-green-700 mb-2 text-center md:text-left">MOT DE LA DIRECTRICE CENTRALE</h2>
          <p className="italic text-gray-600 text-center md:text-left mb-4">Chers parents, chers partenaires de l'éducation</p>
          <div className="text-gray-700 space-y-4 mb-4">
            <p>Depuis plus de cinq décennies, l'Institut Froebel s'est imposé comme une référence éducative à Abidjan. Fidèle à la vision de sa fondatrice, Madame Marguerite Kadio, notre établissement s'est bâti sur une pédagogie centrée sur l'épanouissement de l'enfant, l'excellence académique et le respect des valeurs humaines.</p>
            <p>Aujourd'hui, avec plus de 1 700 élèves répartis sur quatre sites, nous poursuivons notre mission avec passion et engagement : offrir une éducation intégrale, dans un cadre sécurisé, dynamique et bienveillant.</p>
            <p>Que vous soyez parents d'un tout-petit ou d'un adolescent, nous vous invitons à découvrir cet établissement où chaque enfant est accompagné avec attention, rigueur et amour du savoir.</p>
          </div>
          <blockquote className="bg-white border-l-4 border-green-400 p-4 italic font-semibold text-green-800 mb-6">
            Bienvenue à l'Institut Froebel. Ensemble, faisons fleurir l'avenir de nos enfants.
          </blockquote>
          <div className="text-right mt-4">
            <span className="font-bold text-gray-900">KADIO Dyana Roselyne</span><br />
            <span className="text-green-600 font-semibold">Directrice Centrale - Institut Froebel</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DirectriceMessage; 