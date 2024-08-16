import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/dashboard');
  });
  return <h1>Hello World</h1>;
}

export default App;
