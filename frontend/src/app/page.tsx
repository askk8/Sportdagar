import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SportsShowcase } from "@/components/landing/SportsShowcase";
import { UpcomingActivities } from "@/components/landing/UpcomingActivities";
import { CallToAction } from "@/components/landing/CallToAction";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <SportsShowcase />
        <UpcomingActivities />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
