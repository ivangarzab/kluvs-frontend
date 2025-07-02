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
  
  // Check if user is admin (your email)
  const isAdmin = user?.email === 'ivangb6@gmail.com'

  // Look up member data by user_id
  const findMemberByUserId = async (userId: string): Promise<Member | null> => {
    try {
      console.log('🔍 Looking up member for user_id:', userId)
      
      const { data, error, count } = await supabase
        .from('members')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
      
      console.log('📡 Raw query result:', { data, error, count })
      
      if (error) {
        console.error('❌ Query error:', error)
        return null
      }
      
      if (!data || data.length === 0) {
        console.log('❌ No member found for this user')
        return null
      }
      
      if (data.length > 1) {
        console.warn('⚠️ Multiple members found, using first one:', data)
      }
      
      const member = data[0]
      console.log('✅ Found member:', member)
      return member
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
    setUser(newUser)
    setMember(null) // Skip member lookup for now
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
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      await handleUserChange(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

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