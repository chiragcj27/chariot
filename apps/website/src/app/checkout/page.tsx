'use client'


import Link from 'next/link'
import { ArrowLeft, FileText, Calendar, CreditCard, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CheckoutPage() {
  const paymentMethod = 'Credit Card/Debit Card'

  // Mock data - in real app this would come from cart/order context
  const orderData = {
    orderNumber: 'ORD-2025-001',
    orderDate: '1 Aug 2025',
    status: 'Payment Pending',
    items: [
      { id: 1, name: 'Product Name', category: 'Product Category', price: 80, image: 'https://placehold.co/80x80' },
      { id: 2, name: 'Product Name', category: 'Product Category', price: 80, image: 'https://placehold.co/80x80' },
      { id: 3, name: 'Product Name', category: 'Product Category', price: 80, image: 'https://placehold.co/80x80' },
      { id: 4, name: 'Product Name', category: 'Product Category', price: 80, image: 'https://placehold.co/80x80' },
    ],
    subtotal: 80,
    tax: 10,
    total: 90
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Link>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center text-sm text-gray-600">
              <FileText className="w-4 h-4 mr-2" />
              Order number
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {orderData.orderDate}
            </div>
            <div className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
              {orderData.status}
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Total Payment</span>
              <span className="font-semibold text-lg">${orderData.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Payment Method</span>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">{paymentMethod}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                size="lg"
              >
                Continue with Payment
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Order Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Order</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">${item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary Section */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="text-gray-900">${orderData.subtotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Tax</span>
                <span className="text-gray-900">${orderData.tax}</span>
              </div>
              <div className="border-t pt-3 flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-semibold text-lg text-gray-900">${orderData.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex justify-center">
          <Link href="/">
            <Button 
              variant="outline" 
              className="border-orange-500 text-orange-500 hover:bg-orange-50"
              size="lg"
            >
              Back To Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
