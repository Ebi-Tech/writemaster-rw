import AuthForm from '../../lib/components/auth/AuthForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                Write better with
                <span className="text-blue-600 block">WriteMaster RW</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                The academic writing assistant designed specifically for Rwandan students and institutions. Follow REB and UR guidelines to produce high-quality essays and theses.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-gray-700">Stage-locked writing progression</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-gray-700">REB & UR rubric alignment</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-gray-700">Writing DNA analytics</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                  <span className="text-gray-700">Institution dashboard for teachers</span>
                </div>
              </div>
            </div>
            
            <div>
              <AuthForm initialMode="login" />
              
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Demo credentials for testing:
                </p>
                <div className="mt-2 inline-flex flex-col items-center text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                  <span><strong>Email:</strong> student@test.rw</span>
                  <span><strong>Password:</strong> password123</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}