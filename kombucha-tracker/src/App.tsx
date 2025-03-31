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
import { UserService } from './services/userService';
import { AuthCallback } from './pages/auth/callback';
import { AuthPage } from './pages/auth';
import { AdminPage } from './pages/admin';
import { useBatchStore } from './stores/batchStore';
import { useEquipmentStore } from './stores/equipmentStore';
import { AuthService } from './services/auth';

// Ensure AuthService listener is set up early
AuthService.getInstance();

const App: React.FC = () => {
  console.log("App component rendering...");
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const initializeServicesAndFetch = async (uid: string) => {
      // Initialize Batch Service and set it in the store
      const batchServiceInstance = BatchService.getInstance();
      batchServiceInstance.setUserId(uid);
      useBatchStore.getState().setBatchService(batchServiceInstance);
      // Trigger initial fetch for batches *after* service is set
      console.log('Triggering initial batch fetch...');
      await useBatchStore.getState().fetchBatches(); 

      // Initialize Equipment Service (keep existing init call for now)
      const equipmentServiceInstance = EquipmentService.getInstance();
      equipmentServiceInstance.initialize(uid);
      // Trigger initial fetch for equipment/containers (using store's internal init)
      console.log('Triggering initial equipment/container fetch...');
      // Note: These might fail if service init isn't complete when they run internally
      await useEquipmentStore.getState().fetchEquipment();
      await useEquipmentStore.getState().fetchContainers();

      // TODO: Initialize and set other services/stores as needed (QualityService?)
    };

    const clearServices = () => {
       // Clear services from stores on logout
       useBatchStore.getState().setBatchService(null);
       // TODO: Clear other stores data on logout
       // useBatchStore.getState().setState({ batches: [], error: null }); // Example
       // useEquipmentStore.getState().setState({ equipment: [], containers: [], error: null }); // Example
    };

    if (user) {
      initializeServicesAndFetch(user.uid);
    } else {
      clearServices();
    }
  }, [user]);

  // Display loading indicator while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Loading authentication...</p> 
      </div>
    );
  }

  // Render the main app content once loading is complete
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