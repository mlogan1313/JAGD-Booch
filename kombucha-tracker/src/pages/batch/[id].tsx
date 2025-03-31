import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBatchStore } from '../../stores/batchStore';
import { BatchCard } from '../../components/BatchCard';
import { LogForm } from '../../components/LogForm';
import { Checklist } from '../../components/Checklist';
import { ProtectedRoute } from '../../components/ProtectedRoute';

export const BatchDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getBatch, batches, isLoading, error } = useBatchStore();

  const batch = id ? getBatch(id) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            {error || 'Batch not found'}
          </div>
          <div className="mt-4 text-center">
            <Link to="/" className="text-blue-600 hover:text-blue-800">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="space-y-8">
          {/* Batch Overview Card */}
          <BatchCard batch={batch} />

          {/* Log Entry Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Add Measurements
            </h2>
            <LogForm batchId={batch.id} />
          </div>

          {/* Checklists */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Checklists</h2>
            {batch.checklists.map(checklist => (
              <Checklist
                key={checklist.id}
                batchId={batch.id}
                checklist={checklist}
              />
            ))}
          </div>

          {/* Batch Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Batch Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Volume</p>
                <p className="text-lg font-semibold">{batch.volume} gallons</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tea Type</p>
                <p className="text-lg font-semibold">{batch.teaType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sugar Amount</p>
                <p className="text-lg font-semibold">{batch.sugarAmount} cups</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Starter Amount</p>
                <p className="text-lg font-semibold">{batch.starterAmount} cups</p>
              </div>
              {batch.flavoring && (
                <>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Flavoring</p>
                    <p className="text-lg font-semibold">
                      {batch.flavoring.ingredients.join(', ')}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Added: {new Date(batch.flavoring.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 