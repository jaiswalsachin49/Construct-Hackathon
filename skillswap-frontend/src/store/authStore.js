import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            setUser: (user) => {
                // Defensive: if caller passes API wrapper like { success: true, user: {...} }
                const realUser = user && typeof user === 'object' && user.user ? user.user : user;
                set({ user: realUser, isAuthenticated: !!realUser });
            },

            setToken: (token) => {
                if (token) {
                    localStorage.setItem('token', token);
                }
                set({ token, isAuthenticated: !!token });
            },

            setLoading: (isLoading) => {
                set({ isLoading });
            },

            setError: (error) => {
                set({ error });
            },

            logout: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('skillswap-auth');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            hydrateAuth: () => {
                const token = localStorage.getItem('token');
                if (token) {
                    set({ token, isAuthenticated: true });
                }
            },
        }),
        {
            name: 'skillswap-auth',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
            }),
        }
    )
);

export default useAuthStore;
