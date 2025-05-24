import { supabase } from './supabase'
import { User } from '../models/User'
import { AuthResponse } from '@supabase/supabase-js'

export class UserService {
  static async getTotalUsers(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error fetching user count:', error)
      return 0
    }
  }

  static async getUserById(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching user details:', error)
      return null
    }
  }

  static async createUserWithAuth(userData: Partial<User>) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
        email: userData.email_address!,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name,
          }
        }
      }) as AuthResponse

      if (authError) throw authError

      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([{
          ...userData,
          id: authData.user?.id,
          created_at: new Date().toISOString(),
          has_session: null,
          avatar: null
        }])
        .select()
        .single()

      if (userError) throw userError

      return { user: newUser, error: null }
    } catch (error: any) {
      console.error('Error creating user:', error)
      return { user: null, error: error.message }
    }
  }

  static async completeUserCreation(userId: string, userData: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          ...userData,
          id: userId,
          created_at: new Date().toISOString(),
          has_session: null,
          avatar: null
        }])
        .select()
        .single()

      if (error) throw error
      return { user: data, error: null }
    } catch (error: any) {
      console.error('Error completing user creation:', error)
      return { user: null, error: error.message }
    }
  }
}