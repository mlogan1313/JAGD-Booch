import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, error } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('Auth successful, navigating to home');
      navigate('/');
    } else if (error) {
      console.error('Auth error:', error);
      navigate('/auth');
    }
  }, [user, error, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}; 