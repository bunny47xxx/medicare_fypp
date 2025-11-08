
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    if ((username === 'admin' || username === 'doctor') && password === '12345') {
      navigate('/admin');
    } else {
      navigate('/patient');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-blue-700">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Username (admin, doctor, or patient)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-700 text-white py-2 rounded hover:bg-blue-800 transition"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
