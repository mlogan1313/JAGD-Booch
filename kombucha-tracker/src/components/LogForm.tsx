import React, { useState } from 'react';
import { useBatchStore } from '../stores/batchStore';

interface LogFormProps {
  batchId: string;
}

export const LogForm: React.FC<LogFormProps> = ({ batchId }) => {
  const { addMeasurement } = useBatchStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    ph: '',
    temperature: '',
    gravity: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (formData.ph) {
        await addMeasurement(batchId, 'ph', parseFloat(formData.ph), formData.notes);
      }
      if (formData.temperature) {
        await addMeasurement(batchId, 'temperature', parseFloat(formData.temperature), formData.notes);
      }
      if (formData.gravity) {
        await addMeasurement(batchId, 'gravity', parseFloat(formData.gravity), formData.notes);
      }

      // Reset form
      setFormData({
        ph: '',
        temperature: '',
        gravity: '',
        notes: '',
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add measurements');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="ph" className="block text-sm font-medium text-gray-700">
            pH
          </label>
          <input
            type="number"
            step="0.1"
            name="ph"
            id="ph"
            value={formData.ph}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="3.5"
          />
        </div>

        <div>
          <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
            Temperature (°F)
          </label>
          <input
            type="number"
            step="0.1"
            name="temperature"
            id="temperature"
            value={formData.temperature}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="75.0"
          />
        </div>

        <div>
          <label htmlFor="gravity" className="block text-sm font-medium text-gray-700">
            Gravity
          </label>
          <input
            type="number"
            step="0.001"
            name="gravity"
            id="gravity"
            value={formData.gravity}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="1.020"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          name="notes"
          id="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Add any observations or notes..."
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || (!formData.ph && !formData.temperature && !formData.gravity)}
          className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
            isSubmitting || (!formData.ph && !formData.temperature && !formData.gravity)
              ? 'bg-blue-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Adding...' : 'Add Measurements'}
        </button>
      </div>
    </form>
  );
}; 