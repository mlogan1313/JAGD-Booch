/**
 * Container List Component
 */

import React from 'react';
import { Container } from '../schemas/batch';
import { useEquipmentStore } from '../stores/equipmentStore';
import { ContainerStatus } from '../types/enums';

interface ContainerListProps {
  containers: Container[];
}

export const ContainerList: React.FC<ContainerListProps> = ({ containers }) => {
  const { updateContainerStatus, selectedContainer, setSelectedContainer } = useEquipmentStore();

  const handleStatusChange = async (containerId: string, newStatus: ContainerStatus) => {
    try {
      await updateContainerStatus(containerId, newStatus);
    } catch (error) {
      console.error('Error updating container status:', error);
    }
  };

  return (
    <div className="space-y-4">
      {containers.map((container) => (
        <div
          key={container.id}
          className={`p-4 rounded-lg border ${
            selectedContainer?.id === container.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white'
          }`}
          onClick={() => setSelectedContainer(container)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{container.metadata.name}</h3>
              <p className="text-sm text-gray-600">
                Type: {container.metadata.type}
                <br />
                Capacity: {container.metadata.capacity}L
              </p>
            </div>
            <select
              value={container.status.current}
              onChange={(e) => handleStatusChange(container.id, e.target.value as ContainerStatus)}
              className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Status for ${container.metadata.name}`}
            >
              <option value={ContainerStatus.EMPTY}>Empty</option>
              <option value={ContainerStatus.FILLED}>Filled</option>
              <option value={ContainerStatus.CLEANING}>Cleaning</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}; 