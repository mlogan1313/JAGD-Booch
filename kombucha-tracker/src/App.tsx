import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthCallback } from './pages/auth/callback';

function App() {
  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div>Dashboard (Coming Soon)</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App; 