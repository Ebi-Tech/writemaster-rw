import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  const client = createBrowserClient(supabaseUrl, supabaseKey)
  
  // Add edge function helper
  client.functions.invoke = async (functionName: string, options?: any) => {
    const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options?.body || {}),
    })
    
    if (!response.ok) {
      throw new Error(`Function ${functionName} failed: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  return client
}