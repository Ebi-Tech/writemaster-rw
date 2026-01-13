'use client'

import { useAuth } from '@/providers/AuthProvider'
import { BookOpen, FileText, TrendingUp, Clock, Plus, ArrowRight, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'

type Project = {
  id: string
  title: string
  mode: 'essay' | 'thesis'
  status: 'draft' | 'in_progress' | 'completed' | 'archived'
  current_stage_id: string
  overall_score: number | null
  last_modified: string
}

export default function DashboardClient({ 
  userProfile, 
  initialProjects,
  session 
}: { 
  userProfile: any
  initialProjects: Project[]
  session: Session
}) {
  const { signOut } = useAuth()
  const [projects] = useState<Project[]>(initialProjects)
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getModeIcon = (mode: string) => {
    return mode === 'essay' ? '📝' : '🎓'
  }

  // Safe user display name
  const getUserDisplayName = () => {
    if (!userProfile) {
      return session.user.email?.split('@')[0] || 'User'
    }
    return userProfile.full_name || userProfile.email?.split('@')[0] || 'User'
  }

  // Safe user stats
  const userStats = {
    totalEssays: userProfile?.total_essays_completed || 0,
    totalTheses: userProfile?.total_theses_completed || 0,
    averageScore: userProfile?.average_score || 0,
    email: session.user.email || 'No email',
    role: userProfile?.role || 'student',
    schoolName: userProfile?.school_name || null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {getUserDisplayName()}!
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Essays</p>
                <p className="text-3xl font-bold text-gray-900">{userStats.totalEssays}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Theses</p>
                <p className="text-3xl font-bold text-gray-900">{userStats.totalTheses}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">
                  {userStats.averageScore ? userStats.averageScore.toFixed(1) : '0.0'}/10
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Projects</p>
                <p className="text-3xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'in_progress').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Start Writing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/essay/new" 
              className="bg-white p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Essay Mode</h3>
                  <p className="text-sm text-gray-600">For S6 students (REB-aligned)</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition" />
              </div>
            </Link>
            
            <Link 
              href="/thesis/new" 
              className="bg-white p-6 rounded-xl border-2 border-emerald-200 hover:border-emerald-400 transition group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                    <BookOpen className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">Thesis Mode</h3>
                  <p className="text-sm text-gray-600">For university students (UR-aligned)</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition" />
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Projects</h2>
            <Link 
              href="/projects" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all →
            </Link>
          </div>
          
          {projects.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-4">Start your first essay or thesis to begin your writing journey</p>
              <div className="flex space-x-3 justify-center">
                <Link 
                  href="/essay/new"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Essay
                </Link>
                <Link 
                  href="/thesis/new"
                  className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Thesis
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {projects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link 
                          href={`/project/${project.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {project.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center">
                          {getModeIcon(project.mode)}
                          <span className="ml-2 capitalize">{project.mode}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                        {project.current_stage_id.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4">
                        {project.overall_score ? (
                          <span className="font-semibold">{project.overall_score.toFixed(1)}/10</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(project.last_modified).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Profile Info */}
        <div className="mt-8 bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{userStats.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="font-medium capitalize">{userStats.role}</p>
            </div>
            {userStats.schoolName && (
              <div>
                <p className="text-sm text-gray-600">School/Institution</p>
                <p className="font-medium">{userStats.schoolName}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Account Type</p>
              <p className="font-medium">
                {userStats.email.includes('@ur.ac.rw') || userStats.email.includes('@ac.rw')
                  ? 'Institution Account'
                  : 'Student Account'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}