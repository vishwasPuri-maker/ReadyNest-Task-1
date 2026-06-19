import Link from "next/link";
import Navbar from "@/components/Navbar";

const whatYouCanBuild = [
  {
    title: "Registration Forms",
    desc: "Create student registrations, event signups, and membership applications.",
  },
  {
    title: "Feedback Forms",
    desc: "Collect valuable feedback from users, customers, and students.",
  },
  {
    title: "Survey Forms",
    desc: "Design surveys with multiple question types.",
  },
  {
    title: "Job Application Forms",
    desc: "Gather applicant information and manage responses from one place.",
  },
];

const howItWorks = [
  {
    title: "1. Create an Account",
    desc: "Sign up and access your personal dashboard.",
  },
  {
    title: "2. Build Your Form",
    desc: "Add text fields, dropdowns, radio buttons, checkboxes, dates, and more.",
  },
  {
    title: "3. Publish & Share",
    desc: "Generate a public link and share it with anyone.",
  },
  {
    title: "4. Collect Responses",
    desc: "Receive and manage submissions in real time from your dashboard.",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero — hovering the CENTER TEXT reveals the form graphic + the two columns */}
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6">
        {/* group = the centered text block; only hovering it triggers the reveal */}
        <div className="group relative animate-fade-up">
          {/* Background form graphic (blurred, sharpens on hover) */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 w-[min(94vw,620px)] -translate-x-1/2 -translate-y-1/2 scale-110 opacity-15 blur-md transition-all duration-700 ease-out animate-float group-hover:scale-100 group-hover:opacity-50 group-hover:blur-[1.5px]"
          >
            <FormMockup />
          </div>

          {/* Left column: What You Can Build (to the left of the text) */}
          <div className="pointer-events-none absolute right-full top-1/2 mr-16 hidden w-72 -translate-y-1/2 -translate-x-6 flex-col gap-6 text-left opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100 lg:flex">
            <SectionLabel>What You Can Build</SectionLabel>
            {whatYouCanBuild.map((item) => (
              <Point key={item.title} title={item.title} desc={item.desc} />
            ))}
          </div>

          {/* Right column: How It Works (to the right of the text) */}
          <div className="pointer-events-none absolute left-full top-1/2 ml-16 hidden w-72 -translate-y-1/2 translate-x-6 flex-col gap-6 text-left opacity-0 transition-all duration-500 ease-out group-hover:translate-x-0 group-hover:opacity-100 lg:flex">
            <SectionLabel>How It Works</SectionLabel>
            {howItWorks.map((item) => (
              <Point key={item.title} title={item.title} desc={item.desc} />
            ))}
          </div>

          {/* Centered text (the hover target) */}
          <div className="relative z-10 max-w-2xl text-center">
            <h1 className="text-5xl font-bold leading-tight sm:text-7xl">
              Build Forms
              <br />
              Effortlessly
            </h1>
            <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-muted">
              Create custom forms in minutes — add any field you need, publish
              with a single click, and share a link anyone can fill without
              signing up.
            </p>
            <Link
              href="/signup"
              className="mt-9 inline-block rounded-full bg-accent px-8 py-3.5 text-xs font-semibold tracking-widest text-accent-foreground transition-transform hover:scale-105"
            >
              GET STARTED
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-semibold uppercase tracking-widest text-muted">
      {children}
    </div>
  );
}

function Point({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-foreground">→</span>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="mt-1 text-xs leading-relaxed text-muted">{desc}</div>
      </div>
    </div>
  );
}

/* A sign-up style form used purely as the background graphic */
function FormMockup() {
  return (
    <div className="rounded-3xl border border-border bg-surface p-10">
      <div className="mb-8 text-center text-3xl font-bold">Sign Up</div>
      <div className="space-y-7">
        <MockField label="Username" />
        <MockField label="Email" />
        <MockField label="Password" />
        <div className="mt-3 h-14 rounded-full bg-accent" />
      </div>
    </div>
  );
}

function MockField({ label }: { label: string }) {
  return (
    <div>
      <div className="mb-2 text-sm text-muted">{label}</div>
      <div className="h-12 rounded-lg border border-border bg-input" />
    </div>
  );
}
