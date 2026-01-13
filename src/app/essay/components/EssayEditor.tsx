'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import StageProgress from './StageProgress'
import RequirementsCheck from './RequirementsCheck'
import { 
  ArrowLeft, FileText, Lock, Unlock, CheckCircle, 
  Edit, Save, HelpCircle, ChevronRight
} from 'lucide-react'
import Link from 'next/link'

const ESSAY_STAGES = [
  { id: 'thesis_statement', title: 'Thesis Statement', description: 'Create a clear, arguable thesis' },
  { id: 'planning', title: 'Essay Plan', description: 'Outline your main arguments and evidence' },
  { id: 'introduction', title: 'Introduction', description: 'Introduce your topic and thesis' },
  { id: 'body_paragraphs', title: 'Body Paragraphs', description: 'Develop your arguments with evidence' },
  { id: 'conclusion', title: 'Conclusion', description: 'Summarize and show significance' }
]

type Project = {
  id: string
  title: string
  mode: 'essay' | 'thesis'
  status: string
  essay_prompt: string | null
  current_stage_id: string
  overall_score: number | null
}

type Stage = {
  id: string
  project_id: string
  stage_id: string
  content: string | null
  status: string
  is_unlocked: boolean
  is_completed: boolean
  requirements: any
  passed_requirements: string[]
  failed_requirements: string[]
  ai_feedback: string | null
}

export default function EssayEditor({ 
  project, 
  initialStages 
}: { 
  project: Project
  initialStages: Stage[]
}) {
  const router = useRouter()
  const supabase = createClient()
  
  const [currentStageId, setCurrentStageId] = useState(project.current_stage_id)
  const [stages, setStages] = useState<Stage[]>(initialStages)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  const currentStage = stages.find(s => s.stage_id === currentStageId)
  const currentStageIndex = ESSAY_STAGES.findIndex(s => s.id === currentStageId)

  useEffect(() => {
    if (currentStage) {
      setContent(currentStage.content || '')
      setWordCount(currentStage.content?.split(/\s+/).length || 0)
    }
  }, [currentStage])

  const handleSave = async () => {
    if (!currentStage) return
    
    setSaving(true)
    try {
      const { error } = await supabase
        .from('stage_progress')
        .update({
          content,
          word_count: wordCount,
          character_count: content.length,
          status: content ? 'in_progress' : 'unlocked',
          updated_at: new Date().toISOString()
        })
        .eq('project_id', project.id)
        .eq('stage_id', currentStageId)

      if (error) throw error

      // Update local state
      setStages(stages.map(s => 
        s.stage_id === currentStageId 
          ? { ...s, content, status: content ? 'in_progress' : 'unlocked' }
          : s
      ))

    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCheckRequirements = async () => {
    if (!currentStage || !content.trim()) {
      alert('Please write something before checking requirements')
      return
    }
    
    setChecking(true)
    try {
      // First, save the content
      await handleSave()

      // Then check requirements via our Next.js API
      const response = await fetch('/api/check-requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          stageId: currentStageId,
          content,
          requirements: currentStage.requirements
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to check requirements')
      }

      const data = await response.json()

      // Update stage with results
      const { error: updateError } = await supabase
        .from('stage_progress')
        .update({
          passed_requirements: data.passedRequirements || [],
          failed_requirements: data.failedRequirements || [],
          is_completed: data.isCompleted || false,
          ai_feedback: data.feedback || null,
          status: data.isCompleted ? 'completed' : 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('project_id', project.id)
        .eq('stage_id', currentStageId)

      if (updateError) throw updateError

      // Update local state
      setStages(stages.map(s => 
        s.stage_id === currentStageId 
          ? { 
              ...s, 
              passed_requirements: data.passedRequirements || [],
              failed_requirements: data.failedRequirements || [],
              is_completed: data.isCompleted || false,
              ai_feedback: data.feedback || null,
              status: data.isCompleted ? 'completed' : 'in_progress'
            }
          : s
      ))

      // If completed, unlock next stage
      if (data.isCompleted && currentStageIndex < ESSAY_STAGES.length - 1) {
        const nextStageId = ESSAY_STAGES[currentStageIndex + 1].id
        await unlockNextStage(nextStageId)
        
        // Show success message
        alert('🎉 Stage completed! Next stage unlocked.')
      } else if (!data.isCompleted) {
        alert('📝 Requirements not fully met. Check the feedback below.')
      }

    } catch (error: any) {
      console.error('Failed to check requirements:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setChecking(false)
    }
  }

  const unlockNextStage = async (nextStageId: string) => {
    try {
      // Check if next stage already exists
      const existingStage = stages.find(s => s.stage_id === nextStageId)
      
      if (!existingStage) {
        // Create next stage
        const { error } = await supabase
          .from('stage_progress')
          .insert({
            project_id: project.id,
            stage_id: nextStageId,
            stage_type: 'essay',
            title: ESSAY_STAGES.find(s => s.id === nextStageId)?.title || 'Next Stage',
            status: 'unlocked',
            is_unlocked: true,
            requirements: getStageRequirements(nextStageId)
          })

        if (error) throw error

        // Add to local state
        setStages([
          ...stages,
          {
            id: `new-${nextStageId}`,
            project_id: project.id,
            stage_id: nextStageId,
            content: null,
            status: 'unlocked',
            is_unlocked: true,
            is_completed: false,
            requirements: getStageRequirements(nextStageId),
            passed_requirements: [],
            failed_requirements: [],
            ai_feedback: null
          }
        ])
      }

      // Update project current stage
      const { error: projectError } = await supabase
        .from('writing_projects')
        .update({ 
          current_stage_id: nextStageId,
          last_modified: new Date().toISOString()
        })
        .eq('id', project.id)

      if (projectError) throw projectError

      // Update local current stage
      setCurrentStageId(nextStageId)

    } catch (error) {
      console.error('Failed to unlock next stage:', error)
    }
  }

  const getStageRequirements = (stageId: string): any[] => {
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
      'planning': [
        {
          id: 'plan_length',
          type: 'word_count',
          minValue: 50,
          description: 'Plan should outline at least 3 main points',
          errorMessage: 'Your plan needs more detail (minimum 50 words)'
        }
      ],
      'introduction': [
        {
          id: 'intro_length',
          type: 'word_count',
          minValue: 80,
          maxValue: 150,
          description: 'Introduction should be 80-150 words',
          errorMessage: 'Introduction is too short or too long'
        }
      ],
      'body_paragraphs': [
        {
          id: 'body_length',
          type: 'word_count',
          minValue: 300,
          description: 'Body paragraphs should be at least 300 words',
          errorMessage: 'Body paragraphs need more development (minimum 300 words)'
        }
      ],
      'conclusion': [
        {
          id: 'conclusion_length',
          type: 'word_count',
          minValue: 80,
          maxValue: 150,
          description: 'Conclusion should be 80-150 words',
          errorMessage: 'Conclusion is too short or too long'
        }
      ]
    }
    return requirements[stageId] || []
  }

  const canProceed = currentStage?.is_completed

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/essay" 
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{project.title}</h1>
                <p className="text-sm text-gray-600">
                  {ESSAY_STAGES.find(s => s.id === currentStageId)?.title}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-sm text-gray-600">
                {wordCount} words
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Stage Progress */}
          <div className="lg:col-span-1">
            <StageProgress
              stages={ESSAY_STAGES}
              currentStageId={currentStageId}
              stageStatus={stages.reduce((acc, stage) => ({
                ...acc,
                [stage.stage_id]: {
                  isUnlocked: stage.is_unlocked,
                  isCompleted: stage.is_completed
                }
              }), {})}
              onStageSelect={setCurrentStageId}
            />
          </div>

          {/* Main Editor Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              {/* Editor Header */}
              <div className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {ESSAY_STAGES.find(s => s.id === currentStageId)?.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {ESSAY_STAGES.find(s => s.id === currentStageId)?.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {currentStage?.is_completed && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </span>
                    )}
                    {currentStage?.is_unlocked && !currentStage?.is_completed && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Edit className="h-3 w-3 mr-1" />
                        In Progress
                      </span>
                    )}
                    {!currentStage?.is_unlocked && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <Lock className="h-3 w-3 mr-1" />
                        Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Essay Prompt (if on thesis stage) */}
              {currentStageId === 'thesis_statement' && project.essay_prompt && (
                <div className="border-b px-6 py-4 bg-blue-50">
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1">Essay Prompt</h3>
                      <p className="text-blue-800">{project.essay_prompt}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Editor Content */}
              <div className="p-6">
                {currentStage?.is_unlocked ? (
                  <>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your {ESSAY_STAGES.find(s => s.id === currentStageId)?.title}
                        <span className="text-gray-500 ml-2">({wordCount} words)</span>
                      </label>
                      <textarea
                        value={content}
                        onChange={(e) => {
                          setContent(e.target.value)
                          setWordCount(e.target.value.split(/\s+/).length)
                        }}
                        className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder={`Start writing your ${ESSAY_STAGES.find(s => s.id === currentStageId)?.title?.toLowerCase()}...`}
                        disabled={currentStage?.is_completed}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handleCheckRequirements}
                          disabled={checking || !content.trim() || currentStage?.is_completed}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium"
                        >
                          {checking ? 'Checking...' : 'Check Requirements'}
                        </button>
                        
                        <button
                          onClick={handleSave}
                          disabled={saving || currentStage?.is_completed}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save Draft'}
                        </button>
                      </div>

                      {canProceed && currentStageIndex < ESSAY_STAGES.length - 1 && (
                        <button
                          onClick={() => {
                            const nextStageId = ESSAY_STAGES[currentStageIndex + 1].id
                            unlockNextStage(nextStageId)
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center"
                        >
                          Next Stage
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Stage Locked</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Complete the previous stage to unlock {ESSAY_STAGES.find(s => s.id === currentStageId)?.title}
                    </p>
                    {currentStageIndex > 0 && (
                      <button
                        onClick={() => setCurrentStageId(ESSAY_STAGES[currentStageIndex - 1].id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        Go to Previous Stage
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Requirements & Feedback */}
              {currentStage && (
                <div className="border-t">
                  <RequirementsCheck
                    stage={currentStage}
                    content={content}
                    wordCount={wordCount}
                  />
                </div>
              )}
            </div>

            {/* Help Section */}
            <div className="mt-6 bg-white rounded-xl border p-6">
              <div className="flex items-start">
                <HelpCircle className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Tips for This Stage</h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    {currentStageId === 'thesis_statement' && (
                      <>
                        <p>• Your thesis should clearly state your position on the topic</p>
                        <p>• Make sure it's arguable - someone could reasonably disagree</p>
                        <p>• Keep it specific and focused (15-40 words)</p>
                        <p>• Example: "While technology can isolate individuals, its benefits for Rwandan communities outweigh the drawbacks through improved education access and economic opportunities."</p>
                      </>
                    )}
                    {currentStageId === 'planning' && (
                      <>
                        <p>• List your main arguments that support your thesis</p>
                        <p>• For each argument, note the evidence you'll use</p>
                        <p>• Plan the logical flow of your essay</p>
                        <p>• Aim for 3-5 main points with supporting evidence</p>
                      </>
                    )}
                    {currentStageId === 'introduction' && (
                      <>
                        <p>• Start with a hook to engage the reader</p>
                        <p>• Provide necessary background information</p>
                        <p>• Clearly state your thesis</p>
                        <p>• Outline the structure of your essay</p>
                      </>
                    )}
                    {currentStageId === 'body_paragraphs' && (
                      <>
                        <p>• Start each paragraph with a topic sentence</p>
                        <p>• Provide evidence and examples to support your points</p>
                        <p>• Explain how the evidence supports your argument</p>
                        <p>• Use transition words to connect paragraphs</p>
                      </>
                    )}
                    {currentStageId === 'conclusion' && (
                      <>
                        <p>• Restate your thesis in different words</p>
                        <p>• Summarize your main points</p>
                        <p>• Show the significance of your argument</p>
                        <p>• End with a strong closing thought</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}