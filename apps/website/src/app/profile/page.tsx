'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3001/api/buyers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        updateUser(data.user);
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-400 to-orange-600 px-6 py-8">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-orange-600 font-bold text-2xl">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{user?.name}</h1>
                  <p className="text-orange-100">{user?.email}</p>
                  <p className="text-orange-100 font-medium">
                    Credits: {user?.credits}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-8">
              {message && (
                <div className={`mb-6 p-4 rounded-md ${
                  message.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Information */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                      <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-orange-600 hover:text-orange-700 font-medium"
                      >
                        {isEditing ? 'Cancel' : 'Edit'}
                      </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                        />
                      </div>

                      {isEditing && (
                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
                          >
                            {isUpdating ? 'Updating...' : 'Save Changes'}
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                </div>

                {/* Account Stats */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Stats</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Member Since</span>
                        <span className="font-medium">2024</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Orders</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Wishlist Items</span>
                        <span className="font-medium">0</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-orange-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <a
                        href="/orders"
                        className="block w-full text-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                      >
                        View Orders
                      </a>
                      <a
                        href="/wishlist"
                        className="block w-full text-center px-4 py-2 border border-orange-600 text-orange-600 rounded-md hover:bg-orange-50 transition-colors"
                      >
                        View Wishlist
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 