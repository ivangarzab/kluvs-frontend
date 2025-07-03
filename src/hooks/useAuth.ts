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
  refreshMemberData: () => Promise<void>
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

  // Create new member record for new users using Edge Function
  const createNewMember = async (user: User): Promise<Member | null> => {
    try {
      const memberName = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.email?.split('@')[0] || 
                        'New Member'
      
      console.log('🆕 Creating new member via Edge Function:', memberName)
      
      const requestBody = {
        name: memberName,
        points: 0,
        books_read: 0,
        user_id: user.id
      }
      
      const { data, error } = await supabase.functions.invoke('member', {
        method: 'POST',
        body: requestBody
      })
      
      if (error) throw error
      
      console.log('✅ Created new member via Edge Function:', data)
      return data.member || data // Handle different response formats
    } catch (error) {
      console.error('💥 Error creating member via Edge Function:', error)
      return null
    }
  }

  // Refresh member data - needed for profile updates
  const refreshMemberData = async () => {
    if (user) {
      console.log('🔄 Refreshing member data...')
      const memberData = await findMemberByUserId(user.id)
      console.log('🔄 Refreshed member:', memberData)
      setMember(memberData)
    }
  }

  // Handle member lookup/creation when user changes
  const handleUserChange = async (newUser: User | null) => {
    console.log('🚀 handleUserChange called with user:', newUser?.email)
    
    setUser(newUser)
    
    if (!newUser) {
      console.log('❌ No user, clearing member')
      setMember(null)
      return
    }

    try {
      console.log('🔄 Starting member lookup...')
      
      // Look up member by user_id
      const memberData = await findMemberByUserId(newUser.id)
      
      console.log('🎯 Member lookup completed:', memberData)
      
      // If no member found, create one for new users
      if (!memberData) {
        console.log('🆕 No member found, creating new one...')
        const newMemberData = await createNewMember(newUser)
        console.log('✨ New member created:', newMemberData)
        setMember(newMemberData)
      } else {
        console.log('✅ Setting existing member:', memberData)
        setMember(memberData)
      }
    } catch (error) {
      console.error('💥 Error in handleUserChange:', error)
      setMember(null)
    }
  }

  // Sign in with Discord
  const signInWithDiscord = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}`
        }
      })
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

  // Initialize auth state and listen for changes - keeping the authInitialized guard
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
      if (authInitialized) { // Only call if already initialized - this prevents duplicate calls
        await handleUserChange(session?.user ?? null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [authInitialized]) // Keep the dependency on authInitialized

  return {
    user,
    member,
    loading,
    isAdmin,
    signInWithDiscord,
    signInWithGoogle,
    signOut,
    refreshMemberData, // Add this back for profile updates
  }
}