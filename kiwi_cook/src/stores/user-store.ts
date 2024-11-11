import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from 'boot/axios.ts';

export const useUserStore = defineStore('user', () => {
  const user = ref(null);

  const login = (username: string, password: string) => api.post('/login', { username, password })
    .then((r) => {
      user.value = r.data.response;
    });

  const logout = () => {
    user.value = null;
  };

  return {
    user,
    login,
    logout,
  };
});
