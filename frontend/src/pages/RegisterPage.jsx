import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Stethoscope, Eye, EyeOff, Check, X, AlertCircle, Mail, Phone, Lock, MapPin } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const API_BASE = 'http://localhost:5000/api';
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '+977',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    specialization: '',
    role: 'user'
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // OTP state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(120); // 2 minutes
  const [canResendOtp, setCanResendOtp] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newEmailError, setNewEmailError] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  // Validation rules
  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'fullName':
        if (!value.trim()) error = 'Full name is required';
        else if (value.trim().length < 3) error = 'Name must be at least 3 characters';
        else if (!/^[a-zA-Z\s]+$/.test(value)) error = 'Name can only contain letters and spaces';
        break;
        
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
        
      case 'phone':
        const phoneDigits = value.replace(/\D/g, '');
        if (!value.trim()) error = 'Phone number is required';
        else if (!value.startsWith('+977')) error = 'Phone must start with +977';
        else if (phoneDigits.length !== 13) error = 'Phone must be 10 digits after +977';
        else if (!/^\+977[0-9]{10}$/.test(value)) error = 'Invalid Nepali phone number';
        break;
        
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 8) error = 'Password must be at least 8 characters';
        else if (!/(?=.*[a-z])/.test(value)) error = 'Password must contain lowercase letter';
        else if (!/(?=.*[A-Z])/.test(value)) error = 'Password must contain uppercase letter';
        else if (!/(?=.*\d)/.test(value)) error = 'Password must contain a number';
        else if (!/(?=.*[@$!%*?&])/.test(value)) error = 'Password must contain special character (@$!%*?&)';
        break;
        
      case 'confirmPassword':
        if (!value) error = 'Please confirm your password';
        else if (value !== formData.password) error = 'Passwords do not match';
        break;
        
      case 'address':
        if (!value.trim()) error = 'Address is required';
        else if (value.trim().length < 5) error = 'Address must be at least 5 characters';
        break;
        
      case 'city':
        if (!value.trim()) error = 'City is required';
        break;
        
      case 'specialization':
        if (formData.role === 'doctor' && !value.trim()) error = 'Specialization is required for doctors';
        break;
    }
    
    return error;
  };

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (!password) return { score: 0, text: '', color: '' };
    
    // Length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character types
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;
    
    // Determine strength
    if (score <= 2) return { score, text: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score, text: 'Medium', color: 'bg-yellow-500' };
    return { score, text: 'Strong', color: 'bg-green-500' };
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for phone number
    if (name === 'phone') {
      if (!value.startsWith('+977')) {
        setFormData(prev => ({ ...prev, [name]: '+977' }));
        return;
      }
      // Only allow numbers after +977
      const phoneDigits = value.slice(4).replace(/\D/g, '');
      if (phoneDigits.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: '+977' + phoneDigits }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Validate field
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    
    // Update password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    // Revalidate confirm password if password changes
    if (name === 'password' && formData.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleRoleChange = (value) => {
    setFormData(prev => ({ ...prev, role: value }));
    if (value === 'user') {
      setFormData(prev => ({ ...prev, specialization: '' }));
      setErrors(prev => ({ ...prev, specialization: '' }));
    }
  };

  // Validate all fields
  const validateAllFields = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'specialization' || formData.role === 'doctor') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid
  const isFormValid = () => {
    return Object.values(errors).every(error => !error) &&
           formData.fullName &&
           formData.email &&
           formData.phone &&
           formData.password &&
           formData.confirmPassword &&
           formData.address &&
           formData.city &&
           (formData.role === 'user' || formData.specialization);
  };


  // Handle registration submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAllFields()) {
      return;
    }
    
    setIsSubmitting(true);
    
    const sendData = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone,
      password: formData.password,
      address: formData.address.trim(),
      city: formData.city.trim(),
      specialization: formData.role === 'doctor' ? formData.specialization.trim() : null,
      role: formData.role,
    };

    try {
      const response = await axios.post(`${API_BASE}/users/register`, sendData);
      
      if (response.data.verificationToken) {
        setVerificationToken(response.data.verificationToken);
        setRegisteredEmail(response.data.email);
        setShowOtpModal(true);
        setOtpTimer(120);
        setCanResendOtp(false);
        
        // Show warning if email wasn't sent
        if (!response.data.emailSent && response.data.warning) {
          alert('⚠️ ' + response.data.warning + '\n\nYou can use the "Resend OTP" button to try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || 'Registration failed. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // OTP Timer
  useEffect(() => {
    let interval;
    if (showOtpModal && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => {
          if (prev <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, otpTimer]);

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/patient/verify-email`, {
        email: registeredEmail,
        otp: otp,
        verificationToken: verificationToken
      });

      // Store token and user data
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      alert('✅ Email verified successfully! Your account has been created.');
      setShowOtpModal(false);
      navigate('/auth/login', {
        state: { message: 'Registration successful! Please log in.' }
      });
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.error || 'Invalid or expired OTP';
      alert(errorMessage);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!canResendOtp) return;

    try {
      await axios.post(`${API_BASE}/patient/resend-verification`, {
        email: registeredEmail,
        verificationToken: verificationToken
      });

      alert('OTP resent successfully! Please check your email.');
      setOtpTimer(120);
      setCanResendOtp(false);
      setOtp('');
    } catch (error) {
      console.error('Resend OTP error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to resend OTP';
      alert(errorMessage);
    }
  };

  // Handle change email
  const handleChangeEmail = () => {
    setShowChangeEmail(true);
    setNewEmail('');
    setNewEmailError('');
  };

  const validateNewEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
    if (email.toLowerCase() === registeredEmail.toLowerCase()) return 'This is the same email address';
    return '';
  };

  const handleNewEmailChange = (e) => {
    const email = e.target.value;
    setNewEmail(email);
    setNewEmailError(validateNewEmail(email));
  };

  const handleConfirmChangeEmail = async () => {
    const error = validateNewEmail(newEmail);
    if (error) {
      setNewEmailError(error);
      return;
    }

    setIsChangingEmail(true);
    try {
      const response = await axios.post(`${API_BASE}/patient/change-email`, {
        oldEmail: registeredEmail,
        newEmail: newEmail.trim().toLowerCase(),
        verificationToken: verificationToken
      });

      // Update the registered email
      setRegisteredEmail(response.data.newEmail);
      setShowChangeEmail(false);
      setOtp('');
      setOtpTimer(120);
      setCanResendOtp(false);
      
      // Show appropriate message
      if (response.data.emailSent) {
        alert('✅ Email updated successfully!\n\n📧 New OTP sent to: ' + response.data.newEmail + '\n⚠️ Previous OTP has been invalidated.');
      } else {
        alert('✅ Email updated successfully!\n\n⚠️ ' + (response.data.warning || 'Email service unavailable') + '\n\nPlease use "Resend OTP" button.');
      }
    } catch (error) {
      console.error('Change email error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to change email';
      alert('❌ ' + errorMessage);
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleCancelChangeEmail = () => {
    setShowChangeEmail(false);
    setNewEmail('');
    setNewEmailError('');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nepalCities = [
    'Kathmandu', 'Pokhara', 'Lalitpur', 'Bharatpur', 'Biratnagar', 
    'Birgunj', 'Dharan', 'Butwal', 'Hetauda', 'Janakpur',
    'Nepalgunj', 'Dhangadhi', 'Itahari', 'Tulsipur', 'Ghorahi'
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold text-[#344256]">
                Register As <span className="text-red-500">*</span>
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
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Ram Bahadur Shrestha"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={`pl-10 ${errors.fullName ? 'border-red-500' : 'focus:border-cyan-500'}`}
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-sm flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ram.shrestha@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.email ? 'border-red-500' : 'focus:border-cyan-500'}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm flex items-center">
                    <X className="w-4 h-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+9779812345678"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.phone ? 'border-red-500' : 'focus:border-cyan-500'}`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm flex items-center">
                    <X className="w-4 h-4 mr-1" />
                    {errors.phone}
                  </p>
                )}
                <p className="text-xs text-gray-500">Format: +977 followed by 10 digits</p>
              </div>
            </div>


            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : 'focus:border-cyan-500'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${passwordStrength.color}`}
                          style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{passwordStrength.text}</span>
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="text-red-500 text-sm flex items-center">
                    <X className="w-4 h-4 mr-1" />
                    {errors.password}
                  </p>
                )}
                <div className="text-xs text-gray-600 space-y-1">
                  <p className="font-medium">Password must contain:</p>
                  <div className="grid grid-cols-2 gap-1">
                    <div className={`flex items-center ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                      <Check className="w-3 h-3 mr-1" />
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <Check className="w-3 h-3 mr-1" />
                      <span>Uppercase</span>
                    </div>
                    <div className={`flex items-center ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <Check className="w-3 h-3 mr-1" />
                      <span>Lowercase</span>
                    </div>
                    <div className={`flex items-center ${/\d/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <Check className="w-3 h-3 mr-1" />
                      <span>Number</span>
                    </div>
                    <div className={`flex items-center ${/[@$!%*?&]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                      <Check className="w-3 h-3 mr-1" />
                      <span>Special char</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : 'focus:border-cyan-500'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm flex items-center">
                    <X className="w-4 h-4 mr-1" />
                    {errors.confirmPassword}
                  </p>
                )}
                {formData.confirmPassword && !errors.confirmPassword && (
                  <p className="text-green-600 text-sm flex items-center">
                    <Check className="w-4 h-4 mr-1" />
                    Passwords match
                  </p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">
                Address <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <Input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Thamel, Ward No. 26"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`pl-10 ${errors.address ? 'border-red-500' : 'focus:border-cyan-500'}`}
                />
              </div>
              {errors.address && (
                <p className="text-red-500 text-sm flex items-center">
                  <X className="w-4 h-4 mr-1" />
                  {errors.address}
                </p>
              )}
            </div>

            {/* City and Specialization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 ${errors.city ? 'border-red-500' : ''}`}
                >
                  <option value="">Select City</option>
                  {nepalCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-red-500 text-sm flex items-center">
                    <X className="w-4 h-4 mr-1" />
                    {errors.city}
                  </p>
                )}
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
                    placeholder="e.g., Cardiology, Pediatrics"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    className={`${errors.specialization ? 'border-red-500' : 'focus:border-cyan-500'}`}
                  />
                  {errors.specialization && (
                    <p className="text-red-500 text-sm flex items-center">
                      <X className="w-4 h-4 mr-1" />
                      {errors.specialization}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Sign In Link */}
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="text-cyan-600 hover:text-cyan-700 font-semibold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>


      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Verify Your Email</CardTitle>
              <CardDescription className="text-center space-y-2">
                {!showChangeEmail ? (
                  <>
                    <div>We've sent a 6-digit OTP to</div>
                    <div className="font-semibold text-cyan-600 text-lg">{registeredEmail}</div>
                    <button
                      onClick={handleChangeEmail}
                      className="text-sm text-blue-600 hover:text-blue-700 underline mt-2"
                    >
                      Change Email Address
                    </button>
                  </>
                ) : (
                  <div className="text-left">
                    <p className="text-sm text-gray-600 mb-3">Enter a new email address to receive OTP</p>
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showChangeEmail ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="text-center text-2xl tracking-widest"
                    />
                    <p className="text-sm text-gray-600 text-center">
                      OTP expires in: <span className="font-semibold text-cyan-600">{formatTime(otpTimer)}</span>
                    </p>
                  </div>

                  {otpTimer === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <p className="text-sm text-yellow-800">
                        OTP has expired. Please request a new one.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button
                      onClick={handleVerifyOtp}
                      disabled={otp.length !== 6 || otpTimer === 0}
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
                    >
                      Verify Email
                    </Button>
                    
                    <Button
                      onClick={handleResendOtp}
                      disabled={!canResendOtp}
                      variant="outline"
                      className="w-full"
                    >
                      {canResendOtp ? 'Resend OTP' : `Resend in ${formatTime(otpTimer)}`}
                    </Button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Check your spam folder if you don't see the email.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="newEmail">New Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        id="newEmail"
                        type="email"
                        placeholder="your.new.email@example.com"
                        value={newEmail}
                        onChange={handleNewEmailChange}
                        className={`pl-10 ${newEmailError ? 'border-red-500' : 'focus:border-cyan-500'}`}
                      />
                    </div>
                    {newEmailError && (
                      <p className="text-red-500 text-sm flex items-center">
                        <X className="w-4 h-4 mr-1" />
                        {newEmailError}
                      </p>
                    )}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-amber-800 space-y-1">
                        <p className="font-semibold">Important:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>A new OTP will be sent to the new email</li>
                          <li>Previous OTP will be invalidated</li>
                          <li>Make sure the new email is correct</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      onClick={handleConfirmChangeEmail}
                      disabled={!newEmail || !!newEmailError || isChangingEmail}
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
                    >
                      {isChangingEmail ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating Email...
                        </>
                      ) : (
                        'Confirm & Send New OTP'
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleCancelChangeEmail}
                      disabled={isChangingEmail}
                      variant="outline"
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
