import React from 'react';
import { Link } from 'react-router-dom';
import { Batch } from '../types/batch';
import { useBatchStore } from '../stores/batchStore';

interface BatchCardProps {
  batch: Batch;
}

export const BatchCard: React.FC<BatchCardProps> = ({ batch }) => {
  const { updateBatch } = useBatchStore();

  const getDaysInStage = () => {
    const now = Date.now();
    const startTime = batch.stage === '1F' ? batch.startTime : batch.secondaryStartTime;
    if (!startTime) return 0;
    return Math.floor((now - startTime) / (1000 * 60 * 60 * 24));
  };

  const getStageColor = () => {
    switch (batch.stage) {
      case '1F':
        return 'bg-blue-100 text-blue-800';
      case '2F':
        return 'bg-purple-100 text-purple-800';
      case 'KEGGED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLatestMeasurement = (type: 'ph' | 'temperature' | 'gravity') => {
    if (!batch.measurements || !batch.measurements[type]) return null;
    const measurements = batch.measurements[type];
    if (measurements.length === 0) return null;
    return measurements[measurements.length - 1];
  };

  const handleStageChange = async (newStage: Batch['stage']) => {
    const updates: Partial<Batch> = {
      stage: newStage,
      updatedAt: Date.now(),
    };

    if (newStage === '2F' && batch.stage === '1F') {
      updates.secondaryStartTime = Date.now();
    }

    try {
      await updateBatch(batch.id, updates);
    } catch (error) {
      console.error('Failed to update batch stage:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{batch.name}</h3>
          {batch.description && (
            <p className="text-gray-600 mt-1">{batch.description}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageColor()}`}>
          {batch.stage}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Days in Stage</p>
          <p className="text-lg font-semibold">{getDaysInStage()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Latest pH</p>
          <p className="text-lg font-semibold">
            {getLatestMeasurement('ph')?.value.toFixed(1) || 'N/A'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Temperature</p>
          <p className="text-lg font-semibold">
            {getLatestMeasurement('temperature')?.value.toFixed(1) || 'N/A'}°F
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Gravity</p>
          <p className="text-lg font-semibold">
            {getLatestMeasurement('gravity')?.value.toFixed(3) || 'N/A'}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Link
          to={`/batch/${batch.id}`}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          View Details
        </Link>
        <div className="space-x-2">
          {batch.stage === '1F' && (
            <button
              onClick={() => handleStageChange('2F')}
              className="px-3 py-1 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Move to 2F
            </button>
          )}
          {batch.stage === '2F' && (
            <button
              onClick={() => handleStageChange('KEGGED')}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Move to Keg
            </button>
          )}
        </div>
      </div>
    </div>
  );
}; 