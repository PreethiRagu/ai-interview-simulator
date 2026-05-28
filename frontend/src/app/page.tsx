// Using relative paths to avoid alias configuration issues
import { Navbar } from "../components/landing/Navbar";
import { Hero } from "../components/landing/Hero";
import { Features } from "../components/landing/Features";
import { DemoPreview } from "../components/landing/DemoPreview";
import { Footer } from "../components/landing/Footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="px-6 max-w-7xl mx-auto">
        <Hero />
        <Features />
        <DemoPreview />
      </div>
      <Footer />
    </main>
  );
}