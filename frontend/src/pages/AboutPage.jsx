import React from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Users, Target, Award, Shield, Clock, CheckCircle, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const values = [
    {
      icon: Heart,
      title: "Patient-Centered Care",
      description: "Your health and well-being are at the heart of everything we do."
    },
    {
      icon: Shield,
      title: "Trust & Security",
      description: "We prioritize the security and privacy of your medical information."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to providing the highest quality healthcare services."
    },
    {
      icon: Users,
      title: "Accessibility",
      description: "Making quality healthcare accessible to everyone, everywhere."
    }
  ];

  const milestones = [
    {
      year: "2020",
      title: "Founded",
      description: "Started with a vision to revolutionize healthcare access"
    },
    {
      year: "2021",
      title: "1000+ Doctors",
      description: "Reached milestone of 1000 verified healthcare professionals"
    },
    {
      year: "2022",
      title: "50K+ Patients",
      description: "Served over 50,000 patients across the country"
    },
    {
      year: "2024",
      title: "Award Winner",
      description: "Recognized as Best Healthcare Platform of the Year"
    }
  ];


  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-cyan-600 to-blue-600 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                About MediCare
              </h1>
              <p className="text-xl text-cyan-100">
                Transforming healthcare delivery through innovation, compassion, and technology
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-[#344256] mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                  At MediCare, we believe that quality healthcare should be accessible, convenient, and personalized. 
                  Our mission is to bridge the gap between patients and healthcare providers through innovative 
                  technology and compassionate care.
                </p>
                <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                  We are committed to making healthcare more accessible by connecting patients with qualified doctors, 
                  enabling virtual consultations, and providing comprehensive health management tools—all in one secure platform.
                </p>
                <Button
                  onClick={() => handleNavigation('/services')}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white mt-4"
                >
                  Explore Our Services
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-cyan-100 rounded-full p-3">
                        <Target className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#344256]">Our Vision</h3>
                        <p className="text-gray-600 text-sm">
                          To become the leading healthcare platform that empowers individuals to take control of their health
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 rounded-full p-3">
                        <Heart className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#344256]">Our Promise</h3>
                        <p className="text-gray-600 text-sm">
                          To provide reliable, secure, and compassionate healthcare services to every patient
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-100 rounded-full p-3">
                        <Users className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#344256]">Our Commitment</h3>
                        <p className="text-gray-600 text-sm">
                          Continuous innovation and improvement to serve our community better
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-4xl font-bold text-[#344256] mb-4">
                Our Core Values
              </h2>
              <p className="text-lg text-gray-600">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-cyan-600" />
                      </div>
                      <h3 className="text-xl font-bold text-[#344256] mb-2">
                        {value.title}
                      </h3>
                      <p className="text-gray-600">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Milestones Section */}
        <section className="py-16 bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-4xl font-bold text-[#344256] mb-4">
                Our Journey
              </h2>
              <p className="text-lg text-gray-600">
                Key milestones in our growth and development
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {milestones.map((milestone, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold text-cyan-600 mb-2">
                      {milestone.year}
                    </div>
                    <h3 className="text-xl font-semibold text-[#344256] mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {milestone.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-4xl font-bold text-[#344256] mb-4">
                Why Choose MediCare?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                "1000+ Verified Doctors",
                "24/7 Online Support",
                "Secure & Private",
                "Easy Appointment Booking",
                "Digital Prescriptions",
                "Comprehensive Medical Records"
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <span className="text-lg text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Card className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-0">
              <CardContent className="py-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Join Us on Our Mission
                </h2>
                <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
                  Experience the future of healthcare today
                </p>
                <Button
                  onClick={() => handleNavigation('/auth/register')}
                  className="bg-white text-cyan-600 hover:bg-cyan-50 px-8 py-6 text-lg"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

