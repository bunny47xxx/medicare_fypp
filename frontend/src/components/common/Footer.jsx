import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    setIsLoggedIn(Boolean(token && userData));
  }, []);

  const handleSendEmail = () => {
    if (email) {
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`, '_blank');
    }
  };

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  return (
    <footer className="bg-[#344256] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
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
              <span className="text-xl font-bold">Medicare</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Your trusted healthcare partner providing quality medical services and connecting you with the best doctors worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigation('/')}
                  className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  Home
                </button>
              </li>
              {!isLoggedIn && (
                <>
                  <li>
                    <button
                      onClick={() => handleNavigation('/about')}
                      className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                    >
                      About Us
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigation('/services')}
                      className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                    >
                      Services
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigation('/')}
                      className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                    >
                      Doctors
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigation('/contact')}
                      className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                    >
                      Contact
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Specialities */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Specialities</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleNavigation('/')}
                  className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  Cardiology
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/')}
                  className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  Neurology
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/')}
                  className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  Orthopedics
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/')}
                  className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  Pediatrics
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/')}
                  className="text-gray-300 hover:text-cyan-400 transition-colors text-sm"
                >
                  Dermatology
                </button>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm">info@medicare.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  123 Healthcare Ave, Medical District, NY 10001
                </span>
              </div>
              <div className="pt-2">
                <div className="flex space-x-2">
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-cyan-400"
                  />
                  <Button
                    onClick={handleSendEmail}
                    className="bg-cyan-600 hover:bg-cyan-700 flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 MediCare. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <button
                onClick={() => handleNavigation('/')}
                className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
              >
                Privacy Policy
              </button>
              <span className="text-gray-600">|</span>
              <button
                onClick={() => handleNavigation('/')}
                className="text-gray-400 hover:text-cyan-400 transition-colors text-sm"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
