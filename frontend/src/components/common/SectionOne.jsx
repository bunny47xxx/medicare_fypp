import React from 'react';
import { Calendar, Video, UserCheck, Clock, Shield, Star } from 'lucide-react';

export default function ServicesSection() {
  const services = [
    {
      icon: Calendar,
      title: "Online Booking",
      description: "Schedule appointments with top doctors at your convenience, anytime and anywhere.",
      features: [
        "Instant appointment confirmation",
        "Real-time doctor availability",
        "Easy rescheduling options"
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
        "Digital prescriptions included"
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
        "Consultation fee transparency"
      ],
      color: "green"
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
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      cyan: {
        bg: "bg-cyan-100",
        icon: "text-cyan-600",
        border: "border-cyan-600"
      },
      blue: {
        bg: "bg-blue-100",
        icon: "text-blue-600",
        border: "border-blue-600"
      },
      green: {
        bg: "bg-green-100",
        icon: "text-green-600",
        border: "border-green-600"
      },
      yellow: {
        bg: "bg-yellow-100",
        icon: "text-yellow-600",
        border: "border-yellow-600"
      }
    };
    return colors[color];
  };

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-[#344256] mb-4">
            Comprehensive Healthcare Services
          </h2>
          <p className="text-lg text-gray-600">
            Experience modern healthcare with our integrated platform designed for your convenience and well-being.
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => {
            const Icon = service.icon;
            const colors = getColorClasses(service.color);
            
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100"
              >
                {/* Icon */}
                <div className={`${colors.bg} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`w-8 h-8 ${colors.icon}`} />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-[#344256] mb-3">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4">
                  {service.description}
                </p>

                {/* Features List */}
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <div className={`${colors.bg} rounded-full p-1 mt-0.5`}>
                        <svg
                          className={`w-3 h-3 ${colors.icon}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
      </div>
    </section>
  );
}
