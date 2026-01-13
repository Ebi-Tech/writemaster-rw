import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Get or create user profile
  let userProfile = null
  const { data: existingProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!existingProfile) {
    // Create profile if it doesn't exist
    const { data: newProfile } = await supabase
      .from('users')
      .insert({
        id: session.user.id,
        email: session.user.email!,
        role: session.user.email?.includes('@ur.ac.rw') || session.user.email?.includes('@ac.rw') 
          ? 'institution' 
          : 'student',
        institution_domain: session.user.email?.split('@')[1] || null
      })
      .select()
      .single()
    
    userProfile = newProfile
  } else {
    userProfile = existingProfile
  }

  // Get user's projects
  const { data: projects } = await supabase
    .from('writing_projects')
    .select('*')
    .eq('user_id', session.user.id)
    .order('last_modified', { ascending: false })
    .limit(5)

  return <DashboardClient 
    userProfile={userProfile}
    initialProjects={projects || []}
    session={session}
  />
}