import BannerSettings from "@/components/landing/banner-settings";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function LandingPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold">Landing Page Configuration</h1>
        <BannerSettings />
      </div>
    </DashboardLayout>
  );
}   