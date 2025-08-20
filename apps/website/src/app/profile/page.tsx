'use client';

import React, { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';

const MARKET_SEGMENTS = [
  'Single Store Retailer',
  '2-5 Store Chains',
  '6-14 Store Chains',
  '15-29 Store Chains',
  '30+ Store Chains',
  'Wholesale/Distributor',
  'Buying Group',
  'Government Facilities',
  'Other',
];

const BUYING_ORGANIZATIONS = [
  'AGS - American Gem Society',
  'BIG - Buyers International Group',
  'CBG - Continental Buying Group',
  'CJG - Canadian Jewellery Group',
  'IJO - Independent Jewelers Organization',
  'LJG - Leading Jewelers Guild',
  'RJO - Retail Jewelers Organization',
  'SJO - Southeastern Jewelers Organization',
  'Other',
];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [userAccountId, setUserAccountId] = useState('');
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

  useEffect(() => {
    fetchBuyerProfile();
  }, []);

  const fetchBuyerProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const response = await fetch(`${API_URL}/api/buyers/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserAccountId(data.buyer.userAccountId || 'N/A');
        setFormData({
          companyInformation: {
            name: data.buyer.companyInformation?.name || '',
            address: data.buyer.companyInformation?.address || '',
            country: data.buyer.companyInformation?.country || '',
            state: data.buyer.companyInformation?.state || '',
            zipcode: data.buyer.companyInformation?.zipcode || '',
            telephone: data.buyer.companyInformation?.telephone || [''],
            fax: data.buyer.companyInformation?.fax || [''],
            websiteUrl: data.buyer.companyInformation?.websiteUrl || '',
          },
          contactInformation: {
            firstName: data.buyer.contactInformation?.firstName || '',
            lastName: data.buyer.contactInformation?.lastName || '',
            position: data.buyer.contactInformation?.position || '',
            email: data.buyer.contactInformation?.email || '',
            telephone: data.buyer.contactInformation?.telephone || [''],
            fax: data.buyer.contactInformation?.fax || [''],
          },
          otherInformation: {
            primaryMarketSegment: data.buyer.otherInformation?.primaryMarketSegment || '',
            buyingOrganization: data.buyer.otherInformation?.buyingOrganization || '',
            TaxId: data.buyer.otherInformation?.TaxId || '',
            JBT_id: data.buyer.otherInformation?.JBT_id || '',
            DUNN: data.buyer.otherInformation?.DUNN || '',
          },
        });
      } else {
        console.error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Main Title */}
        <div className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-orange-600 text-center">My Account</h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Left Sidebar */}
            <div className="w-64 bg-gray-100 p-6 rounded-lg">
              <h2 className="font-bold text-gray-900 mb-4">Account ID: {userAccountId}</h2>
              <hr className="border-gray-300 mb-4" />
              <nav className="space-y-2">
                <a href="#" className="block text-gray-700 hover:text-orange-600 font-medium">Account</a>
                <a href="/orders" className="block text-gray-600 hover:text-orange-600">Orders</a>
                <button 
                  onClick={() => {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                  }}
                  className="block text-gray-600 hover:text-orange-600"
                >
                  Log Out
                </button>
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white p-8 rounded-lg shadow-sm">
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">COMPANY NAME</label>
                      <input
                        type="text"
                        value={formData.companyInformation.name}
                        onChange={(e) => handleInputChange('companyInformation', 'name', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        placeholder="Company name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ADDRESS</label>
                      <input
                        type="text"
                        value={formData.companyInformation.address}
                        onChange={(e) => handleInputChange('companyInformation', 'address', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        placeholder="Address"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">COUNTRY</label>
                      <input
                        type="text"
                        value={formData.companyInformation.country}
                        onChange={(e) => handleInputChange('companyInformation', 'country', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        placeholder="Country"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">TELEPHONE 1</label>
                      <input
                        type="text"
                        value={formData.companyInformation.telephone[0] || ''}
                        onChange={(e) => handleArrayInputChange('companyInformation', 'telephone', 0, e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        placeholder="Telephone 1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">FAX</label>
                      <input
                        type="text"
                        value={formData.companyInformation.fax[0] || ''}
                        onChange={(e) => handleArrayInputChange('companyInformation', 'fax', 0, e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        placeholder="Fax"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">STATE</label>
                        <input
                          type="text"
                          value={formData.companyInformation.state}
                          onChange={(e) => handleInputChange('companyInformation', 'state', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                          placeholder="State"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ZIP CODE</label>
                        <input
                          type="text"
                          value={formData.companyInformation.zipcode}
                          onChange={(e) => handleInputChange('companyInformation', 'zipcode', e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                          placeholder="ZIP Code"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">TELEPHONE 2</label>
                      <input
                        type="text"
                        value={formData.companyInformation.telephone[1] || ''}
                        onChange={(e) => handleArrayInputChange('companyInformation', 'telephone', 1, e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        placeholder="Telephone 2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">WEBSITE URL</label>
                      <input
                        type="url"
                        value={formData.companyInformation.websiteUrl}
                        onChange={(e) => handleInputChange('companyInformation', 'websiteUrl', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">FIRST NAME</label>
                      <input
                        type="text"
                        value={formData.contactInformation.firstName}
                        onChange={(e) => handleInputChange('contactInformation', 'firstName', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        placeholder="First name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">LAST NAME</label>
                      <input
                        type="text"
                        value={formData.contactInformation.lastName}
                        onChange={(e) => handleInputChange('contactInformation', 'lastName', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        placeholder="Last name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">POSITION</label>
                      <input
                        type="text"
                        value={formData.contactInformation.position}
                        onChange={(e) => handleInputChange('contactInformation', 'position', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        placeholder="Position"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">EMAIL</label>
                      <input
                        type="email"
                        value={formData.contactInformation.email}
                        onChange={(e) => handleInputChange('contactInformation', 'email', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        placeholder="Email"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">TELEPHONE 1</label>
                      <input
                        type="text"
                        value={formData.contactInformation.telephone[0] || ''}
                        onChange={(e) => handleArrayInputChange('contactInformation', 'telephone', 0, e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        placeholder="Telephone 1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">FAX</label>
                      <input
                        type="text"
                        value={formData.contactInformation.fax[0] || ''}
                        onChange={(e) => handleArrayInputChange('contactInformation', 'fax', 0, e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        placeholder="Fax"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">TELEPHONE 2</label>
                      <input
                        type="text"
                        value={formData.contactInformation.telephone[1] || ''}
                        onChange={(e) => handleArrayInputChange('contactInformation', 'telephone', 1, e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        placeholder="Telephone 2"
                      />
                    </div>
                  </div>
                </div>

                {/* Other Information */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Other Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PRIMARY MARKET SEGMENT</label>
                      <select
                        value={formData.otherInformation.primaryMarketSegment}
                        onChange={(e) => handleInputChange('otherInformation', 'primaryMarketSegment', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">BUYING ORGANIZATION</label>
                      <select
                        value={formData.otherInformation.buyingOrganization}
                        onChange={(e) => handleInputChange('otherInformation', 'buyingOrganization', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">TAX ID</label>
                      <input
                        type="text"
                        value={formData.otherInformation.TaxId}
                        onChange={(e) => handleInputChange('otherInformation', 'TaxId', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        placeholder="Tax ID"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">JBT ID</label>
                      <input
                        type="text"
                        value={formData.otherInformation.JBT_id}
                        onChange={(e) => handleInputChange('otherInformation', 'JBT_id', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        placeholder="JBT ID"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">DUNN</label>
                      <input
                        type="text"
                        value={formData.otherInformation.DUNN}
                        onChange={(e) => handleInputChange('otherInformation', 'DUNN', e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        placeholder="DUNN"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-6 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 transition-colors font-medium"
                    >
                      {isUpdating ? 'Saving...' : 'Save The Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 