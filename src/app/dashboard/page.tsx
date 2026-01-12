import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  const { data: projects } = await supabase
    .from('writing_projects')
    .select('*')
    .eq('user_id', session.user.id)
    .order('last_modified', { ascending: false })
    .limit(5)

  return <DashboardClient 
    userProfile={userProfile} 
    initialProjects={projects || []}
  />
}