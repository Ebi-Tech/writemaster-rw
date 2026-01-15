'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import StageProgress from './StageProgress'
import RequirementsCheck from './RequirementsCheck'
import { 
  ArrowLeft, FileText, Lock, Unlock, CheckCircle, 
  Edit, Save, HelpCircle, ChevronRight, AlertTriangle,
  Download, Share2, Brain, BookOpen, Target, FileEdit
} from 'lucide-react'
import Link from 'next/link'

// NEW 4-STAGE STRUCTURE
const ESSAY_STAGES = [
  { 
    id: 'plan_thesis', 
    title: 'Plan & Thesis Draft', 
    description: 'Outline your essay and draft your thesis',
    icon: Brain,
    counted: false
  },
  { 
    id: 'write_introduction', 
    title: 'Write Introduction', 
    description: 'Write introduction with embedded thesis',
    icon: BookOpen,
    counted: true
  },
  { 
    id: 'develop_body', 
    title: 'Develop Body Paragraphs', 
    description: 'Develop arguments with evidence',
    icon: FileEdit,
    counted: true
  },
  { 
    id: 'conclude', 
    title: 'Write Conclusion', 
    description: 'Summarize and show significance',
    icon: Target,
    counted: true
  }
]

type Project = {
  id: string
  title: string
  mode: 'essay' | 'thesis'
  status: string
  essay_prompt: string | null
  word_limit: number | null
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
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)
  const lastSavedContent = useRef<string>('')
  
  const [currentStageId, setCurrentStageId] = useState(project.current_stage_id)
  const [stages, setStages] = useState<Stage[]>(initialStages)
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [showWordLimitWarning, setShowWordLimitWarning] = useState(false)

  const currentStage = stages.find(s => s.stage_id === currentStageId)
  const currentStageIndex = ESSAY_STAGES.findIndex(s => s.id === currentStageId)
  const isLastStage = currentStageIndex === ESSAY_STAGES.length - 1
  const currentStageInfo = ESSAY_STAGES[currentStageIndex]

  // Calculate total words for COUNTED stages only
  const getCountedWords = () => {
    return stages.reduce((total, stage) => {
      const stageInfo = ESSAY_STAGES.find(s => s.id === stage.stage_id)
      if (stageInfo?.counted && stage.content) {
        return total + stage.content.split(/\s+/).length
      }
      return total
    }, 0)
  }

  const countedWords = getCountedWords()
  const isCurrentStageCounted = currentStageInfo?.counted || false

  // Initialize content when stage changes
  useEffect(() => {
    if (currentStage) {
      const stageContent = currentStage.content || ''
      setContent(stageContent)
      setWordCount(stageContent.split(/\s+/).length)
      lastSavedContent.current = stageContent
    }
  }, [currentStage])

  // Auto-save on content change
  useEffect(() => {
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
    }

    if (content !== lastSavedContent.current) {
      autoSaveTimer.current = setTimeout(() => {
        handleAutoSave()
      }, 2000)
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [content])

  const handleAutoSave = async () => {
    if (!currentStage || content === lastSavedContent.current) return
    
    try {
      const updateData: any = {
        content,
        word_count: wordCount,
        character_count: content.length,
        status: 'in_progress',
        updated_at: new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('stage_progress')
        .update(updateData)
        .eq('project_id', project.id)
        .eq('stage_id', currentStageId)

      if (!error) {
        lastSavedContent.current = content
        setStages(stages.map(s => 
          s.stage_id === currentStageId 
            ? { ...s, content, status: 'in_progress' }
            : s
        ))
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }

  const handleSave = async () => {
    if (!currentStage) return
    
    setSaving(true)
    try {
      const updateData: any = {
        content,
        word_count: wordCount,
        character_count: content.length,
        status: 'in_progress',
        updated_at: new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('stage_progress')
        .update(updateData)
        .eq('project_id', project.id)
        .eq('stage_id', currentStageId)

      if (error) throw error

      setStages(stages.map(s => 
        s.stage_id === currentStageId 
          ? { ...s, content, status: 'in_progress' }
          : s
      ))
      
      lastSavedContent.current = content
      
      console.log('✅ Content saved')

    } catch (error: any) {
      console.error('Failed to save:', error)
      alert(`Save failed: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const checkWordLimit = () => {
    if (!project.word_limit || !isCurrentStageCounted) return true
    
    const newTotalWords = countedWords + wordCount - (currentStage?.content?.split(/\s+/).length || 0)
    
    if (newTotalWords > project.word_limit) {
      setShowWordLimitWarning(true)
      return false
    }
    
    setShowWordLimitWarning(false)
    return true
  }

  const handleCheckRequirements = async () => {
    if (!currentStage || !content.trim()) {
      alert('Please write something before checking requirements')
      return
    }
    
    // Check word limit for counted stages
    if (isCurrentStageCounted && !checkWordLimit()) {
      alert(`You're exceeding the word limit of ${project.word_limit} words. Please shorten your content.`)
      return
    }
    
    setChecking(true)
    
    try {
      // Save content first
      await handleSave()
      
      // Check requirements via API
      const response = await fetch('/api/check-requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          stageId: currentStageId,
          content,
          requirements: currentStage.requirements || [],
          wordLimit: project.word_limit,
          currentStageIndex,
          isLastStage,
          isCountedStage: isCurrentStageCounted
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to check requirements')
      }

      const data = await response.json()
      
      // Update stage with results
      const updateData: any = {
        passed_requirements: data.passedRequirements || [],
        failed_requirements: data.failedRequirements || [],
        is_completed: data.isCompleted || false,
        ai_feedback: data.feedback || null,
        status: data.isCompleted ? 'completed' : 'in_progress',
        updated_at: new Date().toISOString()
      }
      
      const { error: updateError } = await supabase
        .from('stage_progress')
        .update(updateData)
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

      // Handle completion
      if (data.isCompleted) {
        if (!isLastStage) {
          // Unlock next stage
          const nextStageId = ESSAY_STAGES[currentStageIndex + 1].id
          await unlockNextStage(nextStageId)
          alert('🎉 Stage completed! Next stage unlocked.')
        } else {
          // Last stage completed - mark project as complete
          await completeEssayProject()
          alert('🎊 Congratulations! You have completed your essay!')
        }
      } else {
        alert('📝 Requirements not fully met. Check the feedback below.')
      }

    } catch (error: any) {
      console.error('❌ Failed to check requirements:', error)
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
        const stageData: any = {
          project_id: project.id,
          stage_id: nextStageId,
          stage_type: 'essay',
          title: ESSAY_STAGES.find(s => s.id === nextStageId)?.title || 'Next Stage',
          status: 'unlocked',
          is_unlocked: true,
          requirements: getStageRequirements(nextStageId),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const { error } = await supabase
          .from('stage_progress')
          .insert(stageData)

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
      alert('Error unlocking next stage. Please try again.')
    }
  }

  const completeEssayProject = async () => {
    try {
      // Calculate average score from completed stages
      const completedStages = stages.filter(s => s.is_completed)
      const averageScore = completedStages.length > 0 
        ? completedStages.reduce((sum, stage) => sum + (stage.ai_feedback ? 8 : 5), 0) / completedStages.length
        : 0
      
      // Update project as completed
      const { error } = await supabase
        .from('writing_projects')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          last_modified: new Date().toISOString(),
          completed_stages: completedStages.length,
          overall_score: parseFloat(averageScore.toFixed(1)),
          writing_dna_summary: {
            total_words: countedWords,
            stages_completed: completedStages.length,
            average_stage_score: parseFloat(averageScore.toFixed(1)),
            completed_at: new Date().toISOString()
          }
        })
        .eq('id', project.id)
        
      if (error) throw error
      
      // Update user stats
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userProfile } = await supabase
          .from('users')
          .select('total_essays_completed, average_score')
          .eq('id', user.id)
          .single()
          
        if (userProfile) {
          const newTotal = (userProfile.total_essays_completed || 0) + 1
          const newAverage = userProfile.average_score 
            ? (userProfile.average_score * (newTotal - 1) + averageScore) / newTotal
            : averageScore
            
          await supabase
            .from('users')
            .update({
              total_essays_completed: newTotal,
              average_score: parseFloat(newAverage.toFixed(2))
            })
            .eq('id', user.id)
        }
      }
      
      console.log('✅ Essay project marked as completed')
      
    } catch (error) {
      console.error('Failed to complete essay project:', error)
    }
  }

  const handleStageSelect = async (stageId: string) => {
    // Save current content before switching
    if (currentStage && content !== lastSavedContent.current) {
      await handleSave()
    }
    
    setCurrentStageId(stageId)
  }

  const getStageRequirements = (stageId: string): any[] => {
    const requirements: Record<string, any[]> = {
      'plan_thesis': [
        {
          id: 'outline_points',
          type: 'word_count',
          minValue: 30,
          description: 'Outline should have at least 3 main points',
          errorMessage: 'Your outline needs more detail (minimum 30 words)'
        },
        {
          id: 'thesis_draft',
          type: 'contains_keywords',
          requiredKeywords: ['argu', 'position', 'claim', 'because', 'therefore'],
          description: 'Thesis draft should take a clear position',
          errorMessage: 'Your thesis needs to make a clear, arguable claim'
        }
      ],
      'write_introduction': [
        {
          id: 'intro_length',
          type: 'word_count',
          minValue: 80,
          maxValue: 150,
          description: 'Introduction should be 80-150 words',
          errorMessage: 'Introduction is too short or too long'
        },
        {
          id: 'intro_structure',
          type: 'contains_keywords',
          requiredKeywords: ['introduc', 'thesis', 'argu', 'this essay', 'will discuss'],
          description: 'Introduction should have hook, background, and thesis',
          errorMessage: 'Your introduction needs a clear structure'
        }
      ],
      'develop_body': [
        {
          id: 'body_length',
          type: 'word_count',
          minValue: 300,
          description: 'Body paragraphs should be at least 300 words',
          errorMessage: 'Body paragraphs need more development'
        },
        {
          id: 'body_structure',
          type: 'structure_check',
          minParagraphs: 3,
          description: 'Should have at least 3 well-developed paragraphs',
          errorMessage: 'Need more developed paragraphs'
        }
      ],
      'conclude': [
        {
          id: 'conclusion_length',
          type: 'word_count',
          minValue: 80,
          maxValue: 150,
          description: 'Conclusion should be 80-150 words',
          errorMessage: 'Conclusion is too short or too long'
        },
        {
          id: 'conclusion_keywords',
          type: 'contains_keywords',
          requiredKeywords: ['conclud', 'summary', 'overall', 'therefore', 'finally', 'signific'],
          description: 'Conclusion should summarize and show significance',
          errorMessage: 'Your conclusion should summarize main points'
        }
      ]
    }
    
    return requirements[stageId] || []
  }

  const canProceed = currentStage?.is_completed && !isLastStage
  const isProjectComplete = project.status === 'completed'

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
                  {currentStageInfo?.title}
                  {project.word_limit && isCurrentStageCounted && ` • ${project.word_limit} word limit`}
                  {isProjectComplete && ' • ✅ Completed'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {isCurrentStageCounted && (
                <div className="hidden md:block text-sm text-gray-600">
                  Stage: {wordCount} words • Total: {countedWords}/{project.word_limit}
                </div>
              )}
              {showWordLimitWarning && (
                <div className="flex items-center text-amber-600 text-sm">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Over limit
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              {isProjectComplete && (
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium flex items-center">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              )}
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
              onStageSelect={handleStageSelect}
            />
            
            {/* Word Count Summary */}
            <div className="mt-6 bg-white rounded-xl border p-4">
              <h4 className="font-medium text-gray-900 mb-3">Word Count</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Introduction:</span>
                  <span className="font-medium">
                    {stages.find(s => s.stage_id === 'write_introduction')?.content?.split(/\s+/).length || 0} words
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Body:</span>
                  <span className="font-medium">
                    {stages.find(s => s.stage_id === 'develop_body')?.content?.split(/\s+/).length || 0} words
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Conclusion:</span>
                  <span className="font-medium">
                    {stages.find(s => s.stage_id === 'conclude')?.content?.split(/\s+/).length || 0} words
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total Counted:</span>
                    <span className={countedWords > (project.word_limit || 0) ? 'text-red-600' : 'text-gray-900'}>
                      {countedWords} / {project.word_limit || '∞'} words
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Planning stage not counted toward total
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Editor Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              {/* Editor Header */}
              <div className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {currentStageInfo?.icon && (
                      <div className={`p-2 rounded-lg ${
                        currentStageId === 'plan_thesis' ? 'bg-purple-100 text-purple-600' :
                        currentStageId === 'write_introduction' ? 'bg-blue-100 text-blue-600' :
                        currentStageId === 'develop_body' ? 'bg-green-100 text-green-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        <currentStageInfo.icon className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {currentStageInfo?.title}
                        {currentStage?.is_completed && ' ✅'}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {currentStageInfo?.description}
                        {!isCurrentStageCounted && ' (Not counted toward word limit)'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {currentStage?.is_completed ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </span>
                    ) : currentStage?.is_unlocked ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Edit className="h-3 w-3 mr-1" />
                        In Progress
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <Lock className="h-3 w-3 mr-1" />
                        Locked
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Essay Prompt (always show for context) */}
              {project.essay_prompt && (
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
                        {currentStageInfo?.title}
                        <span className="text-gray-500 ml-2">({wordCount} words)</span>
                        {showWordLimitWarning && (
                          <span className="ml-2 text-amber-600">
                            ⚠️ Exceeds word limit
                          </span>
                        )}
                        {!isCurrentStageCounted && (
                          <span className="ml-2 text-purple-600">
                            (Planning - not counted)
                          </span>
                        )}
                      </label>
                      <textarea
                        value={content}
                        onChange={(e) => {
                          setContent(e.target.value)
                          setWordCount(e.target.value.split(/\s+/).length)
                          if (isCurrentStageCounted) {
                            checkWordLimit()
                          }
                        }}
                        className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder={`Start writing your ${currentStageInfo?.title?.toLowerCase()}...`}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handleCheckRequirements}
                          disabled={checking || !content.trim()}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium"
                        >
                          {checking ? 'Checking...' : 
                           isLastStage ? 'Final Check & Complete' : 'Check Requirements'}
                        </button>
                        
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save Draft'}
                        </button>
                      </div>

                      {canProceed && (
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
                      Complete the previous stage to unlock {currentStageInfo?.title}
                    </p>
                    {currentStageIndex > 0 && (
                      <button
                        onClick={() => handleStageSelect(ESSAY_STAGES[currentStageIndex - 1].id)}
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
                    {currentStageId === 'plan_thesis' && (
                      <>
                        <p>• <strong>Outline your main arguments</strong> (aim for 3-5 points)</p>
                        <p>• <strong>Draft a thesis statement</strong> that takes a clear position</p>
                        <p>• <strong>List evidence</strong> you'll use for each argument</p>
                        <p>• <strong>This stage is for planning only</strong> - it won't count toward your word limit</p>
                        <p>• Example thesis draft: "While technology has drawbacks, its benefits for education outweigh the negatives."</p>
                      </>
                    )}
                    {currentStageId === 'write_introduction' && (
                      <>
                        <p>• <strong>Start with a hook</strong> to engage your reader</p>
                        <p>• <strong>Provide background context</strong> on your topic</p>
                        <p>• <strong>Embed your thesis</strong> clearly (improved from your draft)</p>
                        <p>• <strong>Outline your essay structure</strong>: "This essay will first... then..."</p>
                        <p>• <strong>Aim for 80-150 words</strong> - this stage counts toward your total</p>
                      </>
                    )}
                    {currentStageId === 'develop_body' && (
                      <>
                        <p>• <strong>Start each paragraph with a topic sentence</strong></p>
                        <p>• <strong>Provide evidence</strong> (facts, quotes, examples)</p>
                        <p>• <strong>Explain how evidence supports your argument</strong></p>
                        <p>• <strong>Use transitions</strong> between paragraphs</p>
                        <p>• <strong>Aim for at least 300 words</strong> across 3-5 paragraphs</p>
                      </>
                    )}
                    {currentStageId === 'conclude' && (
                      <>
                        <p>• <strong>Restate your thesis</strong> in different words</p>
                        <p>• <strong>Summarize your main arguments</strong> briefly</p>
                        <p>• <strong>Show the significance</strong> of your findings</p>
                        <p>• <strong>End with a strong closing thought</strong></p>
                        <p>• <strong>Avoid introducing new information</strong></p>
                        <p>• <strong>Aim for 80-150 words</strong> - this completes your essay</p>
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