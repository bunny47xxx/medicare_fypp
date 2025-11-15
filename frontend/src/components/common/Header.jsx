import React from 'react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const handleNavigation = (path) => {
    window.location.href = path;
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
            <button
              onClick={() => handleNavigation('/')}
              className="text-gray-700 hover:text-cyan-600 font-medium transition-colors"
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
              onClick={() => handleNavigation('/')}
              className="text-gray-700 hover:text-cyan-600 font-medium transition-colors"
            >
              About
            </button>
            <button
              onClick={() => handleNavigation('/')}
              className="text-gray-700 hover:text-cyan-600 font-medium transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
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
          </div>
        </div>
      </div>
    </header>
  );
}
