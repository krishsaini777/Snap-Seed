import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DetectPage from './pages/DetectPage';
import HistoryPage from './pages/HistoryPage';
import ModelComparePage from './pages/ModelComparePage';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/detect" element={<DetectPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/compare" element={<ModelComparePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
