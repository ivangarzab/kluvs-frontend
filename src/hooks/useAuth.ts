// src/hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'

interface Member {
  id: number
  name: string
  points: number
  books_read: number
  user_id: string
}

interface AuthUser {
  user: User | null
  member: Member | null
  loading: boolean
  isAdmin: boolean
  signInWithDiscord: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

export function useAuth(): AuthUser {
  const [user, setUser] = useState<User | null>(null)
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [authInitialized, setAuthInitialized] = useState(false)
  
  // Check if user is admin (your email)
  const isAdmin = user?.email === 'ivangb6@gmail.com'

  // Look up member data by user_id using Edge Function
  const findMemberByUserId = async (userId: string): Promise<Member | null> => {
    try {
      console.log('🔍 Looking up member for user_id via Edge Function:', userId)
      
      // Wait for session to be ready
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.log('❌ No active session for Edge Function call')
        return null
      }
      
      console.log('✅ Session ready, calling Edge Function')
      
      const { data, error } = await supabase.functions.invoke(`member?user_id=${encodeURIComponent(userId)}`, {
        method: 'GET'
      })
      
      console.log('📡 Edge Function response:', { data, error })
      
      if (error) {
        console.error('❌ Edge Function error:', error)
        return null
      }
      
      console.log('✅ Found member via Edge Function:', data)
      return data
    } catch (error) {
      console.error('💥 Exception in member lookup:', error)
      return null
    }
  }

  // Create new member record for new users
  const createNewMember = async (user: User): Promise<Member | null> => {
    try {
      const memberName = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.email?.split('@')[0] || 
                        'New Member'
      
      console.log('🆕 Creating new member:', memberName)
      
      const { data, error } = await supabase
        .from('members')
        .insert({
          name: memberName,
          points: 0,
          books_read: 0,
          user_id: user.id
        })
        .select()
        .single()
      
      if (error) throw error
      
      console.log('✅ Created new member:', data)
      return data
    } catch (error) {
      console.error('💥 Error creating member:', error)
      return null
    }
  }

  // Handle member lookup/creation when user changes
  const handleUserChange = async (newUser: User | null) => {
    console.log('🚀 handleUserChange called with user:', newUser?.email)
    console.log('🔍 User metadata:', {
      provider: newUser?.app_metadata?.provider,
      full_name: newUser?.user_metadata?.full_name,
      session_type: newUser ? 'fresh_or_restored' : 'null'
    })
    
    setUser(newUser)
    
    if (!newUser) {
      setMember(null)
      return
    }
  
    console.log('🎯 About to call Edge Function...')
    const memberData = await findMemberByUserId(newUser.id)
    console.log('🎯 Edge Function completed, setting member:', !!memberData)
    setMember(memberData)
  }

  // Sign in with Discord
  const signInWithDiscord = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}`
        // Sign out
      }})
      if (error) throw error
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleUserChange(session?.user ?? null)
      setLoading(false)
      setAuthInitialized(true) // Mark as initialized
    })
  
    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (authInitialized) { // Only call if already initialized
        await handleUserChange(session?.user ?? null)
      }
      setLoading(false)
    })
  
    return () => subscription.unsubscribe()
  }, [authInitialized])

  return {
    user,
    member,
    loading,
    isAdmin,
    signInWithDiscord,
    signInWithGoogle,
    signOut,
  }
}