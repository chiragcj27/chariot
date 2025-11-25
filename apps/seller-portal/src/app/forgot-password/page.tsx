'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

type Step = 'request' | 'verify' | 'reset';

const INITIAL_FORM = {
  email: '',
  otp: '',
  newPassword: '',
  confirmPassword: '',
};

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('request');
  const [form, setForm] = useState(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step === 'request') {
      await requestOtp();
    } else if (step === 'verify') {
      await verifyOtp();
    } else {
      await resetPassword();
    }
  };

  const requestOtp = async () => {
    if (!form.email) {
      toast.error('Please enter the email associated with your account.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/password-reset/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: form.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      toast.success('OTP sent. Check your email.');
      setStep('verify');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send OTP';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!form.otp.trim()) {
      toast.error('Enter the OTP sent to your email.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/password-reset/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: form.email, otp: form.otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid OTP');
      }

      toast.success('OTP verified. Set a new password.');
      setStep('reset');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to verify OTP';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async () => {
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    if (form.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/password-reset/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          otp: form.otp,
          newPassword: form.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
      }

      toast.success('Password updated. Please sign in with your new password.');
      setForm(INITIAL_FORM);
      setStep('request');
      router.push('/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reset password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (step === 'verify') {
      await requestOtp();
    }
  };

  const renderFields = () => {
    if (step === 'request') {
      return (
        <>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="you@example.com"
            required
          />
          <p className="text-xs text-gray-500 mt-2">
            We&apos;ll send a one-time password to verify your identity.
          </p>
        </>
      );
    }

    if (step === 'verify') {
      return (
        <>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
            Enter the 6-digit OTP
          </label>
          <input
            id="otp"
            type="text"
            value={form.otp}
            onChange={(event) =>
              setForm({ ...form, otp: event.target.value.replace(/[^0-9]/g, '') })
            }
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-center tracking-widest text-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="000000"
            inputMode="numeric"
            maxLength={6}
            required
          />
          <p className="text-xs text-gray-500 mt-2">
            Didn&apos;t receive it? Check spam or resend the OTP below.
          </p>
          <button
            type="button"
            onClick={handleResendOtp}
            className="text-sm text-indigo-600 hover:text-indigo-500 mt-3"
            disabled={isLoading}
          >
            Resend OTP
          </button>
        </>
      );
    }

    return (
      <>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          value={form.newPassword}
          onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter a new password"
          required
        />

        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2 mt-4">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Re-enter your new password"
          required
        />
      </>
    );
  };

  const primaryButtonLabel =
    step === 'request' ? 'Send OTP' : step === 'verify' ? 'Verify OTP' : 'Reset password';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset your password</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'request' && 'Enter your email to receive a one-time password.'}
            {step === 'verify' && `Enter the OTP sent to ${form.email}.`}
            {step === 'reset' && 'Create a new password for your account.'}
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {renderFields()}

            <div className="flex items-center justify-between">
              <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                Back to login
              </Link>
              {step !== 'request' && (
                <button
                  type="button"
                  className="text-sm text-gray-500 hover:text-gray-800"
                  onClick={() => setStep(step === 'reset' ? 'verify' : 'request')}
                  disabled={isLoading}
                >
                  {step === 'reset' ? '← Back to OTP' : '← Start over'}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Please wait…' : primaryButtonLabel}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

