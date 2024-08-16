import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function useRedirectIfAuthenticated() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (isAuthenticated) {
      return navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
}
