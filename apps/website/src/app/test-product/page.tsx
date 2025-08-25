'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TestProductPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to a sample product page
    router.push('/product/fjasfjksanfjkasngjkadngjad')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to product page...</p>
      </div>
    </div>
  )
}
