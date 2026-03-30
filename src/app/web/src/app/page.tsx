import { Navigation } from "../components/landing/Navigation";
import { Hero } from "../components/landing/Hero";
import { Stats } from "../components/landing/Stats";
import { Features } from "../components/landing/Features";
import { Pricing } from "../components/landing/Pricing";
import { CTA } from "../components/landing/CTA";
import { Footer } from "../components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen font-body flex flex-col bg-background">
      <Navigation />
      <Hero />
      <Stats />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
