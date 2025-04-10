/**
 * Equipment List Component
 */

import React from 'react';
import { Equipment } from '../schemas/batch';
import { useEquipmentStore } from '../stores/equipmentStore';

interface EquipmentListProps {
  equipment: Equipment[];
}

export const EquipmentList: React.FC<EquipmentListProps> = ({ equipment }) => {
  const { updateEquipment, deleteEquipment, setSelectedEquipment } = useEquipmentStore();

  const handleStatusChange = async (id: string, newStatus: Equipment['status']['current']) => {
    await updateEquipment(id, {
      status: {
        current: newStatus,
        lastUpdated: Date.now(),
        currentBatchId: null
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      await deleteEquipment(id);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {equipment.map((item) => (
          <li key={item.id}>
            <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status.current === 'available' ? 'bg-green-100 text-green-800' :
                      item.status.current === 'in_use' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.status.current}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">{item.metadata.name}</h3>
                    <p className="text-sm text-gray-500">{item.metadata.type}</p>
                    <p className="text-sm text-gray-500">Capacity: {item.metadata.capacity} gallons</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={item.status.current}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as Equipment['status']['current'])}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    aria-label={`Status for ${item.metadata.name}`}
                  >
                    <option value="available">Available</option>
                    <option value="in_use">In Use</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="cleaning">Cleaning</option>
                  </select>
                  <button
                    onClick={() => setSelectedEquipment(item)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
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