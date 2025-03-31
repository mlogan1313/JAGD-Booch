import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth';

export const AuthCallback = () => {
  const { handleCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    console.log('Auth callback received code:', code);

    if (code) {
      handleCallback(code)
        .then(() => {
          console.log('Auth callback successful, navigating to home');
          navigate('/');
        })
        .catch((error) => {
          console.error('Auth callback failed:', error);
          navigate('/');
        });
    } else {
      console.log('No code received, navigating to home');
      navigate('/');
    }
  }, [handleCallback, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}; 