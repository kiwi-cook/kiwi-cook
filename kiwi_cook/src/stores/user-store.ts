import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { api } from 'boot/axios'
import type { User } from 'src/models/user'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  async function login(username?: string, password?: string) {
    loading.value = true
    error.value = null

    try {
      if (username && password) {
        // If credentials are provided, send a login request
        const formData = new URLSearchParams()
        formData.append('username', username)
        formData.append('password', password)

        const response = await api.post('/users/login', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          withCredentials: true, // Ensures cookies are sent with the request
        })

        // Assuming the server returns user data with token upon successful login
        user.value = response.data

        return { message: 'Login successful' }
      }

      return user.value
    } catch (err) {
      error.value = 'Authentication failed. Please try again.'

      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await api.post('/users/logout', {}, { withCredentials: true })
      user.value = null
    } catch (err) {
      error.value = 'Logout failed. Please try again.'
      throw new Error(error.value)
    }
  }

  async function register(username: string, password: string) {
    loading.value = true
    error.value = null

    if (!username || !password) {
      error.value = 'Please provide username and password'
      throw new Error(error.value)
    }

    try {
      if (username && password) {
        const formData = new URLSearchParams()
        formData.append('username', username)
        formData.append('password', password)

        const response = await api.post('/users/add', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          withCredentials: true,
        })

        // Assuming the server returns user data with token upon successful login
        user.value = response.data

        return { message: 'Registration successful' }
      }

      // Check if the user is already authenticated by validating the cookie
      const response = await api.get('/protected-route', {
        withCredentials: true, // Sends the cookie to the server
      })

      user.value = response.data
      return user.value
    } catch (err) {
      error.value = 'Registration failed. Please try again.'

      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    register,
    clearError,
  }
})
