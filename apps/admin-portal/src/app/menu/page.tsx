import { Suspense } from "react"
import { MegaMenuManager } from "@/components/mega-menu-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import DashboardLayout from "@/components/layout/dashboard-layout"

function LoadingSkeleton() {
  return (
    <DashboardLayout>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
    </DashboardLayout>
  )
}

export default function MegaMenuSettingsPage() {
  return (
    <DashboardLayout>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-8 space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Mega Menu Settings
            </h1>
            <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
              Organize your menu hierarchy with categories, subcategories, and featured items. Create a seamless
              navigation experience for your users.
            </p>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-b">
            <CardTitle className="text-xl font-semibold">Menu Structure</CardTitle>
            <CardDescription className="text-base">
              Build and manage your complete menu hierarchy with drag-and-drop simplicity.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Suspense fallback={<LoadingSkeleton />}>
              <MegaMenuManager />
            </Suspense>
          </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
