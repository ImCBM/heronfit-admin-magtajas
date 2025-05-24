import { UserModel, User } from '../models/User'
import { UserActivity } from '../models/UserActivity'
import { RealtimeUpdate } from '../utils/RealtimeUpdate'

interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

/**
 * Handles all user management operations
 */
export class UserController {
  private static readonly UPDATE_KEY = 'user-list'
  private static users: (User & { status: string })[] = []
  private static searchTimeout: number | null = null
  private static sortOptions: SortOptions = { field: 'created_at', direction: 'desc' }
  private static searchQuery: string = ''
  private static updateCallback: ((users: (User & { status: string })[]) => void) | null = null

  /**
   * Fetches all users with their activity status
   * @returns Promise<Array<User & { status: string; matchConfidence: number }>> List of users with activity status
   */
  static async fetchUsers(): Promise<(User & { status: string })[]> {
    try {
      const fetchedUsers = await UserModel.getAllUsers()
      
      this.users = fetchedUsers.map(user => ({
        ...user,
        status: UserActivity.calculateStatus(user.test_last_active),
      }))
      
      return this.users
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  }

  /**
   * Starts the periodic user list update
   * @param callback Function to call with the updated users
   * @param intervalMs Update interval in milliseconds
   */
  static startUserListUpdate(callback: (users: (User & { status: string })[]) => void, intervalMs?: number) {
    this.updateCallback = callback
    
    const updateUserList = async () => {
      await this.fetchUsers()
      this.applyFiltersAndSorting()
    }

    RealtimeUpdate.startUpdate(this.UPDATE_KEY, updateUserList, intervalMs)
  }

  /**
   * Stops the periodic user list update
   */
  static stopUserListUpdate() {
    RealtimeUpdate.stopUpdate(this.UPDATE_KEY)
  }

  /**
   * Gets the current users list
   * @returns Array of users with their status
   */
  static getCurrentUsers(): (User & { status: string })[] {
    return this.users
  }

  /**
   * Gets a single user by their ID
   * @param id User ID
   * @returns Promise<User | null> User data or null if not found
   */
  static async getUserById(id: string): Promise<User | null> {
    try {
      return await UserModel.getUserById(id)
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  }

  /**
   * Updates a user's information
   * @param id User ID
   * @param userData Updated user information
   * @returns Promise<User | null> Updated user data or null if failed
   */
  static async updateUser(id: string, userData: Partial<User>): Promise<User | null> {
    try {
      const updatedUser = await UserModel.updateUser(id, userData)
      await this.fetchUsers() // Refresh the users list
      this.applyFiltersAndSorting()
      return updatedUser
    } catch (error) {
      console.error('Error updating user:', error)
      return null
    }
  }

  /**
   * Deletes a user
   * @param id User ID
   * @returns Promise<boolean> True if successful, false otherwise
   */
  static async deleteUser(id: string): Promise<boolean> {
    try {
      const { error } = await UserModel.deleteUser(id)
      if (error) throw error
      await this.fetchUsers() // Refresh the users list
      this.applyFiltersAndSorting()
      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    }
  }

  /**
   * Searches users by query string
   * @param query Search query
   * @param callback Function to call with the search results
   */
  static async searchUsers(query: string, callback: (users: (User & { status: string })[]) => void) {
    try {
      // Clear any existing timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }

      this.searchQuery = query

      // If query is empty, show all users
      if (!query.trim()) {
        this.applyFiltersAndSorting()
        return
      }

      // Add debounce to prevent too many API calls
      this.searchTimeout = window.setTimeout(async () => {
        const searchResults = await UserModel.searchUsers(query)
        this.users = searchResults
        this.applyFiltersAndSorting()
      }, 300) // 300ms debounce
    } catch (error) {
      console.error('Error searching users:', error)
      callback([])
    }
  }

  /**
   * Sets the sorting options for the user list
   * @param options Sorting options
   */
  static setSortOptions(options: SortOptions) {
    this.sortOptions = options
    this.applyFiltersAndSorting()
  }

  /**
   * Applies current filters and sorting to the user list
   */
  private static applyFiltersAndSorting() {
    if (!this.updateCallback) return

    let processedUsers = [...this.users]
    
    // Apply search filter if there's a search query
    if (this.searchQuery.trim()) {
      processedUsers = processedUsers.filter(user => {
        const searchableFields = [
          user.first_name,
          user.last_name,
          user.email_address,
          user.status
        ].filter(Boolean) as string[]
        
        return searchableFields.some(field => 
          field.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      })
    }
    
    // Apply sorting
    processedUsers = this.sortUsers(processedUsers)
    
    // Call the callback with the processed users
    this.updateCallback(processedUsers)
  }

  /**
   * Sorts users based on the current sort options
   * @param users Users to sort
   * @returns Sorted users
   */
  private static sortUsers(users: (User & { status: string })[]): (User & { status: string })[] {
    return [...users].sort((a, b) => {
      const aValue = a[this.sortOptions.field as keyof User]
      const bValue = b[this.sortOptions.field as keyof User]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortOptions.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      return 0
    })
  }

  /**
   * Creates a new user
   * @param userData User data to create
   * @returns Promise<User | null> Created user data or null if failed
   */
  static async createUser(userData: Partial<User>): Promise<User | null> {
    try {
      const newUser = await UserModel.createUser(userData)
      await this.fetchUsers() // Refresh the users list
      this.applyFiltersAndSorting()
      return newUser
    } catch (error) {
      console.error('Error creating user:', error)
      return null
    }
  }
} 