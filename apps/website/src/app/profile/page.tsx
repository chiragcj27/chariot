'use client';

import React, { useState, useEffect } from 'react';
import AccountLayout from '../../components/AccountLayout';
import { useBuyerProfile } from '@/hooks/useBuyerProfile';

// const MARKET_SEGMENTS = [
//   'Single Store Retailer',
//   '2-5 Store Chains',
//   '6-14 Store Chains',
//   '15-29 Store Chains',
//   '30+ Store Chains',
//   'Wholesale/Distributor',
//   'Buying Group',
//   'Government Facilities',
//   'Other',
// ];

// const BUYING_ORGANIZATIONS = [
//   'AGS - American Gem Society',
//   'BIG - Buyers International Group',
//   'CBG - Continental Buying Group',
//   'CJG - Canadian Jewellery Group',
//   'IJO - Independent Jewelers Organization',
//   'LJG - Leading Jewelers Guild',
//   'RJO - Retail Jewelers Organization',
//   'SJO - Southeastern Jewelers Organization',
//   'Other',
// ];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
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
  });

  // Use SWR hook to fetch profile data
  const { profile, isLoading } = useBuyerProfile();

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        companyInformation: {
          name: profile.companyInformation?.name || '',
          address: profile.companyInformation?.address || '',
          country: profile.companyInformation?.country || '',
          state: profile.companyInformation?.state || '',
          zipcode: profile.companyInformation?.zipcode || '',
          telephone: profile.companyInformation?.telephone || [''],
          fax: profile.companyInformation?.fax || [''],
          websiteUrl: profile.companyInformation?.websiteUrl || '',
        },
        contactInformation: {
          firstName: profile.contactInformation?.firstName || '',
          lastName: profile.contactInformation?.lastName || '',
          position: profile.contactInformation?.position || '',
          email: profile.contactInformation?.email || '',
          telephone: profile.contactInformation?.telephone || [''],
          fax: profile.contactInformation?.fax || [''],
        },
        otherInformation: {
          primaryMarketSegment: profile.otherInformation?.primaryMarketSegment || '',
          buyingOrganization: profile.otherInformation?.buyingOrganization || '',
          TaxId: profile.otherInformation?.TaxId || '',
          JBT_id: profile.otherInformation?.JBT_id || '',
          DUNN: profile.otherInformation?.DUNN || '',
        },
      });
    }
  }, [profile]);

  const handleInputChange = (section: string, field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleArrayInputChange = (section: string, field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: ((prev[section as keyof typeof prev] as Record<string, unknown>)[field] as string[]).map((_: string, i: number) => i === index ? value : _)
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage('');

    try {
      const token = localStorage.getItem('accessToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      
      const response = await fetch(`${API_URL}/api/buyers/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <AccountLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout>
              {message && (
                <div className={`mb-6 p-4 rounded-md ${
                  message.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Company Information */}
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Company Information</h3>
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className="text-orange-600 hover:text-orange-700 font-medium"
                    >
                      {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                  </div>
                  
                  <div className="flex flex-col md:grid grid-cols-2 gap-6">
                    <div className='col-span-2'>
                      <label className="block text-sm font-extrabold font-secondary text-gray-900 mb-2">COMPANY NAME</label>
                      <input
                        type="text"
                        value={formData.companyInformation.name}
                        onChange={(e) => handleInputChange('companyInformation', 'name', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-white"
                        placeholder="Company name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-extrabold text-gray-900 mb-2">ADDRESS</label>
                      <input
                        type="text"
                        value={formData.companyInformation.address}
                        onChange={(e) => handleInputChange('companyInformation', 'address', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-white"
                        placeholder="Address"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-extrabold text-gray-900 mb-2">COUNTRY</label>
                      <input
                        type="text"
                        value={formData.companyInformation.country}
                        onChange={(e) => handleInputChange('companyInformation', 'country', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-white"
                        placeholder="Country"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-extrabold text-gray-900 mb-2">TELEPHONE</label>
                      <input
                        type="text"
                        value={formData.companyInformation.telephone[0] || ''}
                        onChange={(e) => handleArrayInputChange('companyInformation', 'telephone', 0, e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-white"
                        placeholder="Telephone 1"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-extrabold text-gray-900 mb-2">STATE</label>
                        <input
                          type="text"
                          value={formData.companyInformation.state}
                          onChange={(e) => handleInputChange('companyInformation', 'state', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-white"
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-extrabold text-gray-900 mb-2">ZIP CODE</label>
                        <input
                          type="text"
                          value={formData.companyInformation.zipcode}
                          onChange={(e) => handleInputChange('companyInformation', 'zipcode', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-white"
                          placeholder="ZIP Code"
                        />
                      </div>
                    </div>
                    
                    {/* <div>
                      <label className="block text-sm font-extrabold text-gray-900 mb-2">TELEPHONE 2</label>
                      <input
                        type="text"
                        value={formData.companyInformation.telephone[1] || ''}
                        onChange={(e) => handleArrayInputChange('companyInformation', 'telephone', 1, e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-white"
                        placeholder="Telephone 2"
                      />
                    </div> */}
                    
                    <div>
                      <label className="block text-sm font-extrabold text-gray-900 mb-2">WEBSITE URL</label>
                      <input
                        type="url"
                        value={formData.companyInformation.websiteUrl}
                        onChange={(e) => handleInputChange('companyInformation', 'websiteUrl', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-white"
                        placeholder="Website URL"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-extrabold text-gray-900 mb-2">FIRST NAME</label>
                      <input
                        type="text"
                        value={formData.contactInformation.firstName}
                        onChange={(e) => handleInputChange('contactInformation', 'firstName', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-white"
                        placeholder="First name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-extrabold text-gray-900 mb-2">LAST NAME</label>
                      <input
                        type="text"
                        value={formData.contactInformation.lastName}
                        onChange={(e) => handleInputChange('contactInformation', 'lastName', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-white"
                        placeholder="Last name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-extrabold text-gray-900 mb-2">POSITION</label>
                      <input
                        type="text"
                        value={formData.contactInformation.position}
                        onChange={(e) => handleInputChange('contactInformation', 'position', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-white"
                        placeholder="Position"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-extrabold text-gray-900 mb-2">EMAIL</label>
                      <input
                        type="email"
                        value={formData.contactInformation.email}
                        onChange={(e) => handleInputChange('contactInformation', 'email', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-white"
                        placeholder="Email"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-extrabold text-gray-900 mb-2">TELEPHONE</label>
                      <input
                        type="text"
                        value={formData.contactInformation.telephone[0] || ''}
                        onChange={(e) => handleArrayInputChange('contactInformation', 'telephone', 0, e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-white"
                        placeholder="Telephone 1"
                      />
                    </div>
                    
                    {/* <div>
                      <label className="block text-sm font-extrabold text-gray-900 mb-2">TELEPHONE 2</label>
                      <input
                        type="text"
                        value={formData.contactInformation.telephone[1] || ''}
                        onChange={(e) => handleArrayInputChange('contactInformation', 'telephone', 1, e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-white"
                        placeholder="Telephone 2"
                      />
                    </div> */}
                  </div>
                </div>

                {/* Other Information
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Other Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-extrabold text-gray-900 mb-2">PRIMARY MARKET SEGMENT</label>
                      <select
                        value={formData.otherInformation.primaryMarketSegment}
                        onChange={(e) => handleInputChange('otherInformation', 'primaryMarketSegment', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-white"
                      >
                        <option value="">Select market segment</option>
                        {MARKET_SEGMENTS.map((segment) => (
                          <option key={segment} value={segment}>
                            {segment}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-extrabold text-gray-900 mb-2">BUYING ORGANIZATION</label>
                      <select
                        value={formData.otherInformation.buyingOrganization}
                        onChange={(e) => handleInputChange('otherInformation', 'buyingOrganization', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-white"
                      >
                        <option value="">Select buying organization</option>
                        {BUYING_ORGANIZATIONS.map((org) => (
                          <option key={org} value={org}>
                            {org}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-extrabold text-gray-900 mb-2">TAX ID</label>
                      <input
                        type="text"
                        value={formData.otherInformation.TaxId}
                        onChange={(e) => handleInputChange('otherInformation', 'TaxId', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-white"
                        placeholder="Tax ID"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-extrabold text-gray-900 mb-2">JBT ID</label>
                      <input
                        type="text"
                        value={formData.otherInformation.JBT_id}
                        onChange={(e) => handleInputChange('otherInformation', 'JBT_id', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-white"
                        placeholder="JBT ID"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-extrabold text-gray-900 mb-2">DUNN</label>
                      <input
                        type="text"
                        value={formData.otherInformation.DUNN}
                        onChange={(e) => handleInputChange('otherInformation', 'DUNN', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-white"
                        placeholder="DUNN"
                      />
                    </div>
                  </div>
                </div> */}

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-center sm:justify-end">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full sm:w-auto px-6 py-3 border-sunrise border-2 rounded-md hover:bg-sunrise disabled:bg-gray-400 transition-colors font-medium"
                    >
                      {isUpdating ? 'Saving...' : 'Save The Changes'}
                    </button>
                  </div>
                )}
              </form>
    </AccountLayout>
  );
} 