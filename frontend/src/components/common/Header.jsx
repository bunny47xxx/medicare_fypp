import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold hover:text-blue-300">Medicare</Link>
      <nav>
        <Link to="/" className="mr-6 hover:text-blue-300">Home</Link>
        <Link to="/auth/login" className="mr-6 hover:text-blue-300">Login</Link>
        <Link to="/auth/register" className="hover:text-blue-300">Register</Link>
      </nav>
    </header>
  );
}
