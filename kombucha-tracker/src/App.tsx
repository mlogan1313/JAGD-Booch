import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/index';
import { BatchDetail } from './pages/batch/[id]';
import EquipmentPage from './pages/equipment';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navigation } from './components/Navigation';
import { useAuthStore } from './stores/authStore';
import { BatchService } from './services/batchService';
import { EquipmentService } from './services/equipmentService';

const App: React.FC = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      BatchService.initialize(user.uid);
      EquipmentService.initialize(user.uid);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/batch/:id" element={<ProtectedRoute><BatchDetail /></ProtectedRoute>} />
          <Route path="/equipment" element={<ProtectedRoute><EquipmentPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
};

export default App; 