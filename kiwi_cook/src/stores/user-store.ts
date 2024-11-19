import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'boot/axios.ts';

export const useUserStore = defineStore('user', () => {
  const user = ref(null);

  const login = async (username?: string, password?: string) => {
    try {
      if (username && password) {
        // If credentials are provided, send a login request
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        await api.post('/users/token', formData, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          withCredentials: true, // Ensures cookies are sent with the request
        });

        console.debug('Login successful');
        return { message: 'Login successful' }; // No need to handle token manually
      }

      // Check if the user is already authenticated by validating the cookie
      const response = await api.get('/protected-route', {
        withCredentials: true, // Sends the cookie to the server
      });

      console.debug('Authenticated via cookie');
      return response.data; // Return the authenticated user data
    } catch (error) {
      console.error('Authentication failed', error);
      throw error;
    }
  };

  const logout = () => {
    user.value = null;
  };

  return {
    user,
    login,
    logout,
  };
});
