'use client';
import React from 'react';
import { Header } from '../components/Header';
import { MainContent } from '../components/MainContent';

function App() {
  return (
    <div className="min-h-screen bg-cream text-navy-900">
      <Header />
      <MainContent />
    </div>
  );
}

export default App;