import React from 'react';
import Hero from '../components/Hero';
import DirectriceMessage from '../components/DirectriceMessage';
import HistoireTimeline from '../components/HistoireTimeline';
import Etablissements from '../components/Etablissements';
import PresentationBienvenue from '../components/PresentationBienvenue';
import CartesInfosAccueil from '../components/CartesInfosAccueil';
import ChiffresCles from '../components/ChiffresCles';
import ActivitesRecentes from '../components/ActivitesRecentes';
import GaleriePhoto from '../components/GaleriePhoto';

const Home = () => {
  return (
    <>
      <Hero />
      <DirectriceMessage />
      <HistoireTimeline />
      <Etablissements />
      <PresentationBienvenue />
      <CartesInfosAccueil />
      <ChiffresCles />
      <ActivitesRecentes />
      <GaleriePhoto />
    </>
  );
};

export default Home; 