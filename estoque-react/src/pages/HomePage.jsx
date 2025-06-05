// src/pages/HomePage.jsx
import React from 'react';
import NavBar from '../components/NavBar';
import HeroSection from '../components/HeroSection';
import MenuCards from '../components/MenuCards';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <>
      {/* Barra de navegação */}
      <NavBar />

      {/* Seção principal (banner) */}
      <HeroSection />

      {/* Cards de destaques do cardápio */}
      <MenuCards />

      {/* Rodapé */}
      <Footer />
    </>
  );
}
