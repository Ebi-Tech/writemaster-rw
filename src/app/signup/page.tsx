import AuthForm from '../../lib/components/auth/AuthForm'
import Link from 'next/link'
import { ArrowLeft, Users, GraduationCap, Shield } from 'lucide-react'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Account Type
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Select the account type that best fits your needs. Different features are available for students, teachers, and institutions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-xl border-2 border-emerald-200 shadow-sm">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Student Account</h3>
              <p className="text-gray-600 mb-4">
                Perfect for S6 students and university undergraduates. Access essay and thesis modes with stage-locked progression.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✓ Essay Mode (REB-aligned)</li>
                <li>✓ Thesis Mode (UR-aligned)</li>
                <li>✓ Writing DNA analytics</li>
                <li>✓ AI feedback and scoring</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Teacher Account</h3>
              <p className="text-gray-600 mb-4">
                For educators at schools and universities. Monitor student progress, provide feedback, and manage classes.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✓ Student progress dashboard</li>
                <li>✓ Class management</li>
                <li>✓ Assignment creation</li>
                <li>✓ Manual grading and feedback</li>
              </ul>
            </div>
            
            <div className="bg-white p-6 rounded-xl border-2 border-purple-200 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Institution Account</h3>
              <p className="text-gray-600 mb-4">
                For schools and universities. Bulk licenses, custom rubrics, and administrative controls.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✓ Bulk user management</li>
                <li>✓ Custom institutional rubrics</li>
                <li>✓ Analytics and reporting</li>
                <li>✓ Priority support</li>
              </ul>
            </div>
          </div>
          
          <div className="max-w-md mx-auto">
            <AuthForm initialMode="signup" />
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}