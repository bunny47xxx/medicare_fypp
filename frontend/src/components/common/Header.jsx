import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User as UserIcon, LogOut, ChevronDown } from 'lucide-react';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setShowUserMenu(false);
    handleNavigation('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRolePath = (role) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'doctor':
        return '/doctor';
      default:
        return '/user';
    }
  };

  return (
    <header className="border-b border-cyan-100 bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Name */}
          <button
            onClick={() => handleNavigation('/')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-cyan-700">Medicare</span>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {!isLoggedIn && (
              <>
                <button
                  onClick={() => handleNavigation('/services')}
                  className={`font-medium transition-colors ${
                    window.location.pathname === '/services'
                      ? 'text-cyan-600 border-b-2 border-cyan-600 pb-1'
                      : 'text-gray-700 hover:text-cyan-600'
                  }`}
                >
                  Services
                </button>
                <button
                  onClick={() => handleNavigation('/')}
                  className="text-gray-700 hover:text-cyan-600 font-medium transition-colors"
                >
                  Doctors
                </button>
                <button
                  onClick={() => handleNavigation('/about')}
                  className={`font-medium transition-colors ${
                    window.location.pathname === '/about'
                      ? 'text-cyan-600 border-b-2 border-cyan-600 pb-1'
                      : 'text-gray-700 hover:text-cyan-600'
                  }`}
                >
                  About
                </button>
              </>
            )}
            {isLoggedIn && (
              <button
                onClick={() => handleNavigation(getRolePath(user?.role))}
                className={`font-medium transition-colors ${
                  window.location.pathname === getRolePath(user?.role)
                    ? 'text-cyan-600 border-b-2 border-cyan-600 pb-1'
                    : 'text-gray-700 hover:text-cyan-600'
                }`}
              >
                Dashboard
              </button>
            )}
          </nav>

          {/* Auth Buttons or User Menu */}
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-cyan-50 transition-colors border border-cyan-200 bg-cyan-50"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {getInitials(user?.fullName)}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-[#344256]">
                      {user?.fullName || 'User'}
                    </p>
                    <p className="text-xs text-gray-600 capitalize">
                      {user?.role || 'user'}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600 hidden md:block" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-semibold text-[#344256]">
                          {user?.fullName || 'User'}
                        </p>
                        <p className="text-xs text-gray-600">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          handleNavigation(getRolePath(user?.role));
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-cyan-50 transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>My Dashboard</span>
                      </button>
                      <div className="border-t border-gray-200 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => handleNavigation('/auth/login')}
                  className="text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => handleNavigation('/auth/register')}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-md"
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
