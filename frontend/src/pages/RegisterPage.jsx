import React, { useState } from 'react';
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Stethoscope } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    specialization: '',
    role: 'user' // Default role is user (patient)
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

 const handleSubmit = async () => {
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.address || !formData.city) {
      alert('Please fill in all required fields!');
      return;
    }

    if (formData.role === 'doctor' && !formData.specialization) {
      alert('Please enter your specialization!');
      return;
    }

    // Prepare data to send (omit confirmPassword)
    const sendData = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      address: formData.address,
      city: formData.city,
      specialization: formData.role === 'doctor' ? formData.specialization : null,
      role: formData.role,
    };

    try {
      // Replace `http://localhost:5000` with your backend URL if different
      const response = await axios.post('http://localhost:5000/api/users/register', sendData);
        console.log("Registration successful:", response.data);

        navigate("/auth/login", {
        state: { message: "Registration successful! Please log in." },
      });
      alert("Registration successful")
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      alert('Registration failed: ' + (error.response?.data?.error || 'Server error'));
    }
  };


  return (
        <Card className="w-200 max-w-6xl mx-auto shadow-xl">
          <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-7 h-7 text-white"
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
          </div>
            <CardTitle className="text-3xl font-bold text-[#344256]">
              Create Your Account
            </CardTitle>
            <CardDescription className="text-base">
              Join Medicare to access quality healthcare services
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold text-[#344256]">
                  Register As
                </Label>
                <RadioGroup 
                  value={formData.role} 
                  onValueChange={handleRoleChange} 
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="user" id="user" />
                    <Label 
                      htmlFor="user" 
                      className="cursor-pointer flex items-center space-x-2 font-normal"
                    >
                      <User className="w-4 h-4 text-cyan-600" />
                      <span>Patient</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="doctor" id="doctor" />
                    <Label 
                      htmlFor="doctor" 
                      className="cursor-pointer flex items-center space-x-2 font-normal"
                    >
                      <Stethoscope className="w-4 h-4 text-cyan-600" />
                      <span>Doctor</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="focus:border-cyan-500"
                />
              </div>

              {/* Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="focus:border-cyan-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">
                  Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="focus:border-cyan-500"
                />
              </div>

              {/* City and Specialization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="New York"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="focus:border-cyan-500"
                  />
                </div>
                {formData.role === 'doctor' && (
                  <div className="space-y-2">
                    <Label htmlFor="specialization">
                      Specialization <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="specialization"
                      name="specialization"
                      type="text"
                      placeholder="Cardiology"
                      value={formData.specialization}
                      onChange={handleInputChange}
                      className="focus:border-cyan-500"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button 
                onClick={handleSubmit} 
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-6 text-lg"
              >
                Create Account
              </Button>

              {/* Sign In Link */}
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => window.location.href = '/auth/login'}
                  className="text-cyan-600 hover:text-cyan-700 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
  );
}
