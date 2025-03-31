import React, { useState } from 'react';
import { useBatchStore } from '../stores/batchStore';
import { BatchCard } from '../components/BatchCard';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { CreateBatchForm } from '../components/CreateBatchForm';
import { Batch } from '../types/batch';

const Dashboard: React.FC = () => {
  const { batches, isLoading, error, fetchBatches, createBatch } = useBatchStore();
  const [showCreateForm, setShowCreateForm] = useState(false);

  React.useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleSeedData = async () => {
    const now = Date.now();
    const userId = 'demo-user'; // This should come from the auth service in a real app
    const sampleBatches: Batch[] = [
      {
        id: `batch-${now}-1`,
        name: 'LimeAid Batch #1',
        description: 'First batch of LimeAid flavor',
        createdAt: now,
        updatedAt: now,
        stage: '1F',
        startTime: now,
        measurements: {
          ph: [],
          temperature: []
        },
        checklists: [],
        flavoring: {
          ingredients: ['Lime', 'Mint'],
          addedAt: 0,
          notes: 'Will add in 2F'
        },
        // Batch details
        volume: 20,
        teaType: 'Black Tea',
        sugarAmount: 2,
        starterAmount: 2,
        // Metadata
        createdBy: userId,
        lastModifiedBy: userId,
        notes: 'First batch of LimeAid flavor'
      },
      {
        id: `batch-${now}-2`,
        name: 'POG Batch #1',
        description: 'First batch of POG flavor',
        createdAt: now - 7 * 24 * 60 * 60 * 1000, // 7 days ago
        updatedAt: now,
        stage: '2F',
        startTime: now - 7 * 24 * 60 * 60 * 1000,
        secondaryStartTime: now - 3 * 24 * 60 * 60 * 1000, // 3 days ago
        measurements: {
          ph: [{
            timestamp: now - 3 * 24 * 60 * 60 * 1000,
            value: 3.2,
            notes: 'Taste test: slightly sweet, good acidity'
          }],
          temperature: [{
            timestamp: now - 3 * 24 * 60 * 60 * 1000,
            value: 75,
            notes: 'Room temperature'
          }]
        },
        checklists: [{
          id: 'checklist-1',
          title: 'Initial pH Check',
          tasks: [{
            id: 'task-1',
            title: 'Check pH',
            completed: true,
            completedAt: now - 3 * 24 * 60 * 60 * 1000
          }],
          completed: true
        }],
        flavoring: {
          ingredients: ['Passion Fruit', 'Orange', 'Guava'],
          addedAt: now - 3 * 24 * 60 * 60 * 1000,
          notes: 'Added POG blend in 2F'
        },
        // Batch details
        volume: 5,
        teaType: 'Green Tea',
        sugarAmount: 1.5,
        starterAmount: 1,
        // Metadata
        createdBy: userId,
        lastModifiedBy: userId,
        notes: 'First batch of POG flavor'
      }
    ];

    try {
      for (const batch of sampleBatches) {
        await createBatch(batch);
      }
      await fetchBatches();
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  };

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
          <div className="space-x-4">
            <button
              onClick={handleSeedData}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Add Sample Data
            </button>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              New Batch
            </button>
          </div>
        </div>

        {batches.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No batches yet</h3>
            <p className="mt-2 text-gray-500">
              Start by creating your first batch or add some sample data
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