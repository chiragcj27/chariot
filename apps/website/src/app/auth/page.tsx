'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function AuthPage() {
  const router = useRouter();

  return (
    <div 
      className="min-h-screen relative flex flex-col"
      style={{
        backgroundImage: 'url(/login.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Main content area - takes up most of the screen */}
      <div className="flex-1 bg-black/70 h-full">
      
      {/* Bottom overlay panel */}
      <div className="z-10 fixed bottom-0 ">
        <div className="px-6 py-8 sm:px-8 sm:py-12">
          <div className="max-w-md mx-auto">
            {/* Logo */}
            <Image src="/chariot_icon.svg" alt="Chariot Logo" width={500} height={500} className="-mb-20 -mt-10"/>
            <div className="mb-10">
                <h1 className="text-white text-2xl text-center font-bold">Welcome to</h1>
                <h1 className="text-[#FCA17A] text-2xl text-center font-balgin-regular font-bold">Chariot</h1>
            </div>

            {/* Auth buttons */}
            <div className="space-y-4 mb-6 flex flex-col items-center">
              <button
                onClick={() => router.push('/login')}
                className="w-[80%] bg-white border-2 border-sunrise hover:bg-sunrise text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-200 uppercase tracking-wide text-sm"
              >
                LOG IN
              </button>
              
              <button
                onClick={() => router.push('/signup')}
                className="w-[80%] bg-sunrise hover:bg-sunrise text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-200 uppercase tracking-wide text-sm"
              >
                SIGN UP
              </button>
            </div>

            {/* Terms and privacy */}
            <div className="text-xs text-gray-300 text-center leading-relaxed">
              By continuing, you agree to Chariot&apos;s{' '}
              <Link href="/terms" className="text-sunrise hover:text-orange-300 underline">
                Terms of Service
              </Link>{' '}
              and acknowledge that you&apos;ve read our{' '}
              <Link href="/privacy" className="text-sunrise hover:text-orange-300 underline">
                Privacy Policy
              </Link>
              . Notice at collection.
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
