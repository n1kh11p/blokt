import Link from 'next/link'
import Image from 'next/image'
import { Shield, BarChart3, Upload, ArrowRight, Zap, Users, Clock } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Blokt" width={36} height={36} className="h-9 w-9" />
            <span className="text-xl font-bold">Blokt</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                Reinventing Jira
                <br />
                <span className="text-primary">for Construction</span>
              </h1>
              <p className="mt-6 text-xl text-white/60 max-w-2xl mx-auto">
                The modern project management platform built specifically for construction teams.
                Track progress, manage tasks, and deliver projects on time.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="rounded-lg border border-white/20 px-6 py-3 text-base font-medium text-white hover:bg-white/10 transition-colors"
                >
                  View Demo
                </Link>
              </div>
            </div>

          </div>
        </section>


        {/* Features Section */}
        <section className="py-20 bg-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Everything you need to manage construction projects
              </h2>
              <p className="mt-4 text-white/60 max-w-2xl mx-auto">
                Purpose-built tools for the unique challenges of construction project management
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: BarChart3,
                  title: 'Real-time Analytics',
                  description: 'Track project progress, task completion rates, and team performance with live dashboards.',
                },
                {
                  icon: Users,
                  title: 'Team Management',
                  description: 'Assign tasks to crews, track workloads, and manage resources across multiple projects.',
                },
                {
                  icon: Shield,
                  title: 'Safety Compliance',
                  description: 'Monitor safety incidents, track compliance, and ensure OSHA requirements are met.',
                },
                {
                  icon: Upload,
                  title: 'Document Management',
                  description: 'Upload plans, photos, and videos. Keep all project documentation in one place.',
                },
                {
                  icon: Clock,
                  title: 'Schedule Tracking',
                  description: 'Create timelines, set milestones, and track progress against your project schedule.',
                },
                {
                  icon: Zap,
                  title: 'Procore Integration',
                  description: 'Sync seamlessly with Procore for unified project data across platforms.',
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-white/60">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-8 sm:p-12 text-center">
              <blockquote className="text-2xl sm:text-3xl font-medium max-w-3xl mx-auto">
                &ldquo;Blokt transformed how we manage our construction projects. We&apos;ve cut admin time by 60% and improved on-time delivery to 98%.&rdquo;
              </blockquote>
              <div className="mt-8">
                <p className="font-semibold">Michael Chen</p>
                <p className="text-white/60">VP of Operations, Turner Construction</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Ready to modernize your construction management?
              </h2>
              <p className="mt-4 text-white/60">
                Join thousands of construction teams already using Blokt
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-lg font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
              <p className="mt-4 text-sm text-white/40">
                No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Blokt" width={28} height={28} className="h-7 w-7" />
              <span className="font-semibold">Blokt</span>
            </div>
            <p className="text-sm text-white/40">
              © 2026 Blokt. Construction Intelligence Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
