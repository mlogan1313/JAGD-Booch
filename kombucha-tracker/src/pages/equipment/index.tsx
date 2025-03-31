/**
 * Equipment Management Page
 */

import React, { useEffect } from 'react';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { EquipmentList } from '../../components/EquipmentList';
import { ContainerList } from '../../components/ContainerList';
import { AddEquipmentForm } from '../../components/AddEquipmentForm';
import { AddContainerForm } from '../../components/AddContainerForm';
import { useAuth } from '../../services/auth';

const EquipmentPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    equipment, 
    containers, 
    isLoading, 
    error,
    fetchEquipment,
    fetchContainers 
  } = useEquipmentStore();

  useEffect(() => {
    if (user) {
      fetchEquipment();
      fetchContainers();
    }
  }, [user, fetchEquipment, fetchContainers]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Please sign in to view equipment.</div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading equipment...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Equipment</h2>
            <div className="mb-4">
              <AddEquipmentForm />
            </div>
            <EquipmentList equipment={equipment} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Containers</h2>
            <div className="mb-4">
              <AddContainerForm />
            </div>
            <ContainerList containers={containers} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentPage; 