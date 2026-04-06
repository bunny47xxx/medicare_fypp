import React, { useState } from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would make an API call to send the message
    console.log('Form submitted:', formData);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+1 (555) 123-4567", "+1 (555) 123-4568"],
      color: "cyan"
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@medicare.com", "support@medicare.com"],
      color: "blue"
    },
    {
      icon: MapPin,
      title: "Address",
      details: ["123 Healthcare Ave", "Medical District, NY 10001", "United States"],
      color: "green"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Monday - Friday: 9:00 AM - 6:00 PM", "Saturday: 10:00 AM - 4:00 PM", "Sunday: Closed"],
      color: "purple"
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
      purple: {
        bg: "bg-purple-100",
        icon: "text-purple-600",
        border: "border-purple-600"
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
                Get in Touch
              </h1>
              <p className="text-xl text-cyan-100">
                We're here to help. Reach out to us with any questions or concerns.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form and Info */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">Send us a Message</CardTitle>
                    <CardDescription>
                      Fill out the form below and we'll get back to you as soon as possible
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isSubmitted ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-[#344256] mb-2">
                          Message Sent!
                        </h3>
                        <p className="text-gray-600">
                          Thank you for contacting us. We'll get back to you within 24 hours.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            placeholder="John Doe"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="john@example.com"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+1 (555) 123-4567"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="subject">Subject *</Label>
                          <Input
                            id="subject"
                            name="subject"
                            type="text"
                            value={formData.subject}
                            onChange={handleInputChange}
                            required
                            placeholder="What is this regarding?"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="message">Message *</Label>
                          <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                            rows="5"
                            placeholder="Tell us how we can help..."
                            className="w-full mt-1 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:ring-cyan-500 focus:border-cyan-500"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  const colors = getColorClasses(info.color);
                  
                  return (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-start space-x-4">
                          <div className={`${colors.bg} rounded-lg p-3 flex-shrink-0`}>
                            <Icon className={`w-6 h-6 ${colors.icon}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#344256] mb-2">
                              {info.title}
                            </h3>
                            <div className="space-y-1">
                              {info.details.map((detail, idx) => (
                                <p key={idx} className="text-gray-600 text-sm">
                                  {detail}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Quick Actions */}
                <Card className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-0">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-xl mb-3">
                      Need Immediate Assistance?
                    </h3>
                    <p className="text-cyan-100 mb-4">
                      For urgent medical concerns, please call our emergency line or visit your nearest emergency room.
                    </p>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full border-2 border-white text-white hover:bg-white/10"
                        onClick={() => window.location.href = 'tel:+15551234567'}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Emergency Line
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-2 border-white text-white hover:bg-white/10"
                        onClick={() => handleNavigation('/auth/login')}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat with Support
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-4xl font-bold text-[#344256] mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600">
                Quick answers to common questions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                {
                  q: "How do I book an appointment?",
                  a: "You can book an appointment through our online platform by searching for a doctor and selecting an available time slot."
                },
                {
                  q: "Is online consultation secure?",
                  a: "Yes, all our online consultations are encrypted and HIPAA compliant to ensure your privacy and security."
                },
                {
                  q: "Can I cancel or reschedule?",
                  a: "Absolutely! You can cancel or reschedule your appointment up to 24 hours before the scheduled time."
                },
                {
                  q: "Do you accept insurance?",
                  a: "We work with most major insurance providers. Please contact us to verify your coverage."
                }
              ].map((faq, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-[#344256] mb-2">
                      {faq.q}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {faq.a}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

