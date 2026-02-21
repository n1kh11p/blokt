import Link from 'next/link'
import { HardHat, Shield, BarChart3, Upload, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <header className="border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
              <HardHat className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-stone-900 dark:text-white">Blokt</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl lg:text-6xl dark:text-white">
              Construction Intelligence
              <br />
              <span className="text-amber-500">Powered by AI</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-600 dark:text-stone-400">
              Transform field activity into structured, actionable data. Automate documentation,
              improve safety compliance, and gain real-time visibility into project execution.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-base font-medium text-white hover:bg-amber-600"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-stone-300 px-6 py-3 text-base font-medium text-stone-700 hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-stone-200 bg-white py-20 dark:border-stone-800 dark:bg-stone-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-stone-900 dark:text-white">
                Everything you need for field intelligence
              </h2>
              <p className="mt-4 text-stone-600 dark:text-stone-400">
                Built for construction teams who want to understand what&apos;s really happening on site
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 dark:border-stone-700 dark:bg-stone-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Upload className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-white">
                  Easy Upload
                </h3>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                  Workers upload bodycam footage with simple task tagging for automated documentation
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 dark:border-stone-700 dark:bg-stone-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-white">
                  Execution Analytics
                </h3>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                  Compare planned vs actual work with alignment scores and efficiency metrics
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 dark:border-stone-700 dark:bg-stone-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                  <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-white">
                  Safety Monitoring
                </h3>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                  AI-powered OSHA compliance detection with real-time alerts and trend reporting
                </p>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 dark:border-stone-700 dark:bg-stone-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-white">
                  Procore Integration
                </h3>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                  Sync with your existing Procore projects, schedules, and daily logs seamlessly
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-amber-500 p-8 text-center sm:p-12">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Ready to transform your field operations?
              </h2>
              <p className="mt-4 text-amber-100">
                Join construction teams already using Blokt to improve execution and safety
              </p>
              <Link
                href="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-medium text-amber-600 hover:bg-amber-50"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 bg-white py-8 dark:border-stone-800 dark:bg-stone-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-500">
                <HardHat className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-stone-900 dark:text-white">Blokt</span>
            </div>
            <p className="text-sm text-stone-500">
              © 2026 Blokt. Construction Intelligence Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
