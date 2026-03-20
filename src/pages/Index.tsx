import { Link } from "react-router-dom";
import { Shield, Zap, BookOpen, MessageSquare, Search, CheckCircle, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/LandingNav";
import { MedicalDisclaimer } from "@/components/MedicalDisclaimer";
import { ScrollReveal } from "@/components/ScrollReveal";

const features = [
  {
    icon: MessageSquare,
    title: "AI-Powered Answers",
    description: "Get instant, evidence-based health information powered by advanced language models.",
  },
  {
    icon: BookOpen,
    title: "Source-Based Responses",
    description: "Every answer references trusted medical literature so you can verify the information.",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description: "Your conversations are encrypted and never shared. Your health data stays yours.",
  },
  {
    icon: Zap,
    title: "Instant Availability",
    description: "Available 24/7 with no wait times. Get health guidance whenever you need it.",
  },
];

const steps = [
  { number: "01", title: "Ask your question", description: "Type any health-related question in plain language." },
  { number: "02", title: "AI researches", description: "Our system searches trusted medical databases in seconds." },
  { number: "03", title: "Get clear answers", description: "Receive easy-to-understand information with source references." },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative flex flex-col items-center py-24 text-center md:py-36 lg:py-44">
          <ScrollReveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
              <Activity className="h-3.5 w-3.5 text-primary" />
              Trusted by healthcare professionals
            </div>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] text-foreground text-balance md:text-5xl lg:text-6xl">
              Your Intelligent Medical Assistant
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={160}>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed text-pretty">
              Get reliable, evidence-based health information instantly. Ask questions in plain language and receive clear, sourced answers.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={240}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/chat">
                <Button variant="hero" size="lg">
                  <MessageSquare className="h-5 w-5" />
                  Start a Conversation
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="hero-outline" size="lg">Create Free Account</Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 bg-card/50 py-20 md:py-28">
        <div className="container">
          <ScrollReveal>
            <div className="mx-auto max-w-lg text-center">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">Built for Trust & Clarity</h2>
              <p className="mt-4 text-muted-foreground">Designed with healthcare principles at its core.</p>
            </div>
          </ScrollReveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 80}>
                <div className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28">
        <div className="container">
          <ScrollReveal>
            <div className="mx-auto max-w-lg text-center">
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">How It Works</h2>
              <p className="mt-4 text-muted-foreground">Three simple steps to reliable health information.</p>
            </div>
          </ScrollReveal>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {steps.map((s, i) => (
              <ScrollReveal key={s.number} delay={i * 100}>
                <div className="relative flex flex-col items-center text-center">
                  <span className="mb-4 text-5xl font-bold text-primary/15">{s.number}</span>
                  <h3 className="text-lg font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 max-w-xs text-sm text-muted-foreground">{s.description}</p>
                  {i < steps.length - 1 && (
                    <div className="absolute right-0 top-8 hidden h-px w-16 bg-border md:block lg:w-24" style={{ transform: "translateX(100%)" }} />
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50 bg-card/50 py-20 md:py-28">
        <div className="container">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <Search className="mx-auto mb-6 h-10 w-10 text-primary/60" />
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">Ready to Get Answers?</h2>
              <p className="mt-4 text-muted-foreground">Start your first conversation — no account required.</p>
              <Link to="/chat">
                <Button variant="hero" size="lg" className="mt-8">
                  <CheckCircle className="h-5 w-5" />
                  Try MedAssist AI
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-10">
        <div className="container space-y-6">
          <MedicalDisclaimer />
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">MedAssist AI</span>
            </div>
            <p>© {new Date().getFullYear()} MedAssist AI. For informational purposes only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
