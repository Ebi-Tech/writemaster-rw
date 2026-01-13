import { createClient } from '@/lib/supabase/client'

async function fixExistingUsers() {
  const supabase = createClient()
  
  console.log('🛠️ Fixing existing users...')
  
  // Get all auth users
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()
  
  if (authError) {
    console.error('❌ Failed to get auth users:', authError.message)
    return
  }
  
  console.log(`Found ${users.length} auth users`)
  
  // Check each user
  for (const authUser of users) {
    const { data: existingProfile, error: dbError } = await supabase
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .single()
    
    if (dbError && dbError.code === 'PGRST116') {
      // User doesn't exist in public.users - create them
      console.log(`Creating profile for ${authUser.email}`)
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUser.id,
          email: authUser.email!,
          role: authUser.email?.includes('@ur.ac.rw') || authUser.email?.includes('@ac.rw') 
            ? 'institution' 
            : 'student',
          institution_domain: authUser.email?.split('@')[1] || null,
          created_at: authUser.created_at
        })
      
      if (insertError) {
        console.error(`Failed to create profile for ${authUser.email}:`, insertError.message)
      } else {
        console.log(`✅ Created profile for ${authUser.email}`)
      }
    }
  }
  
  console.log('🎉 User fix complete!')
}

fixExistingUsers().catch(console.error)