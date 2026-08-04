import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Problem } from "@/components/problem";
import { HowItWorks } from "@/components/how-it-works";
import { LiveDemo } from "@/components/live-demo";
import { Pricing } from "@/components/pricing";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <Problem />
        <HowItWorks />
        <LiveDemo />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
