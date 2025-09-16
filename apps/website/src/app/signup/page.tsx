'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    companyInformation: {
      name: '',
      address: '',
      address2: '',
      country: '',
      state: '',
      zipcode: '',
      telephone: '',
      websiteUrl: '',
    },
    contactInformation: {
      firstName: '',
      lastName: '',
      position: '',
      email: '',
      mobile: '',
      telephone: '',
    },
    otherInformation: {
      primaryMarketSegment: '',
      buyingOrganization: '',
      TaxId: '',
      JBT_id: '',
      DUNN: '',
    },
    isChariotCustomer: false,
    chariotCustomerId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await register(formData);
      if (success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section: string, field: string, value: string | boolean) => {
    setFormData(prev => {
      if (section === 'companyInformation') {
        return {
          ...prev,
          companyInformation: {
            ...prev.companyInformation,
            [field]: value,
          },
        };
      } else if (section === 'contactInformation') {
        return {
          ...prev,
          contactInformation: {
            ...prev.contactInformation,
            [field]: value,
          },
        };
      } else if (section === 'otherInformation') {
        return {
          ...prev,
          otherInformation: {
            ...prev.otherInformation,
            [field]: value,
          },
        };
      } else if (section === 'isChariotCustomer') {
        return {
          ...prev,
          isChariotCustomer: value as boolean,
        };
      } else if (section === 'chariotCustomerId') {
        return {
          ...prev,
          chariotCustomerId: value as string,
        };
      }
      return prev;
    });
  };

  // phone helpers removed in new schema (single values)

  if (success) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8 xl:px-12 relative" style={{ backgroundImage: 'url(/login.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 mx-auto w-full max-w-md xl:max-w-lg 2xl:max-w-xl">
          <div className="flex justify-center mb-6 xl:mb-8">
            <Link href="/">
              <Image src="/chariot.svg" alt="The Chariot Logo" width={70} height={70} className="xl:w-20 xl:h-20 2xl:w-24 2xl:h-24" />
            </Link>
          </div>
          <div className="bg-white py-6 px-4 shadow-lg rounded-lg sm:py-8 sm:px-10 xl:py-12 xl:px-12 2xl:py-16 2xl:px-16 text-center">
            <div className="text-green-500 mb-4 xl:mb-6">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 xl:w-20 xl:h-20 2xl:w-24 2xl:h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl xl:text-3xl 2xl:text-4xl font-bold text-gray-900 mb-4 xl:mb-6">Registration Successful!</h2>
            <p className="text-sm sm:text-base xl:text-lg 2xl:text-xl text-gray-600 mb-6 xl:mb-8">
              Your buyer account application has been submitted successfully. 
              You will receive an email with your login credentials once your application is approved by our admin team.
            </p>
            <p className="text-xs sm:text-sm xl:text-base 2xl:text-lg text-gray-500">
              Redirecting to login page in 3 seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4 sm:py-12 sm:px-6 lg:px-8 xl:px-12 relative" style={{ backgroundImage: 'url(/login.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div className="absolute inset-0 bg-black/70"></div>
      <div className="relative z-10 mx-auto w-full max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
        <div className="flex justify-center mb-4 sm:mb-6 xl:mb-8">
          <Link href="/">
            <Image src="/chariot.svg" alt="The Chariot Logo" width={70} height={70} className="xl:w-20 xl:h-20 2xl:w-24 2xl:h-24" />
          </Link>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl lg:text-4xl 2xl:text-5xl font-extrabold text-white mb-2 xl:mb-4">
          Buyer Account Request
        </h2>
        <p className="text-center text-sm sm:text-base lg:text-lg xl:text-xl text-gray-200">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-orange-400 hover:text-orange-300">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="relative z-10 mt-6 sm:mt-8 xl:mt-12 mx-auto w-full max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm py-6 px-4 shadow-xl rounded-lg sm:py-8 sm:px-6 lg:px-10 xl:py-12 xl:px-12 2xl:py-16 2xl:px-16 border border-white border-opacity-20">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 xl:space-y-10 2xl:space-y-12">
            {/* Company Information */}
            <div className="border-b border-gray-200 pb-6 sm:pb-8 xl:pb-10 2xl:pb-12">
              <h3 className="text-base sm:text-lg xl:text-xl 2xl:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 xl:mb-8">Your Company Information</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                  <input
                    type="text"
                    value={formData.companyInformation.name}
                    onChange={(e) => handleInputChange('companyInformation', 'name', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website URL *</label>
                  <input
                    type="url"
                    value={formData.companyInformation.websiteUrl}
                    onChange={(e) => handleInputChange('companyInformation', 'websiteUrl', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="lg:col-span-2 xl:col-span-3 2xl:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address 1 *</label>
                  <input
                    type="text"
                    value={formData.companyInformation.address}
                    onChange={(e) => handleInputChange('companyInformation', 'address', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address 2</label>
                  <input
                    type="text"
                    value={formData.companyInformation.address2}
                    onChange={(e) => handleInputChange('companyInformation', 'address2', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                  <input
                    type="text"
                    value={formData.companyInformation.country}
                    onChange={(e) => handleInputChange('companyInformation', 'country', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                  <input
                    type="text"
                    value={formData.companyInformation.state}
                    onChange={(e) => handleInputChange('companyInformation', 'state', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP *</label>
                  <input
                    type="text"
                    value={formData.companyInformation.zipcode}
                    onChange={(e) => handleInputChange('companyInformation', 'zipcode', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Telephone *</label>
                  <input
                    type="tel"
                    value={formData.companyInformation.telephone}
                    onChange={(e) => handleInputChange('companyInformation', 'telephone', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-b border-gray-200 pb-6 sm:pb-8 xl:pb-10 2xl:pb-12">
              <h3 className="text-base sm:text-lg xl:text-xl 2xl:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 xl:mb-8">Contact Information</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.contactInformation.firstName}
                    onChange={(e) => handleInputChange('contactInformation', 'firstName', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.contactInformation.lastName}
                    onChange={(e) => handleInputChange('contactInformation', 'lastName', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                  <input
                    type="text"
                    value={formData.contactInformation.position}
                    onChange={(e) => handleInputChange('contactInformation', 'position', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.contactInformation.email}
                    onChange={(e) => handleInputChange('contactInformation', 'email', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile *</label>
                  <input
                    type="tel"
                    value={formData.contactInformation.mobile}
                    onChange={(e) => handleInputChange('contactInformation', 'mobile', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="+1 (555) 987-6543"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telephone *</label>
                  <input
                    type="tel"
                    value={formData.contactInformation.telephone}
                    onChange={(e) => handleInputChange('contactInformation', 'telephone', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="border-b border-gray-200 pb-6 sm:pb-8 xl:pb-10 2xl:pb-12">
              <h3 className="text-base sm:text-lg xl:text-xl 2xl:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 xl:mb-8">Business Information</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 xl:gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Market Segment *</label>
                  <select
                    value={formData.otherInformation.primaryMarketSegment}
                    onChange={(e) => handleInputChange('otherInformation', 'primaryMarketSegment', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Market Segment</option>
                    <option value="Single Store Retailer">Single Store Retailer</option>
                    <option value="2-5 Store Chains">2-5 Store Chains</option>
                    <option value="6-14 Store Chains">6-14 Store Chains</option>
                    <option value="15-29 Store Chains">15-29 Store Chains</option>
                    <option value="30+ Store Chains">30+ Store Chains</option>
                    <option value="Wholesale/Distributor">Wholesale/Distributor</option>
                    <option value="Buying Group">Buying Group</option>
                    <option value="Government Facilities">Government Facilities</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buying Organization *</label>
                  <select
                    value={formData.otherInformation.buyingOrganization}
                    onChange={(e) => handleInputChange('otherInformation', 'buyingOrganization', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Buying Organization</option>
                    <option value="AGS - American Gem Society">AGS - American Gem Society</option>
                    <option value="BIG - Buyers International Group">BIG - Buyers International Group</option>
                    <option value="CBG - Continental Buying Group">CBG - Continental Buying Group</option>
                    <option value="CJG - Canadian Jewellery Group">CJG - Canadian Jewellery Group</option>
                    <option value="IJO - Independent Jewelers Organization">IJO - Independent Jewelers Organization</option>
                    <option value="LJG - Leading Jewelers Guild">LJG - Leading Jewelers Guild</option>
                    <option value="RJO - Retail Jewelers Organization">RJO - Retail Jewelers Organization</option>
                    <option value="SJO - Southeastern Jewelers Organization">SJO - Southeastern Jewelers Organization</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID#</label>
                  <input
                    type="text"
                    value={formData.otherInformation.TaxId}
                    onChange={(e) => handleInputChange('otherInformation', 'TaxId', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">JBT#</label>
                  <input
                    type="text"
                    value={formData.otherInformation.JBT_id}
                    onChange={(e) => handleInputChange('otherInformation', 'JBT_id', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DUNN#</label>
                  <input
                    type="text"
                    value={formData.otherInformation.DUNN}
                    onChange={(e) => handleInputChange('otherInformation', 'DUNN', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Chariot Customer Information */}
            <div className="pb-6 sm:pb-8 xl:pb-10 2xl:pb-12">
              <h3 className="text-base sm:text-lg xl:text-xl 2xl:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6 xl:mb-8">Chariot Account Status</h3>
              <div className="space-y-4 xl:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 xl:gap-6">
                  <span className="text-sm xl:text-base 2xl:text-lg font-medium text-gray-900">Are you existing Chariot Customer</span>
                  <div className="flex gap-4 xl:gap-6">
                    <label className="inline-flex items-center gap-2 text-sm xl:text-base 2xl:text-lg text-gray-900 cursor-pointer">
                      <input
                        type="radio"
                        name="isChariotCustomer"
                        checked={formData.isChariotCustomer === true}
                        onChange={() => handleInputChange('isChariotCustomer', '', true)}
                        className="h-4 w-4 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      YES
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm xl:text-base 2xl:text-lg text-gray-900 cursor-pointer">
                      <input
                        type="radio"
                        name="isChariotCustomer"
                        checked={formData.isChariotCustomer === false}
                        onChange={() => handleInputChange('isChariotCustomer', '', false)}
                        className="h-4 w-4 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      NO
                    </label>
                  </div>
                </div>
                {formData.isChariotCustomer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">If Yes - your account Id:</label>
                    <input
                      type="text"
                      value={formData.chariotCustomerId}
                      onChange={(e) => handleInputChange('chariotCustomerId', '', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter your Chariot Customer ID"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 xl:gap-6 sm:space-x-0">
              <Link
                href="/login"
                className="w-full sm:w-auto px-6 py-2 xl:px-8 xl:py-3 2xl:px-10 2xl:py-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-200 text-center text-sm xl:text-base 2xl:text-lg"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2 xl:px-8 xl:py-3 2xl:px-10 2xl:py-4 border-3 border-[#FCA17A] text-black rounded-md hover:bg-[#FCA17A] disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 text-sm xl:text-base 2xl:text-lg"
              >
                {loading ? 'Submitting...' : 'Account Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
