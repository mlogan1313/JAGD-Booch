/**
 * Container List Component
 */

import React from 'react';
import { Container } from '../types/equipment';
import { useEquipmentStore } from '../stores/equipmentStore';

interface ContainerListProps {
  containers: Container[];
}

export const ContainerList: React.FC<ContainerListProps> = ({ containers }) => {
  const { updateContainerStatus, setSelectedContainer } = useEquipmentStore();

  const handleStatusChange = async (id: string, newStatus: Container['status'], batchId?: string) => {
    await updateContainerStatus(id, newStatus, batchId);
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {containers.map((container) => (
          <li key={container.id}>
            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      container.status === 'EMPTY' ? 'bg-green-100 text-green-800' :
                      container.status === 'FILLED' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {container.status}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">{container.name}</h3>
                    <p className="text-sm text-gray-500">Type: {container.type}</p>
                    <p className="text-sm text-gray-500">Capacity: {container.capacity} gallons</p>
                    {container.currentBatchId && (
                      <p className="text-sm text-gray-500">Current Batch: {container.currentBatchId}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={container.status}
                    onChange={(e) => handleStatusChange(container.id, e.target.value as Container['status'])}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    aria-label={`Status for ${container.name}`}
                  >
                    <option value="EMPTY">Empty</option>
                    <option value="FILLED">Filled</option>
                    <option value="CLEANING">Cleaning</option>
                  </select>
                  <button
                    onClick={() => setSelectedContainer(container)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}; 