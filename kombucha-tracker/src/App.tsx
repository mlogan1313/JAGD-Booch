import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/index';
import { BatchDetail } from './pages/batch/[id]';
import EquipmentPage from './pages/equipment';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navigation } from './components/Navigation';
import { useAuth } from './services/auth';
import { BatchService } from './services/batchService';
import { EquipmentService } from './services/equipmentService';
import { AuthCallback } from './pages/auth/callback';
import { AuthPage } from './pages/auth';
import { AdminPage } from './pages/admin';

const App: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      BatchService.getInstance().setUserId(user.uid);
      EquipmentService.getInstance().initialize(user.uid);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100">
      {user && <Navigation />}
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/batch/:id" element={<ProtectedRoute><BatchDetail /></ProtectedRoute>} />
          <Route path="/equipment" element={<ProtectedRoute><EquipmentPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
};

export default App; 