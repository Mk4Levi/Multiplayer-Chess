import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { logOutUser } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

function LogOutButton() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const logOut = async () => {
    await logOutUser();
    logout();
    navigate('/login');
  };

  return (
    <div className="w-full h-16 flex justify-end items-center pr-4">
      <Button onClick={logOut}>LogOut</Button>
    </div>
  );
}

export default LogOutButton;
