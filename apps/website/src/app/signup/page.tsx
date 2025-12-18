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
      country: '',
      state: '',
      zipcode: '',
      telephone: [''],
      fax: [''],
      websiteUrl: '',
    },
    contactInformation: {
      firstName: '',
      lastName: '',
      position: '',
      email: '',
      telephone: [''],
      fax: [''],
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
  const [inlineConflict, setInlineConflict] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInlineConflict(null);

    try {
      // Clean up telephone and fax arrays (remove empty strings)
      const cleanedData = {
        ...formData,
        companyInformation: {
          ...formData.companyInformation,
          telephone: formData.companyInformation.telephone.filter(t => t.trim() !== ''),
          fax: formData.companyInformation.fax.filter(f => f.trim() !== ''),
        },
        contactInformation: {
          ...formData.contactInformation,
          telephone: formData.contactInformation.telephone.filter(t => t.trim() !== ''),
          fax: formData.contactInformation.fax.filter(f => f.trim() !== ''),
        },
      };

      const result = await register(cleanedData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        if (result.status === 409) {
          setInlineConflict('An account with this email already exists. Would you like to log in instead?');
        } else {
          setError(result.message || 'Registration failed. Please try again.');
        }
      }
    } catch {
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

  // const addPhoneNumber = (section: 'companyInformation' | 'contactInformation', type: 'telephone' | 'fax') => {
  //   setFormData(prev => ({
  //     ...prev,
  //     [section]: {
  //       ...prev[section],
  //       [type]: [...prev[section][type], ''],
  //     },
  //   }));
  // };

  const removePhoneNumber = (section: 'companyInformation' | 'contactInformation', type: 'telephone' | 'fax', index: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [type]: prev[section][type].filter((_, i) => i !== index),
      },
    }));
  };

  const updatePhoneNumber = (section: 'companyInformation' | 'contactInformation', type: 'telephone' | 'fax', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [type]: prev[section][type].map((phone, i) => i === index ? value : phone),
      },
    }));
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative" style={{ backgroundImage: 'url(/login.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 mx-4 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <Link href="/">
              <Image src="/chariot.svg" alt="The Chariot Logo" width={100} height={100} />
            </Link>
          </div>
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="text-green-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your buyer account application has been submitted successfully. 
              You will receive an email with your login credentials once your application is approved by our admin team.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to login page in 3 seconds...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative" style={{ backgroundImage: 'url(/signup.png)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="relative z-10 mx-4 sm:mx-auto sm:w-full sm:max-w-4xl">
        {/* <div className="flex justify-center">
          <Link href="/">
            <Image src="/chariot.svg" alt="The Chariot Logo" width={100} height={100} />
          </Link>
        </div> */}
        <h2 className="mt-6 text-center text-2xl sm:text-3xl font-primary font-bold text-white">
          CREATE A NEW ACCOUNT
        </h2>
        {/* <p className="mt-2 text-center text-sm text-gray-200">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-sunrise hover:text-orange-500">
            Sign in here
          </Link>
        </p>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   */}
      </div>

      <div className="relative z-10 mt-8 mx-4 sm:mx-auto sm:w-full sm:max-w-4xl">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-white border-opacity-20">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Company Information */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company :</label>
                  <input
                    type="text"
                    value={formData.companyInformation.name}
                    onChange={(e) => handleInputChange('companyInformation', 'name', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div></div>
                <div className="">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    value={formData.companyInformation.address}
                    onChange={(e) => handleInputChange('companyInformation', 'address', e.target.value)}
                    required
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    value={formData.companyInformation.zipcode}
                    onChange={(e) => handleInputChange('companyInformation', 'zipcode', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                {/* Company Telephone Numbers */}
                <div className="">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telephone *</label>
                  {formData.companyInformation.telephone.map((phone, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => updatePhoneNumber('companyInformation', 'telephone', index, e.target.value)}
                        required={index === 0}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="+1 (555) 123-4567"
                      />
                      {formData.companyInformation.telephone.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePhoneNumber('companyInformation', 'telephone', index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 self-start sm:self-auto"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {/* <button
                    type="button"
                    onClick={() => addPhoneNumber('companyInformation', 'telephone')}
                    className="text-orange-600 hover:text-orange-800 text-sm"
                  >
                    + Add another phone number
                  </button> */}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website URL *</label>
                  <input
                    type="text"
                    value={formData.companyInformation.websiteUrl}
                    onChange={(e) => handleInputChange('companyInformation', 'websiteUrl', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                
                {/* Contact Telephone Numbers */}
                <div className="">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telephone *</label>
                  {formData.contactInformation.telephone.map((phone, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => updatePhoneNumber('contactInformation', 'telephone', index, e.target.value)}
                        required={index === 0}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="+1 (555) 123-4567"
                      />
                      {formData.contactInformation.telephone.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePhoneNumber('contactInformation', 'telephone', index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 self-start sm:self-auto"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {/* <button
                    type="button"
                    onClick={() => addPhoneNumber('contactInformation', 'telephone')}
                    className="text-orange-600 hover:text-orange-800 text-sm"
                  >
                    + Add another phone number
                  </button> */}
                </div>

                {/* Contact Fax Numbers */}
                <div className="">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile *</label>
                  {formData.contactInformation.fax.map((fax, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
                      <input
                        type="tel"
                        value={fax}
                        onChange={(e) => updatePhoneNumber('contactInformation', 'fax', index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="+1 (555) 123-4567"
                      />
                      {formData.contactInformation.fax.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePhoneNumber('contactInformation', 'fax', index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 self-start sm:self-auto"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {/* <button
                    type="button"
                    onClick={() => addPhoneNumber('contactInformation', 'fax')}
                    className="text-orange-600 hover:text-orange-800 text-sm"
                  >
                    + Add mobile number
                  </button> */}
                </div>
              </div>
            </div>
            {/* Chariot Customer Information */}
            <div className="pb-8 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Chariot Customer Information</h3>
              <div className="space-y-4">
                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-2">Are you an existing Chariot customer?</span>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="isChariotCustomerYes"
                        name="isChariotCustomer"
                        checked={formData.isChariotCustomer === true}
                        onChange={() => handleInputChange('isChariotCustomer', '', true)}
                        className="h-4 w-4 accent-[#FCA17A] focus:ring-orange-500 border-gray-300"
                      />
                      <label htmlFor="isChariotCustomerYes" className="ml-2 block text-sm text-gray-900">
                        Yes
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="isChariotCustomerNo"
                        name="isChariotCustomer"
                        checked={!formData.isChariotCustomer}
                        onChange={() => handleInputChange('isChariotCustomer', '', false)}
                        className="h-4 w-4 accent-[#FCA17A] focus:ring-orange-500 border-gray-300"
                      />
                      <label htmlFor="isChariotCustomerNo" className="ml-2 block text-sm text-gray-900">
                        No
                      </label>
                    </div>
                  </div>
                </div>
                {formData.isChariotCustomer && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chariot Customer ID</label>
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
            {/* Business Information */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                {/* Removed Tax ID, JBT ID, and DUNS Number fields from UI per requirements */}
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
              <Link
                href="/login"
                className="px-6 py-2 border text-center border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition duration-200 w-full sm:w-auto"
              >
                Cancel
              </Link>
              {inlineConflict && (
                <div className="sm:flex-1 flex items-center text-sm text-red-700 bg-red-50 px-3 py-2 rounded-md">
                  <span className="mr-2">{inlineConflict}</span>
                  <Link href="/login" className="underline font-medium text-red-800 hover:text-red-900">Go to Login</Link>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 border-2 border-[#FCA17A]  rounded-md hover:bg-[#FCA17A] disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 w-full sm:w-auto"
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
