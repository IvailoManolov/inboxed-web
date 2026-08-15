import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { Problem } from "@/components/problem";
import { HowItWorks } from "@/components/how-it-works";
import { ScoreGuide } from "@/components/score-guide";
import { FlagDemo } from "@/components/flag-demo";
import { LiveDemo } from "@/components/live-demo";
import { FounderStory } from "@/components/founder-story";
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
        <ScoreGuide />
        <FlagDemo />
        <LiveDemo />
        <FounderStory />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
