import React, { useState } from 'react';
import { useBatchStore } from '../stores/batchStore';
import { Batch, FermentationStage } from '../types/batch';

interface CreateBatchFormProps {
  onClose: () => void;
}

/**
 * Form component for creating a new kombucha batch
 * @param onClose - Callback function to close the form
 */
export const CreateBatchForm: React.FC<CreateBatchFormProps> = ({ onClose }) => {
  const { createBatch } = useBatchStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Batch>>({
    name: '',
    description: '',
    stage: '1F',
    volume: 20,
    teaType: 'Black Tea',
    sugarAmount: 2,
    starterAmount: 2,
    measurements: {
      ph: [],
      temperature: []
    },
    checklists: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    startTime: Date.now(),
    createdBy: 'demo-user', // TODO: Get from auth service
    lastModifiedBy: 'demo-user' // TODO: Get from auth service
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!formData.name) {
        throw new Error('Batch name is required');
      }

      const newBatch: Batch = {
        ...formData,
        id: `batch-${Date.now()}`,
      } as Batch;

      await createBatch(newBatch);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'volume' || name === 'sugarAmount' || name === 'starterAmount'
        ? parseFloat(value)
        : value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Batch</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Batch Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="volume" className="block text-sm font-medium text-gray-700">
                Volume (gallons)
              </label>
              <input
                type="number"
                id="volume"
                name="volume"
                value={formData.volume}
                onChange={handleChange}
                min="1"
                step="0.5"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="teaType" className="block text-sm font-medium text-gray-700">
                Tea Type
              </label>
              <select
                id="teaType"
                name="teaType"
                value={formData.teaType}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Black Tea">Black Tea</option>
                <option value="Green Tea">Green Tea</option>
                <option value="Oolong Tea">Oolong Tea</option>
                <option value="White Tea">White Tea</option>
              </select>
            </div>

            <div>
              <label htmlFor="sugarAmount" className="block text-sm font-medium text-gray-700">
                Sugar Amount (cups)
              </label>
              <input
                type="number"
                id="sugarAmount"
                name="sugarAmount"
                value={formData.sugarAmount}
                onChange={handleChange}
                min="0"
                step="0.25"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="starterAmount" className="block text-sm font-medium text-gray-700">
                Starter Amount (cups)
              </label>
              <input
                type="number"
                id="starterAmount"
                name="starterAmount"
                value={formData.starterAmount}
                onChange={handleChange}
                min="0"
                step="0.25"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
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
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 