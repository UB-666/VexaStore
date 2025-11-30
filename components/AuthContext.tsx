'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User, Session } from '@supabase/supabase-js'

type UserRole = 'customer' | 'developer' | null

interface AuthContextType {
  user: User | null
  session: Session | null
  userRole: UserRole
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshRole: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user role from database
  async function fetchUserRole(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single()

      if (error) {
        // Only log detailed errors in development mode
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching user role:', error)
        }
        setUserRole(null)
        return
      }

      setUserRole(data?.role as UserRole)
    } catch (error) {
      // Only log detailed errors in development mode
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to fetch user role:', error)
      }
      setUserRole(null)
    }
  }

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        fetchUserRole(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        fetchUserRole(session.user.id).then(() => setLoading(false))
      } else {
        setUserRole(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Sign up
  async function signUp(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      })

      if (error) {
        return { error }
      }

      // Role will be automatically created by database trigger as 'customer'
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // Sign in
  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      if (data.user) {
        await fetchUserRole(data.user.id)
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // Sign out
  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setUserRole(null)
  }

  // Refresh role (useful after role updates)
  async function refreshRole() {
    if (user) {
      await fetchUserRole(user.id)
    }
  }

  const value = {
    user,
    session,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
    refreshRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
