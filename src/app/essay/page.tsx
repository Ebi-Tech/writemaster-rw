import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BookOpen, FileText, Clock, TrendingUp, Plus, ArrowRight, CheckCircle } from 'lucide-react'

export default async function EssayModePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Get user's essay projects
  const { data: projects } = await supabase
    .from('writing_projects')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('mode', 'essay')
    .order('last_modified', { ascending: false })

  // Get essay templates
  const { data: templates } = await supabase
    .from('writing_templates')
    .select('*')
    .eq('mode', 'essay')
    .eq('is_public', true)
    .limit(5)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Essay Mode</h1>
                <p className="text-sm text-gray-600">REB-aligned essay writing with guided progression</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Master Essay Writing the <span className="text-blue-600">Rwandan Way</span>
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Write essays that follow REB marking schemes. Each stage must meet specific requirements before you can proceed, ensuring you build a strong foundation.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/essay/new"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Start New Essay
              </Link>
              <Link
                href="#templates"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 font-medium"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Try a Template
              </Link>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-12 bg-white rounded-2xl p-8 shadow-sm border">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">How Essay Mode Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: <FileText className="h-8 w-8" />,
                title: 'Choose Prompt',
                desc: 'Select from REB past papers or create your own'
              },
              {
                icon: <CheckCircle className="h-8 w-8" />,
                title: 'Complete Stages',
                desc: 'Write one stage at a time (Thesis → Plan → Intro → Body → Conclusion)'
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: 'Get Instant Feedback',
                desc: 'AI checks your work against REB rubrics'
              },
              {
                icon: <ArrowRight className="h-8 w-8" />,
                title: 'Unlock Next Stage',
                desc: 'Proceed only when current stage meets requirements'
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  {step.icon}
                </div>
                <h4 className="font-semibold text-lg mb-2">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Your Essay Projects */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Your Essays</h3>
            <Link
              href="/essay/new"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Essay
            </Link>
          </div>

          {(!projects || projects.length === 0) ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-xl font-medium text-gray-900 mb-2">No essays yet</h4>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start your first essay to practice REB-aligned writing with guided progression.
              </p>
              <Link
                href="/essay/new"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Essay
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/essay/${project.id}`}
                  className="bg-white rounded-xl border p-6 hover:border-blue-400 hover:shadow-md transition group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                        {project.status === 'completed' ? 'Completed' : 
                         project.status === 'in_progress' ? 'In Progress' : 'Draft'}
                      </span>
                      <h4 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 mb-2">
                        {project.title}
                      </h4>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      Last modified: {new Date(project.last_modified).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Current stage: {project.current_stage_id.replace('_', ' ')}
                    </div>
                    {project.overall_score && (
                      <div className="flex items-center text-sm">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-green-600 font-bold">{project.overall_score.toFixed(1)}</span>
                        </div>
                        <span className="text-gray-600">Overall score</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Essay Templates */}
        {templates && templates.length > 0 && (
          <div id="templates" className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Practice with REB Templates</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-white rounded-xl border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      REB {template.source_year}
                    </span>
                    <span className="text-xs text-gray-500">{template.paper_code}</span>
                  </div>
                  <h4 className="font-semibold text-lg text-gray-900 mb-3">{template.title}</h4>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.description}</p>
                  <div className="text-sm text-gray-500 mb-4">
                    <div className="flex items-center mb-1">
                      <span className="w-24">Type:</span>
                      <span className="font-medium capitalize">{template.category}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-24">Difficulty:</span>
                      <span className="font-medium capitalize">{template.difficulty}</span>
                    </div>
                  </div>
                  <Link
                    href={`/essay/new?template=${template.id}`}
                    className="inline-flex items-center justify-center w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm"
                  >
                    Use This Template
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Essay Stages Overview */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Essay Writing Stages</h3>
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-0 right-0 top-6 h-0.5 bg-gray-200"></div>
            
            <div className="grid grid-cols-5 relative z-10">
              {[
                { id: 'thesis_statement', title: 'Thesis', desc: 'Clear, arguable claim' },
                { id: 'planning', title: 'Plan', desc: 'Outline arguments' },
                { id: 'introduction', title: 'Introduction', desc: 'Context & thesis' },
                { id: 'body_paragraphs', title: 'Body', desc: 'Arguments & evidence' },
                { id: 'conclusion', title: 'Conclusion', desc: 'Summary & significance' }
              ].map((stage, index) => (
                <div key={stage.id} className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <span className="font-bold">{index + 1}</span>
                  </div>
                  <h4 className="font-semibold mb-1">{stage.title}</h4>
                  <p className="text-xs text-gray-600">{stage.desc}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    {index === 0 ? 'Unlocked' : 'Locked'}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-gray-600 mt-8">
            Each stage must meet REB requirements before the next one unlocks
          </p>
        </div>
      </main>
    </div>
  )
}