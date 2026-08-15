import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { FounderStory } from "@/components/founder-story";

export const metadata: Metadata = {
  title: "The story behind HitSend | HitSend",
  description:
    "Why I built HitSend - from cold emails that vanished into spam to a tool that finally made them land.",
};

export default function StoryPage() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <FounderStory />
      </main>
      <Footer />
    </>
  );
}
