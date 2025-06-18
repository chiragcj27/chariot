'use client';
import React from 'react';
import { MainContent } from '../components/MainContent';
import HorseLoader from '../components/HorseLoader';

function App() {
  return (
    <>
      <HorseLoader />
      <main>
        <MainContent />
      </main>
    </>
  );
}

export default App;