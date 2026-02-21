import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import type { Profile } from '@/types/database'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <div className="hidden md:block">
        <Sidebar userRole={(profile as Profile | null)?.role} />
      </div>

      <div className="md:pl-64">
        <div className="flex items-center gap-4 border-b border-stone-200 bg-white px-4 md:hidden dark:border-stone-800 dark:bg-stone-950">
          <MobileNav userRole={(profile as Profile | null)?.role} />
        </div>
        
        <Header profile={profile as Profile | null} />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
