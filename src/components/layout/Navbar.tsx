'use client'

import { useAuth } from '@/providers/AuthProvider'
import Link from 'next/link'
import { BookOpen, User, LogOut, Home } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  // Don't show navbar on auth pages
  if (pathname === '/login' || pathname === '/signup') {
    return null
  }

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                WriteMaster<span className="text-blue-600">RW</span>
              </span>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link 
                href="/dashboard" 
                className={`flex items-center space-x-1 ${pathname === '/dashboard' ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link 
                href="/essay" 
                className={`${pathname.startsWith('/essay') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Essay Mode
              </Link>
              <Link 
                href="/thesis" 
                className={`${pathname.startsWith('/thesis') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Thesis Mode
              </Link>
              {user && (
                <Link 
                  href="/institution" 
                  className={`${pathname.startsWith('/institution') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Institution
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link 
                  href="/profile" 
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">{user.email?.split('@')[0]}</span>
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="hidden md:inline">Sign out</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  Sign in
                </Link>
                <Link 
                  href="/signup" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}