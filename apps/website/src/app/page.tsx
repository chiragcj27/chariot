import ProjectCards from "@/components/ProjectCards";
import CallToAction from "@/components/CallToAction";
import WhoWeAre from "@/components/WhoWeAre";
import SubscriptionCards from "@/components/SubscriptionCards";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="flex flex-col px-15 py-30">
        <h1 className="text-7xl text-sunrise/80 font-bold">Timeless</h1>
        <h1 className="text-7xl text-sunrise/80 font-bold">Elegance </h1>
        <p className="py-8 text-2xl font-secondary">Discover our exquisite collection of handcrafted jewelry <br /> designed to captivate for generations</p>
      </div>
      {/* Projects Section */}
      <div className="flex flex-col items-center justify-center">
        <ProjectCards />
        <ProjectCards />
        <ProjectCards />
      </div>
      {/* What We Do Section */}
      <div className="flex flex-col md:flex-row mt-24 p-8">
        <div className="w-full md:w-1/4 mb-8 md:mb-0">
          <span className="text-sunrise text-xl font-secondary font-bold">What we do</span>
        </div>
        <div className="w-full md:w-3/4">
          <h2 className="text-5xl md:text-6xl font-bold mb-12">
            Full-scale design projects <span className="italic">for tech companies</span><br />
            that launch, raise funding, go global and<br />
            become enterprises
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-4xl font-bold mb-2">1. Branding</h3>
              <div className="border-b-2 mb-2" />
              <p className="text-gray-400 font-secondary text-lg">With outstanding ideas and metaphors at the heart of each brand concept</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">2. Websites</h3>
              <div className="border-b-2 border-gray-200 mb-2" />
              <p className="text-gray-400 font-secondary text-lg">Right words, catchy visuals and great conversion rates</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">3. Development</h3>
              <div className="border-b-2 border-gray-200 mb-2" />
              <p className="text-gray-400 font-secondary text-lg">Webflow, Wordpress, React and other custom code solutions</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">4. Design support</h3>
              <div className="border-b-2 border-gray-200 mb-2" />
              <p className="text-gray-400 font-secondary text-lg">UI-UX design, explainer videos, marketing materials, you name it</p>
            </div>
          </div>
        </div>
      </div>
      {/* Who we are Section */}
      <WhoWeAre />
      {/* Call to Action Section */}
      <CallToAction />
      {/* Subscription Plans Section */}
      <SubscriptionCards />
      {/* Footer Section */}
      <Footer />
    </div>
  );
}
