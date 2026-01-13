import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import EssayEditor from '../components/EssayEditor'

export default async function EssayProjectPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Get the essay project
  const { data: project, error } = await supabase
    .from('writing_projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single()

  if (error || !project) {
    notFound()
  }

  // Get all stages for this project
  const { data: stages } = await supabase
    .from('stage_progress')
    .select('*')
    .eq('project_id', id)
    .order('stage_id')

  return <EssayEditor project={project} initialStages={stages || []} />
}