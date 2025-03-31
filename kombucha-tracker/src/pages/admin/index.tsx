import { useState } from 'react';
import { useAuth } from '../../services/auth';
import { BatchService } from '../../services/batchService';
import { EquipmentService } from '../../services/equipmentService';
import { SeedService } from '../../services/seedService';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [seedingStatus, setSeedingStatus] = useState<'idle' | 'seeding' | 'complete' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const handleSeedAllData = async () => {
    if (!user) return;
    
    try {
      setSeedingStatus('seeding');
      setMessage('Seeding all data...');
      
      const seedService = SeedService.getInstance();
      seedService.setUserId(user.uid);
      await seedService.seedSampleData();
      
      setSeedingStatus('complete');
      setMessage('Successfully seeded all data!');
    } catch (error) {
      setSeedingStatus('error');
      setMessage('Error seeding data: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleClearAllData = async () => {
    if (!user) return;
    
    if (!window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }
    
    try {
      setSeedingStatus('seeding');
      setMessage('Clearing all data...');
      
      const seedService = SeedService.getInstance();
      seedService.setUserId(user.uid);
      
      await seedService.clearAllData();
      
      setSeedingStatus('complete');
      setMessage('Successfully cleared all data!');
    } catch (error) {
      setSeedingStatus('error');
      setMessage('Error clearing data: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Admin Page</h1>
        <p>Please sign in to access the admin page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Admin Page</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>
        <div className="space-y-2">
          <p><strong>User ID:</strong> {user.uid}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
          <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Seed Data</h2>
          <div className="space-y-4">
            <button
              onClick={handleSeedAllData}
              disabled={seedingStatus === 'seeding'}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Seed All Data
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Clear Data</h2>
          <div className="space-y-4">
            <button
              onClick={handleClearAllData}
              disabled={seedingStatus === 'seeding'}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mt-4 p-4 rounded ${
          seedingStatus === 'error' ? 'bg-red-100 text-red-700' :
          seedingStatus === 'complete' ? 'bg-green-100 text-green-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}; 