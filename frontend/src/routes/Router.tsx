import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import NotFound from '../pages/NotFound';
import Dashboard from '../pages/Dashboard';
import Game from '../pages/Game';
import SignUp from '../pages/SignUp';
import Login from '../pages/Login';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '@/contexts/AuthContext';

function Router() {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <App />,
      errorElement: <NotFound />,
    },
    {
      path: '/dashboard',
      element: (
        <AuthProvider>
          <ProtectedRoute element={<Dashboard />} />
        </AuthProvider>
      ),
    },
    {
      path: '/games/:gameId',
      element: (
        <AuthProvider>
          <ProtectedRoute element={<Game />} />
        </AuthProvider>
      ),
    },
    {
      path: '/signup',
      element: <SignUp />,
    },
    {
      path: '/login',
      element: (
        <AuthProvider>
          <Login />
        </AuthProvider>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}

export default Router;
