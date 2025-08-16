import React from 'react';

const ChiffresCles = () => {
  return (
    <section className="bg-green-600 py-12 text-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-extrabold mb-2 tracking-wide">INSTITUT FROEBEL</h2>
        <p className="text-lg mb-8 opacity-90">Excellence dans l'instruction, l'éducation de nos valeurs et l'orientation. Valorisation des aptitudes et talents de chacun de nos élèves</p>
        <div className="flex flex-col md:flex-row justify-center gap-8">
          <div>
            <div className="text-4xl font-bold">49</div>
            <div className="text-base mt-2 opacity-80">Années d'Excellence</div>
          </div>
          <div>
            <div className="text-4xl font-bold">1 715</div>
            <div className="text-base mt-2 opacity-80">Élèves Actuels</div>
          </div>
          <div>
            <div className="text-4xl font-bold">131</div>
            <div className="text-base mt-2 opacity-80">Collaborateurs</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChiffresCles; 