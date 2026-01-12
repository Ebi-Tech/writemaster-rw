import { createClient } from './client'
import { Database } from '@/lib/types/database'

type Tables = Database['public']['Tables']

// User queries
export async function getUserProfile(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateUserProfile(
  userId: string, 
  updates: Partial<Tables['users']['Update']>
) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Project queries
export async function createWritingProject(
  userId: string,
  title: string,
  mode: 'essay' | 'thesis',
  essayPrompt?: string,
  thesisTopic?: string
) {
  const supabase = createClient()
  
  const { data: project, error } = await supabase
    .from('writing_projects')
    .insert({
      user_id: userId,
      title,
      mode,
      essay_prompt: essayPrompt,
      thesis_topic: thesisTopic,
      status: 'draft',
      current_stage_id: mode === 'essay' ? 'thesis_statement' : 'research_proposal'
    })
    .select()
    .single()

  if (error) throw error
  return project
}

export async function getUserProjects(userId: string, limit = 10) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('writing_projects')
    .select('*')
    .eq('user_id', userId)
    .order('last_modified', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function getProject(projectId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('writing_projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) throw error
  return data
}

// Stage progress queries
export async function getStageProgress(projectId: string, stageId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('stage_progress')
    .select('*')
    .eq('project_id', projectId)
    .eq('stage_id', stageId)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data
}

export async function updateStageContent(
  projectId: string,
  stageId: string,
  content: string,
  stageType: 'essay' | 'thesis'
) {
  const supabase = createClient()
  
  const existingStage = await getStageProgress(projectId, stageId)
  
  if (existingStage) {
    // Update existing stage
    const { data, error } = await supabase
      .from('stage_progress')
      .update({
        content,
        word_count: content.split(/\s+/).length,
        character_count: content.length,
        version: existingStage.version + 1,
        previous_content: existingStage.content,
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', existingStage.id)
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    // Create new stage
    const { data, error } = await supabase
      .from('stage_progress')
      .insert({
        project_id: projectId,
        stage_id: stageId,
        stage_type: stageType,
        title: getStageTitle(stageId),
        content,
        word_count: content.split(/\s+/).length,
        character_count: content.length,
        status: 'in_progress',
        is_unlocked: true, // First stage is always unlocked
        requirements: getStageRequirements(stageId),
        version: 1
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export async function evaluateStageRequirements(
  projectId: string,
  stageId: string,
  content: string
) {
  const supabase = createClient()
  
  // Get stage requirements
  const stage = await getStageProgress(projectId, stageId)
  if (!stage) throw new Error('Stage not found')
  
  // Simple rule-based evaluation (will be replaced with AI later)
  const requirements = stage.requirements || []
  const passedRequirements: string[] = []
  const failedRequirements: string[] = []
  
  requirements.forEach((req: any) => {
    if (req.type === 'word_count') {
      const wordCount = content.split(/\s+/).length
      if (wordCount >= req.minValue && (!req.maxValue || wordCount <= req.maxValue)) {
        passedRequirements.push(req.id)
      } else {
        failedRequirements.push(req.id)
      }
    }
    // Add more requirement checks here
  })
  
  // Update stage with evaluation results
  const { data, error } = await supabase
    .from('stage_progress')
    .update({
      passed_requirements: passedRequirements,
      failed_requirements: failedRequirements,
      is_completed: failedRequirements.length === 0,
      status: failedRequirements.length === 0 ? 'completed' : 'in_progress',
      updated_at: new Date().toISOString()
    })
    .eq('project_id', projectId)
    .eq('stage_id', stageId)
    .select()
    .single()

  if (error) throw error
  return {
    passed: passedRequirements,
    failed: failedRequirements,
    isCompleted: failedRequirements.length === 0
  }
}

// Template queries
export async function getWritingTemplates(
  mode?: 'essay' | 'thesis', 
  limit = 10
) {
  const supabase = createClient()
  
  let query = supabase
    .from('writing_templates')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (mode) {
    query = query.eq('mode', mode)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data || []
}

// Institution queries
export async function getInstitutionByDomain(domain: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('institutions')
    .select('*')
    .eq('domain', domain)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function getJoinCode(code: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('join_codes')
    .select('*, institutions(*)')
    .eq('code', code)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return data
}

// Helper functions
function getStageTitle(stageId: string): string {
  const titles: Record<string, string> = {
    'thesis_statement': 'Thesis Statement',
    'research_proposal': 'Research Proposal',
    'planning': 'Essay Plan',
    'introduction': 'Introduction',
    'literature_review': 'Literature Review',
    'methodology': 'Methodology',
    'body_paragraphs': 'Body Paragraphs',
    'conclusion': 'Conclusion',
    'abstract': 'Abstract',
    'references': 'References'
  }
  return titles[stageId] || stageId.replace('_', ' ').toUpperCase()
}

function getStageRequirements(stageId: string): any[] {
  const requirements: Record<string, any[]> = {
    'thesis_statement': [
      {
        id: 'thesis_length',
        type: 'word_count',
        minValue: 15,
        maxValue: 40,
        description: 'Thesis should be 15-40 words',
        errorMessage: 'Thesis is too short or too long'
      },
      {
        id: 'thesis_arguable',
        type: 'contains_keywords',
        requiredKeywords: ['argu', 'position', 'claim', 'assert', 'because', 'therefore'],
        description: 'Thesis must take a clear position',
        errorMessage: 'Your thesis needs to make a clear, arguable claim'
      }
    ],
    'research_proposal': [
      {
        id: 'proposal_length',
        type: 'word_count',
        minValue: 200,
        description: 'Proposal should be 200+ words',
        errorMessage: 'Proposal needs more detail (minimum 200 words)'
      },
      {
        id: 'research_question',
        type: 'contains_keywords',
        requiredKeywords: ['what', 'how', 'why', 'effect', 'impact', 'relationship', 'influence'],
        description: 'Must contain a clear research question',
        errorMessage: 'Your proposal needs a clear research question'
      }
    ],
    'planning': [
      {
        id: 'plan_points',
        type: 'word_count',
        minValue: 50,
        description: 'Plan should outline at least 3 main points',
        errorMessage: 'Your plan needs at least 3 well-developed points'
      }
    ]
  }
  return requirements[stageId] || []
}