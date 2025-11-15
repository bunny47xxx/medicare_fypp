import React from 'react';
import { Search, CalendarCheck, Video, Heart } from 'lucide-react';

export default function HowItWorksSection() {
  const steps = [
    {
      icon: Search,
      number: "01",
      title: "Search & Find",
      description: "Browse through our extensive network of verified doctors and specialists. Filter by specialty, location, availability, and patient ratings to find the perfect match for your needs.",
      color: "cyan"
    },
    {
      icon: CalendarCheck,
      number: "02",
      title: "Book Appointment",
      description: "Select your preferred date and time slot with instant confirmation. Choose between in-person visits or online consultations based on your convenience and comfort.",
      color: "blue"
    },
    {
      icon: Video,
      number: "03",
      title: "Consult Online",
      description: "Connect with your doctor through secure video calls. Discuss your health concerns, receive professional diagnosis, and get digital prescriptions delivered instantly.",
      color: "green"
    },
    {
      icon: Heart,
      number: "04",
      title: "Follow-Up Care",
      description: "Access your medical records, prescriptions, and treatment plans anytime. Schedule follow-up appointments and stay connected with your healthcare provider for continuous care.",
      color: "purple"
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      cyan: {
        bg: "bg-cyan-100",
        icon: "text-cyan-600",
        gradient: "from-cyan-500 to-cyan-600",
        border: "border-cyan-200"
      },
      blue: {
        bg: "bg-blue-100",
        icon: "text-blue-600",
        gradient: "from-blue-500 to-blue-600",
        border: "border-blue-200"
      },
      green: {
        bg: "bg-green-100",
        icon: "text-green-600",
        gradient: "from-green-500 to-green-600",
        border: "border-green-200"
      },
      purple: {
        bg: "bg-purple-100",
        icon: "text-purple-600",
        gradient: "from-purple-500 to-purple-600",
        border: "border-purple-200"
      }
    };
    return colors[color];
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-cyan-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-[#344256] mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600">
            Getting quality healthcare has never been easier. Follow these simple steps to start your journey with us.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const colors = getColorClasses(step.color);
            
            return (
              <div
                key={index}
                className="relative group"
              >
                {/* Connecting Line (hidden on mobile and last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[calc(50%+2rem)] w-full h-0.5 bg-gradient-to-r from-cyan-300 to-transparent z-0"></div>
                )}

                {/* Card */}
                <div className="relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 group-hover:-translate-y-2 z-10">
                  {/* Number Badge */}
                  <div className={`absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br ${colors.gradient} rounded-full flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-lg">{step.number}</span>
                  </div>

                  {/* Icon */}
                  <div className={`${colors.bg} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-8 h-8 ${colors.icon}`} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-[#344256] mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
