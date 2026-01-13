'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
  ensureUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  ensureUserProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  const ensureUserProfile = async () => {
    if (!user) return
    
    try {
      // Check if user exists in public.users
      const { data: existingProfile, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()
      
      if (error && error.code === 'PGRST116') { // No rows returned
        // Create user profile
        await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email!,
            role: user.email?.includes('@ur.ac.rw') || user.email?.includes('@ac.rw') 
              ? 'institution' 
              : 'student',
            institution_domain: user.email?.split('@')[1] || null
          })
      }
    } catch (err) {
      console.error('Failed to ensure user profile:', err)
    }
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Ensure user profile exists
          await ensureUserProfile()
          router.refresh()
        }
      }
    )

    // Check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      
      if (session?.user) {
        await ensureUserProfile()
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut, ensureUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)