import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWaveStore = create(
    persist(
        (set, get) => ({
            myWaves: [],
            alliesWaves: [],
            viewedWaves: [], // wave IDs user has viewed
            isLoading: false,
            error: null,

            setMyWaves: (waves) => set({ myWaves: waves }),

            addMyWave: (wave) => set((state) => ({
                myWaves: [...state.myWaves, wave],
            })),

            deleteMyWave: (waveId) => set((state) => ({
                myWaves: state.myWaves.filter((w) => w._id !== waveId),
            })),

            setAlliesWaves: (waves) => set({ alliesWaves: waves }),

            markWaveViewed: (waveId) => set((state) => ({
                viewedWaves: [...new Set([...state.viewedWaves, waveId])],
            })),

            isWaveViewed: (waveId) => {
                return get().viewedWaves.includes(waveId);
            },

            setLoading: (isLoading) => set({ isLoading }),

            setError: (error) => set({ error }),
        }),
        {
            name: 'skillswap-waves',
            partialize: (state) => ({ viewedWaves: state.viewedWaves }),
        }
    )
);

export default useWaveStore;
