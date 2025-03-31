/**
 * Equipment Management Page
 */

import React, { useEffect } from 'react';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { EquipmentList } from '../../components/EquipmentList';
import { ContainerList } from '../../components/ContainerList';
import { AddEquipmentForm } from '../../components/AddEquipmentForm';
import { AddContainerForm } from '../../components/AddContainerForm';

const EquipmentPage: React.FC = () => {
  const { 
    equipment, 
    containers, 
    isLoading, 
    error,
    fetchEquipment,
    fetchContainers 
  } = useEquipmentStore();

  useEffect(() => {
    fetchEquipment();
    fetchContainers();
  }, [fetchEquipment, fetchContainers]);

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Equipment Management</h1>
          <div className="space-x-4">
            <AddEquipmentForm />
            <AddContainerForm />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Equipment</h2>
            <EquipmentList equipment={equipment} />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Containers</h2>
            <ContainerList containers={containers} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentPage; 