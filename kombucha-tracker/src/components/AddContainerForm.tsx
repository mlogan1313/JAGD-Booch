/**
 * Add Container Form Component
 */

import React, { useState } from 'react';
import { useEquipmentStore } from '../stores/equipmentStore';
import { ContainerType, ContainerStatus } from '../types/enums';
import { useAuth } from '../services/auth';

interface AddContainerFormProps {
  onClose: () => void;
}

export const AddContainerForm: React.FC<AddContainerFormProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { addContainer } = useEquipmentStore();
  const [formData, setFormData] = useState({
    name: '',
    type: ContainerType.BOTTLE,
    capacity: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addContainer({
        metadata: {
          name: formData.name,
          type: formData.type,
          capacity: parseFloat(formData.capacity),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          createdBy: user.uid
        },
        status: {
          current: ContainerStatus.EMPTY,
          lastUpdated: Date.now(),
          currentBatchId: null,
          fillDate: null,
          emptyDate: Date.now()
        }
      });
      onClose();
    } catch (error) {
      console.error('Error adding container:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Type
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as ContainerType })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value={ContainerType.BOTTLE}>Bottle</option>
          <option value={ContainerType.KEG}>Keg</option>
        </select>
      </div>

      <div>
        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
          Capacity (L)
        </label>
        <input
          type="number"
          id="capacity"
          value={formData.capacity}
          onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
          min="0"
          step="0.1"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Container
        </button>
      </div>
    </form>
  );
}; 