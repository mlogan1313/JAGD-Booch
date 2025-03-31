import React, { useState } from 'react';
import { useBatchStore } from '../stores/batchStore';
import { BatchCard } from '../components/BatchCard';
// ProtectedRoute import is likely unused now if this is always rendered within one
// import { ProtectedRoute } from '../components/ProtectedRoute'; 
import { CreateBatchForm } from '../components/CreateBatchForm';
// Batch type import might be unused if only using store data
// import { Batch } from '../types/batch'; 

const Dashboard: React.FC = () => {
  // Only get needed state and actions
  const { batches, isLoading, error } = useBatchStore(); 
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Removed useEffect hook that called fetchBatches
  /*
  React.useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);
  */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading batches...</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Kombucha Batches</h1>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            New Batch
          </button>
        </div>

        {batches.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No batches yet</h3>
            <p className="mt-2 text-gray-500">
              Start by creating your first batch or visit the admin page to seed sample data
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {batches.map((batch) => (
              <BatchCard key={batch.id} batch={batch} />
            ))}
          </div>
        )}

        {showCreateForm && (
          <CreateBatchForm onClose={() => setShowCreateForm(false)} />
        )}
      </div>
    </div>
  );
};

export default Dashboard; 