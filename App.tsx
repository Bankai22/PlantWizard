import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlantInfoPage from './pages/PlantInfoPage';
import PlantHealthPage from './pages/PlantHealthPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/plant-info/:plantName" element={<PlantInfoPage />} />
        <Route path="/plant-health/:plantName" element={<PlantHealthPage />} />
      </Routes>
    </Router>
  );
};

export default App;
