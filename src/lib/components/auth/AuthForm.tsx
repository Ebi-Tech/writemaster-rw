'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, School, BookOpen } from 'lucide-react'

type AuthMode = 'login' | 'signup'

export default function AuthForm({ initialMode = 'login' }: { initialMode?: AuthMode }) {
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const detectInstitution = (email: string): { isInstitution: boolean; domain: string } => {
    const domain = email.split('@')[1] || ''
    const institutionDomains = ['ur.ac.rw', 'ac.rw', 'edu.rw', 'school.rw']
    const isInstitution = institutionDomains.some(d => domain.includes(d))
    return { isInstitution, domain }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (mode === 'signup') {
        // Sign up AND sign in immediately (auto-confirm)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              school_name: schoolName,
              ...detectInstitution(email)
            },
            // Auto-confirm for development
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })

        if (authError) throw authError

        if (authData.user) {
          // Immediately sign in after signup
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (signInError) throw signInError
          
          // Update user profile with additional info
          const { error: profileError } = await supabase
            .from('users')
            .update({
              full_name: fullName,
              school_name: schoolName,
              institution_domain: detectInstitution(email).domain,
              updated_at: new Date().toISOString()
            })
            .eq('id', authData.user.id)

          if (profileError) {
            console.error('Profile update error:', profileError)
            // Create profile if it doesn't exist
            await supabase
              .from('users')
              .insert({
                id: authData.user.id,
                email: authData.user.email!,
                full_name: fullName,
                school_name: schoolName,
                role: detectInstitution(email).isInstitution ? 'institution' : 'student',
                institution_domain: detectInstitution(email).domain
              })
          }
          
          // Redirect to dashboard immediately
          router.push('/dashboard')
          router.refresh()
        }
      } else {
        // Log in
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (authError) throw authError
        
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const institutionInfo = detectInstitution(email)

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <BookOpen className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
        </h2>
        <p className="text-gray-600 mt-2">
          {mode === 'login' 
            ? 'Sign in to continue your writing journey' 
            : 'Join WriteMaster RW for better academic writing'}
        </p>
      </div>

      {institutionInfo.isInstitution && email && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <School className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-800">
              Institution account detected ({institutionInfo.domain})
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            You'll have access to institution features and student management.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="inline h-4 w-4 mr-1" />
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder="John Doe"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Mail className="inline h-4 w-4 mr-1" />
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            placeholder="student@school.edu.rw"
          />
        </div>

        {mode === 'signup' && institutionInfo.isInstitution && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <School className="inline h-4 w-4 mr-1" />
              School/Institution Name
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="University of Rwanda"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Lock className="inline h-4 w-4 mr-1" />
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            placeholder="••••••••"
            minLength={6}
          />
          {mode === 'signup' && (
            <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : mode === 'login' ? (
            'Sign In'
          ) : (
            'Create Account & Sign In'
          )}
        </button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : 'Already have an account? Sign in'}
          </button>
        </div>

        {mode === 'signup' && (
          <div className="text-center">
            <p className="text-xs text-gray-500 mt-4">
              By signing up, you'll be logged in immediately. No email confirmation required for now.
            </p>
          </div>
        )}
      </form>
    </div>
  )
}