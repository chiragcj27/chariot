'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

type FormMode = 'login' | 'forgot-password' | 'otp-verification' | 'new-password';

export default function LoginPage() {
  const [formMode, setFormMode] = useState<FormMode>('login');
  const [formData, setFormData] = useState({
    userAccountId: '',
    password: '',
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (formMode === 'login') {
        const success = await login(formData.userAccountId, formData.password);
        if (success) {
          router.push('/'); // Redirect to home page after successful login
        } else {
          setError('Invalid user account ID or password');
        }
      } else if (formMode === 'forgot-password') {
        await requestPasswordReset();
      } else if (formMode === 'otp-verification') {
        await verifyOTP();
      } else if (formMode === 'new-password') {
        await resetPassword();
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async () => {
    try {
      const response = await fetch('/api/password-reset/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('OTP has been sent to your email address.');
        setFormMode('otp-verification');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    }
  };

  const verifyOTP = async () => {
    try {
      const response = await fetch('/api/password-reset/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: formData.email, 
          otp: formData.otp 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('OTP verified successfully. Please enter your new password.');
        setFormMode('new-password');
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (error) {
      setError('Failed to verify OTP. Please try again.');
    }
  };

  const resetPassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await fetch('/api/password-reset/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: formData.email, 
          otp: formData.otp,
          newPassword: formData.newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password has been reset successfully. You can now login with your new password.');
        setFormMode('login');
        setFormData({
          userAccountId: '',
          password: '',
          email: '',
          otp: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setError('Failed to reset password. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBackToLogin = () => {
    setFormMode('login');
    setError('');
    setSuccess('');
    setFormData({
      userAccountId: '',
      password: '',
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleForgotPassword = () => {
    setFormMode('forgot-password');
    setError('');
    setSuccess('');
  };

  const renderForm = () => {
    switch (formMode) {
      case 'login':
        return (
          <>
            <div>
              <label htmlFor="userAccountId" className="block text-sm font-bold text-black mb-2">
                User Account ID
              </label>
              <input
                type="text"
                id="userAccountId"
                name="userAccountId"
                value={formData.userAccountId}
                onChange={handleInputChange}
                required
                className="appearance-none block w-full px-3 py-2 -mb-3 border border-black rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Enter your user account ID"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-black mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="appearance-none block w-full px-3 py-2 -mb-3 border border-black rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Enter your password"
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-orange-500 hover:text-orange-600"
              >
                Forgot Your Password?
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              By continuing, you agree to Chariot&apos;s{' '}
              <Link href="/terms" className="hover:text-orange-600 underline">
                Terms of Service
              </Link>{' '}
              and acknowledge that you&apos;ve read our{' '}
              <Link href="/privacy" className="hover:text-orange-600 underline">
                Privacy Policy
              </Link>
              . Notice at collection.
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="w-30 flex justify-center py-1 px-3 border-[#D94506] border-3 rounded-lg shadow-sm text-sm font-medium text-black hover:bg-[#FCA17A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 uppercase tracking-wid font-balgin-regular"
              >
                {loading ? 'Signing In...' : 'LOG IN'}
              </button>
            </div>
          </>
        );

      case 'forgot-password':
        return (
          <>
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-black">Forgot Password</h3>
              <p className="text-sm text-gray-600 mt-2">
                Enter your email address and we&apos;ll send you a one-time password to reset your account.
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-black mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="appearance-none block w-full px-3 py-2 -mb-3 border border-black rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Enter your email address"
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                ← Back to Login
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-30 flex justify-center py-1 px-3 border-[#D94506] border-3 rounded-lg shadow-sm text-sm font-medium text-black hover:bg-[#FCA17A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 uppercase tracking-wid font-balgin-regular"
              >
                {loading ? 'Sending...' : 'SEND OTP'}
              </button>
            </div>
          </>
        );

      case 'otp-verification':
        return (
          <>
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-black">Verify OTP</h3>
              <p className="text-sm text-gray-600 mt-2">
                We&apos;ve sent a 6-digit code to {formData.email}
              </p>
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-bold text-black mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                required
                maxLength={6}
                className="appearance-none block w-full px-3 py-2 -mb-3 border border-black rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-center text-lg tracking-widest"
                placeholder="000000"
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-30 flex justify-center py-1 px-3 border-[#D94506] border-3 rounded-lg shadow-sm text-sm font-medium text-black hover:bg-[#FCA17A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 uppercase tracking-wid font-balgin-regular"
              >
                {loading ? 'Verifying...' : 'VERIFY OTP'}
              </button>
            </div>
          </>
        );

      case 'new-password':
        return (
          <>
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-black">Set New Password</h3>
              <p className="text-sm text-gray-600 mt-2">
                Enter your new password below
              </p>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-bold text-black mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                required
                className="appearance-none block w-full px-3 py-2 -mb-3 border border-black rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-black mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="appearance-none block w-full px-3 py-2 -mb-3 border border-black rounded-md placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setFormMode('otp-verification')}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-30 flex justify-center py-1 px-3 border-[#D94506] border-3 rounded-lg shadow-sm text-sm font-medium text-black hover:bg-[#FCA17A] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 uppercase tracking-wid font-balgin-regular"
              >
                {loading ? 'Resetting...' : 'RESET PASSWORD'}
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-6 relative"
      style={{
        backgroundImage: 'url(/login.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/70"></div>
      
      <div className="relative z-10 w-full max-w-6xl flex items-center">
        {/* Left side - Text content */}
        <div className="flex-1 text-white pr-10">
          <h1 className="text-5xl h-[50%] -ml-10 font-balgin-regular">
            Login to your jewelry <br/> marketing studio
          </h1>
        </div>

        {/* Right side - Login form */}
        <div className="w-80">
          <div className="bg-white -mr-10 rounded-4xl py-8 px-6 shadow-xl">
            {/* Logo and header */}
            <div className="text-center mb-6">
              <Image src="/chariot_icon.svg" alt="Chariot Logo" width={500} height={500} className="-mb-20 -mt-10"/>
              <p className="text-black text-[24px] font-bold font-balgin-regular">Welcome to</p>
              <h2 className="text-[#FCA17A] text-[24px] -mt-3 font-bold font-balgin-regular">Chariot</h2>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {renderForm()}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
