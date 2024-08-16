import { Navigate } from 'react-router-dom';
import { useState } from 'react';
import LogOutButton from '@/components/LogOutButton';
import { useAuth } from '@/contexts/AuthContext';
import Progress from '@/components/ui/progress';

function ProtectedRoute({ element }: { element: JSX.Element }) {
  const { isAuthenticated, loading } = useAuth();
  const [progress] = useState(90);

  if (loading) {
    return (
      <div className="h-2/5 flex justify-center items-center">
        <Progress value={progress} className="w-[60%]" />
      </div>
    );
  }

  if (!isAuthenticated && !loading) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <LogOutButton />
      {element}
    </>
  );
}

export default ProtectedRoute;
