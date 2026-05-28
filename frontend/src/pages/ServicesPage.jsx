import React from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Video, UserCheck, FileText, Heart, Pill, Stethoscope, Clock, Shield, Star, CheckCircle, Phone, Mail } from 'lucide-react';

export default function ServicesPage() {
  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const mainServices = [
    {
      icon: Calendar,
      title: "Book Appointment",
      description: "Schedule appointments with top doctors at your convenience, anytime and anywhere.",
      features: [
        "Search doctors by specialization or symptom",
        "View available time slots in real-time",
        "Instant appointment confirmation",
        "Easy rescheduling options",
        "Appointment reminders via email/SMS"
      ],
      color: "cyan"
    },
    {
      icon: Video,
      title: "Online Consultation",
      description: "Connect with healthcare professionals through secure video calls from the comfort of your home.",
      features: [
        "HD video & audio quality",
        "Private & encrypted sessions",
        "Digital prescriptions included",
        "24/7 availability",
        "Record consultation for future reference"
      ],
      color: "blue"
    },
    {
      icon: UserCheck,
      title: "Doctor Recommendation",
      description: "Find the right doctor based on your specialty needs and location.",
      features: [
        "Search by specialization",
        "Verified doctor profiles",
        "Experience and qualification details",
        "Location-based search",
        "Consultation fee transparency"
      ],
      color: "green"
    },
    {
      icon: FileText,
      title: "Medical History",
      description: "Access and manage your complete medical records in one secure place.",
      features: [
        "View past appointments",
        "Access consultation notes",
        "Download prescriptions",
        "Lab reports and test results",
        "Secure cloud storage"
      ],
      color: "purple"
    },
    {
      icon: Heart,
      title: "Health Monitoring",
      description: "Track your health metrics and get personalized health insights.",
      features: [
        "Vital signs tracking",
        "Medication reminders",
        "Health reports",
        "Wellness tips",
        "Progress tracking"
      ],
      color: "red"
    },
    {
      icon: Pill,
      title: "Prescription Management",
      description: "Manage your medications and prescriptions efficiently.",
      features: [
        "Digital prescriptions",
        "Medication reminders",
        "Refill requests",
        "Drug interaction alerts",
        "Pharmacy integration"
      ],
      color: "orange"
    }
  ];

  const additionalServices = [
    {
      icon: Stethoscope,
      title: "Emergency Care",
      description: "24/7 emergency consultation services"
    },
    {
      icon: Heart,
      title: "Preventive Care",
      description: "Regular health checkups and screenings"
    },
    {
      icon: FileText,
      title: "Health Insurance",
      description: "Insurance verification and claims"
    }
  ];

  const stats = [
    {
      icon: Clock,
      value: "15min",
      label: "Avg Wait Time",
      color: "cyan"
    },
    {
      icon: Shield,
      value: "100%",
      label: "Secure Platform",
      color: "green"
    },
    {
      icon: Star,
      value: "98%",
      label: "Satisfaction",
      color: "yellow"
    },
    {
      icon: UserCheck,
      value: "1000+",
      label: "Verified Doctors",
      color: "blue"
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      cyan: {
        bg: "bg-cyan-100",
        icon: "text-cyan-600",
        border: "border-cyan-600",
        button: "bg-cyan-600 hover:bg-cyan-700"
      },
      blue: {
        bg: "bg-blue-100",
        icon: "text-blue-600",
        border: "border-blue-600",
        button: "bg-blue-600 hover:bg-blue-700"
      },
      green: {
        bg: "bg-green-100",
        icon: "text-green-600",
        border: "border-green-600",
        button: "bg-green-600 hover:bg-green-700"
      },
      purple: {
        bg: "bg-purple-100",
        icon: "text-purple-600",
        border: "border-purple-600",
        button: "bg-purple-600 hover:bg-purple-700"
      },
      red: {
        bg: "bg-red-100",
        icon: "text-red-600",
        border: "border-red-600",
        button: "bg-red-600 hover:bg-red-700"
      },
      orange: {
        bg: "bg-orange-100",
        icon: "text-orange-600",
        border: "border-orange-600",
        button: "bg-orange-600 hover:bg-orange-700"
      },
      yellow: {
        bg: "bg-yellow-100",
        icon: "text-yellow-600"
      }
    };
    return colors[color] || colors.cyan;
  };

  return (
    <>
      <Header />
      
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-cyan-600 to-blue-600 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Our Healthcare Services
              </h1>
              <p className="text-xl text-cyan-100 mb-8">
                Comprehensive medical care designed to meet all your healthcare needs with convenience and quality.
              </p>
              <Button
                onClick={() => handleNavigation('/auth/register')}
                className="bg-white text-cyan-600 hover:bg-cyan-50 px-8 py-6 text-lg shadow-lg"
              >
                Get Started Today
              </Button>
            </div>
          </div>
        </section>

        {/* Main Services */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-[#344256] mb-4">
                Core Services
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need for comprehensive healthcare management
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mainServices.map((service, index) => {
                const Icon = service.icon;
                const colors = getColorClasses(service.color);
                
                return (
                  <Card key={index} className="hover:shadow-xl transition-shadow duration-300">
                    <CardHeader>
                      <div className={`${colors.bg} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                        <Icon className={`w-8 h-8 ${colors.icon}`} />
                      </div>
                      <CardTitle className="text-2xl">{service.title}</CardTitle>
                      <CardDescription className="text-base">
                        {service.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3 mb-6">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <CheckCircle className={`w-5 h-5 ${colors.icon} mt-0.5 flex-shrink-0`} />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => handleNavigation('/auth/register')}
                        className={`w-full ${colors.button} text-white`}
                      >
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Additional Services */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-4xl font-bold text-[#344256] mb-4">
                Additional Services
              </h2>
              <p className="text-lg text-gray-600">
                More ways we care for your health
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {additionalServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Card key={index} className="text-center">
                    <CardContent className="pt-6">
                      <div className="bg-cyan-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-cyan-600" />
                      </div>
                      <h3 className="text-xl font-bold text-[#344256] mb-2">
                        {service.title}
                      </h3>
                      <p className="text-gray-600">{service.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-r from-cyan-50 to-blue-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const colors = getColorClasses(stat.color);
                
                return (
                  <div key={index} className="text-center">
                    <div className={`${colors.bg} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`w-10 h-10 ${colors.icon}`} />
                    </div>
                    <p className="text-4xl font-bold text-[#344256] mb-2">
                      {stat.value}
                    </p>
                    <p className="text-gray-600 font-medium">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <Card className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-0">
              <CardContent className="py-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Ready to Get Started?
                </h2>
                <p className="text-xl text-cyan-100 mb-8 max-w-2xl mx-auto">
                  Join thousands of satisfied patients who trust us with their healthcare needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => handleNavigation('/auth/register')}
                    className="bg-white text-cyan-600 hover:bg-cyan-50 px-8 py-6 text-lg"
                  >
                    Create Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

