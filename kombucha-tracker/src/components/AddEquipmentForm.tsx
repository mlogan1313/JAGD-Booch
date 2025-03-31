/**
 * Add Equipment Form Component
 */

import React, { useState } from 'react';
import { useEquipmentStore } from '../stores/equipmentStore';
import { Equipment } from '../schemas/batch';

export const AddEquipmentForm: React.FC = () => {
  const { addEquipment } = useEquipmentStore();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Equipment, 'id'>>({
    metadata: {
      name: '',
      type: 'kettle',
      capacity: 0,
      description: '',
      createdBy: '',
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    status: {
      current: 'available',
      lastUpdated: Date.now(),
      currentBatchId: null
    },
    maintenance: {
      lastCleaned: null,
      lastMaintained: null,
      nextMaintenance: null,
      notes: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addEquipment(formData);
      setIsOpen(false);
      setFormData({
        metadata: {
          name: '',
          type: 'kettle',
          capacity: 0,
          description: '',
          createdBy: '',
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        status: {
          current: 'available',
          lastUpdated: Date.now(),
          currentBatchId: null
        },
        maintenance: {
          lastCleaned: null,
          lastMaintained: null,
          nextMaintenance: null,
          notes: ''
        }
      });
    } catch (error) {
      console.error('Error adding equipment:', error);
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
      >
        Add Equipment
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900">Add New Equipment</h3>
              <form onSubmit={handleSubmit} className="mt-2">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.metadata.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, name: e.target.value }
                    })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    title="Equipment Name"
                    placeholder="Enter equipment name"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Type
                  </label>
                  <select
                    value={formData.metadata.type}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, type: e.target.value as Equipment['metadata']['type'] }
                    })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    title="Equipment Type"
                  >
                    <option value="kettle">Kettle</option>
                    <option value="fermenter">Fermenter</option>
                    <option value="keg">Keg</option>
                    <option value="bottle">Bottle</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Capacity (gallons)
                  </label>
                  <input
                    type="number"
                    value={formData.metadata.capacity}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, capacity: Number(e.target.value) }
                    })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                    title="Equipment Capacity"
                    placeholder="Enter capacity in gallons"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.metadata.description}
                    onChange={(e) => setFormData({
                      ...formData,
                      metadata: { ...formData.metadata, description: e.target.value }
                    })}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    title="Equipment Description"
                    placeholder="Enter equipment description"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 