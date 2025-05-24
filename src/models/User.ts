import { supabase } from '../lib/supabase'

/**
 * Represents a user in the system with their profile information
 */
export interface User {
  id: string
  created_at: string
  first_name: string | null
  last_name: string | null
  email_address: string | null
  birthday: string | null
  gender: string | null
  weight: string | null
  height: string | null
  goal: string | null
  phone: string | null
  has_session: boolean | null
  last_activity: string | null
  test_last_active: string | null
}

/**
 * Handles all user-related database operations
 */
export class UserModel {
  /**
   * Retrieves the total count of users in the system
   * @returns Promise<number> Total number of users
   */
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

  /**
   * Creates a new user in the database
   * @param userData User information to be saved
   * @returns Promise<User> Created user data
   */
  static async createUser(userData: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  /**
   * Updates an existing user's information
   * @param id User ID
   * @param userData Updated user information
   * @returns Promise<User> Updated user data
   */
  static async updateUser(id: string, userData: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  /**
   * Fetches all users with their activity status
   * @returns Promise<Array<User & { status: string }>> List of users with activity status
   */
  static async getAllUsers(): Promise<Array<User & { status: string }>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(user => {
        const status = UserModel.calculateStatus(user.last_activity)
        
        return {
          ...user,
          status
        }
      })
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  }

  /**
   * Fetches a single user by their ID
   * @param id User ID
   * @returns Promise<User & { status: string } | null> User data with status or null if not found
   */
  static async getUserById(id: string): Promise<(User & { status: string }) | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      
      if (data) {
        return {
          ...data,
          status: UserModel.calculateStatus(data.last_activity)
        }
      }
      
      return null
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  /**
   * Deletes a user from the database
   * @param id User ID
   * @returns Promise with the deletion result
   */
  static async deleteUser(id: string) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      return { error }
    } catch (error) {
      console.error('Error deleting user:', error)
      return { error }
    }
  }

  /**
   * Searches users by name or email
   * @param query Search query string
   * @returns Promise<Array<User & { status: string }>> List of matching users with activity status
   */
  static async searchUsers(query: string): Promise<Array<User & { status: string }>> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email_address.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data.map(user => {
        const status = UserModel.calculateStatus(user.last_activity)
        
        return {
          ...user,
          status
        }
      })
    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  }

  /**
   * Calculates the status of a user based on their last activity
   * @param lastActivity Last activity timestamp
   * @returns string Status ('Active' or 'Inactive')
   */
  public static calculateStatus(lastActivity: string | null): string {
    if (!lastActivity) return 'Inactive'
    const lastActivityDate = new Date(lastActivity)
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    return lastActivityDate > oneHourAgo ? 'Active' : 'Inactive'
  }
}