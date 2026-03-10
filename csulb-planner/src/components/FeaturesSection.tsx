import {
  BookmarkFilledIcon,
  CheckCircledIcon,
  LayersIcon,
  LightningBoltIcon,
  MixIcon,
} from "@radix-ui/react-icons";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

const features = [
  {
    Icon: LayersIcon,
    name: "Track Your Degree",
    description:
      "Choose from Machine Learning/AI, Cybersecurity, or Software Development tracks and get a tailored course roadmap.",
    href: "#",
    cta: "Pick a track",
    background: (
      <img
        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=60"
        alt="Students studying together"
        className="absolute -right-20 -top-20 opacity-30 object-cover w-full h-full"
      />
    ),
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: CheckCircledIcon,
    name: "Prerequisite Checker",
    description:
      "Instantly see which courses are available based on what you've already completed. No more guessing.",
    href: "#",
    cta: "Check availability",
    background: (
      <img
        src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=60"
        alt="Student working on laptop"
        className="absolute -right-20 -top-20 opacity-30 object-cover w-full h-full"
      />
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: MixIcon,
    name: "GE Tracker",
    description:
      "Automatically maps major courses to GE areas so you never take a redundant class.",
    href: "#",
    cta: "View GE map",
    background: (
      <img
        src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=60"
        alt="University campus"
        className="absolute -right-20 -top-20 opacity-30 object-cover w-full h-full"
      />
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: BookmarkFilledIcon,
    name: "Semester Planner",
    description:
      "Drag courses into semesters and plan up to 4 years ahead with unit tracking.",
    href: "#",
    cta: "Plan semesters",
    background: (
      <img
        src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&q=60"
        alt="Calendar planning"
        className="absolute -right-20 -top-20 opacity-30 object-cover w-full h-full"
      />
    ),
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: LightningBoltIcon,
    name: "Smart Warnings",
    description:
      "Get notified when you're missing prerequisites, exceeding unit limits, or forgetting capstone requirements.",
    href: "#",
    cta: "See alerts",
    background: (
      <img
        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=60"
        alt="Data dashboard"
        className="absolute -right-20 -top-20 opacity-30 object-cover w-full h-full"
      />
    ),
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

export function FeaturesSection() {
  return (
    <section className="w-full px-6 py-16 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h2
            className="text-3xl font-bold text-neutral-800 mb-3"
            style={{ fontFamily: "Syne, sans-serif" }}
          >
            Everything you need to graduate on time
          </h2>
          <p className="text-neutral-500 text-base max-w-xl mx-auto">
            CSULB CS Planner takes the guesswork out of your four-year plan —
            tracks, prereqs, GEs, and semesters all in one place.
          </p>
        </div>
        <BentoGrid className="lg:grid-rows-3">
          {features.map((feature) => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
