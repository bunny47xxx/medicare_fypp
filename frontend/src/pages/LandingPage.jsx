import Header from "./../components/common/Header.jsx"
import Footer from "./../components/common/Footer.jsx"
import SectionOne from "./../components/common/SectionOne.jsx"
import SectionTwo from "./../components/common/SectionTwo.jsx"


import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, MessageCircle, CheckCircle, Clock } from 'lucide-react';

export default function LandingPage(){

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  return(
    <>
    <Header/>
    {/* HeroSection */}
    <section className="bg-gradient-to-br from-cyan-50 to-blue-50 py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-[#344256] leading-tight">
              Your Health, Our Priority
            </h1>
            
            <h2 className="text-5xl md:text-6xl font-semibold text-cyan-700">
              Book, Consult & Get Care
            </h2>
            
            <p className="text-lg text-gray-600 leading-relaxed">
              Connect with qualified doctors, book appointments instantly, and get personalized medical recommendations all in one platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                onClick={() => handleNavigation('/')}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Appointment
              </Button>
              <Button
                onClick={() => handleNavigation('/')}
                variant="outline"
                className="border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-50 px-8 py-6 text-lg shadow-md"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Quick Chat
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-cyan-600">
                <div className="flex items-center space-x-3">
                  <div className="bg-cyan-100 rounded-full p-2">
                    <CheckCircle className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#344256]">1000+</p>
                    <p className="text-sm text-gray-600">Verified Doctors</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-cyan-500">
                <div className="flex items-center space-x-3">
                  <div className="bg-cyan-100 rounded-full p-2">
                    <Clock className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#344256]">24/7</p>
                    <p className="text-sm text-gray-600">Online Support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image Section */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&h=600&fit=crop"
                alt="Doctor consulting with patient"
                className="w-full h-[500px] object-cover"
              />
              
              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-xl p-4 max-w-xs">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full p-3">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#344256]">Quality Care</p>
                    <p className="text-sm text-gray-600">Trusted by thousands</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-cyan-200 rounded-full opacity-50 blur-2xl"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-200 rounded-full opacity-50 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
    
    <SectionOne/>
    <SectionTwo/>
    {/* HeroSection */}
    <Footer/>
    </>
  )
}


