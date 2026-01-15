'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, BookOpen, FileText, Sparkles, Target } from 'lucide-react'
import Link from 'next/link'

export default function NewEssayPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [prompt, setPrompt] = useState('')
  const [essayType, setEssayType] = useState('argumentative')
  const [wordLimit, setWordLimit] = useState(500)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const essayTypes = [
    { id: 'argumentative', name: 'Argumentative', desc: 'Present and defend a position' },
    { id: 'descriptive', name: 'Descriptive', desc: 'Describe a person, place, or event' },
    { id: 'narrative', name: 'Narrative', desc: 'Tell a story or recount an experience' },
    { id: 'expository', name: 'Expository', desc: 'Explain or inform about a topic' }
  ]

  const handleCreateEssay = async () => {
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in')

      // Create the essay project
      const { data: project, error: projectError } = await supabase
        .from('writing_projects')
        .insert({
          user_id: user.id,
          title: title || 'Untitled Essay',
          mode: 'essay',
          essay_prompt: prompt,
          essay_type: essayType,
          word_limit: wordLimit,
          status: 'draft',
          current_stage_id: 'thesis_statement'
        })
        .select()
        .single()

      if (projectError) throw projectError

      // In the handleCreateEssay function, replace the stage creation code:

// Create the first stage (plan_thesis)
const { error: stageError } = await supabase
  .from('stage_progress')
  .insert({
    project_id: project.id,
    stage_id: 'plan_thesis',
    stage_type: 'essay',
    title: 'Plan & Thesis Draft',
    status: 'unlocked',
    is_unlocked: true,
    requirements: [
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
    ]
  })

      if (stageError) throw stageError

      // Redirect to the essay editor
      router.push(`/essay/${project.id}`)

    } catch (err: any) {
      setError(err.message || 'Failed to create essay')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="inline h-4 w-4 mr-1" />
                Essay Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., The Impact of Technology on Rwandan Society"
              />
              <p className="text-sm text-gray-500 mt-1">You can change this later</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="inline h-4 w-4 mr-1" />
                Essay Prompt / Question
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                placeholder="e.g., 'Technology has done more to connect people than to isolate them.' Discuss this statement with reference to Rwanda."
              />
              <p className="text-sm text-gray-500 mt-1">What are you writing about? This helps guide your essay structure.</p>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Essay Type</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {essayTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setEssayType(type.id)}
                    className={`p-4 border rounded-lg text-left transition ${
                      essayType === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{type.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{type.desc}</p>
                      </div>
                      {essayType === type.id && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Word Limit Target
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="200"
                  max="2000"
                  step="100"
                  value={wordLimit}
                  onChange={(e) => setWordLimit(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-lg font-semibold text-gray-900 min-w-[80px]">
                  {wordLimit} words
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>Short (200)</span>
                <span>Standard (500-750)</span>
                <span>Long (1500+)</span>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Essay Summary</h3>
              <div className="space-y-3">
                <div className="flex">
                  <span className="w-32 text-gray-600">Title:</span>
                  <span className="font-medium">{title || 'Untitled Essay'}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{essayTypes.find(t => t.id === essayType)?.name}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-600">Word Limit:</span>
                  <span className="font-medium">{wordLimit} words</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-600">Prompt:</span>
                  <span className="font-medium flex-1">{prompt || 'No prompt provided'}</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-emerald-900 mb-3">What Happens Next?</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Sparkles className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                  <span>You'll start with the <strong>Thesis Statement</strong> stage</span>
                </li>
                <li className="flex items-start">
                  <Sparkles className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                  <span>Complete each stage before unlocking the next one</span>
                </li>
                <li className="flex items-start">
                  <Sparkles className="h-5 w-5 text-emerald-600 mr-2 mt-0.5" />
                  <span>Get instant feedback based on REB marking schemes</span>
                </li>
              </ul>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/essay" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Essay</h1>
                <p className="text-sm text-gray-600">Step {step} of 3</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {['Essay Details', 'Settings', 'Review'].map((stepTitle, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    step > index + 1 ? 'bg-blue-600 text-white' :
                    step === index + 1 ? 'bg-blue-100 text-blue-600 border-2 border-blue-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {step > index + 1 ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="font-bold">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    step >= index + 1 ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {stepTitle}
                  </span>
                </div>
              ))}
            </div>
            <div className="relative">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-200 -translate-y-1/2"></div>
              <div 
                className="absolute left-0 top-1/2 h-0.5 bg-blue-600 -translate-y-1/2 transition-all duration-300"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border mb-8">
            {renderStep()}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Back
              </button>
            ) : (
              <Link
                href="/essay"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                Cancel
              </Link>
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleCreateEssay}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Essay...
                  </span>
                ) : (
                  'Create Essay & Start Writing'
                )}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}