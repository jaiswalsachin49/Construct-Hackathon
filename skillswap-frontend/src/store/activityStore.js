import { create } from 'zustand';

const useActivityStore = create((set, get) => ({
    activities: [
        {
            id: 1,
            title: 'Morning Run at Cubbon Park',
            host: {
                name: 'Alisa Chen',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
                bio: 'Avid runner & coffee enthusiast.'
            },
            category: 'Running',
            time: 'Today, 8:00 AM - 9:00 AM',
            location: 'Cubbon Park, Main Gate',
            coordinates: [12.9716, 77.5946], // Bangalore coordinates
            description: "Join us for a refreshing 5k run through the beautiful trails of Cubbon Park. We'll meet at the main gate and start with a light warm-up. All paces are welcome, from beginners to seasoned runners. Let's start the day with some positive energy!",
            attendees: [
                { id: 1, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150' },
                { id: 2, avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150&h=150' },
                { id: 3, avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=150&h=150' },
                { id: 4, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150&h=150' },
            ],
            interestedCount: 8,
            joined: false
        },
        {
            id: 2,
            title: 'Acoustic Jam Session',
            host: {
                name: 'David Kim',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
                bio: 'Guitarist and music lover.'
            },
            category: 'Music',
            time: 'Tonight, 7:30 PM',
            location: 'Indiranagar, 12th Main',
            coordinates: [12.9784, 77.6408],
            description: "Bring your instruments or just your voice! Casual jam session in the park. We'll play some classics and maybe improvise a bit.",
            attendees: [
                { id: 5, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150' },
                { id: 6, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150' },
            ],
            interestedCount: 4,
            joined: false
        },
        {
            id: 3,
            title: 'Italian Cooking Class',
            host: {
                name: 'Elena Rossi',
                avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150',
                bio: 'Chef and foodie.'
            },
            category: 'Cooking',
            time: 'Tomorrow, 6:00 PM',
            location: 'Koramangala, 5th Block',
            coordinates: [12.9352, 77.6245],
            description: "Learn to make authentic pasta from scratch! Ingredients provided. Just bring your appetite.",
            attendees: [
                { id: 7, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150' },
            ],
            interestedCount: 3,
            joined: false
        }
    ],
    selectedActivity: null,
    userLocation: [12.9716, 77.5946], // Default to Bangalore
    filters: {
        search: '',
        category: 'All',
        showActiveOnly: true
    },

    setActivities: (activities) => set({ activities }),
    selectActivity: (activity) => set({ selectedActivity: activity }),
    setUserLocation: (location) => set({ userLocation: location }),
    setFilter: (key, value) => set((state) => ({
        filters: { ...state.filters, [key]: value }
    })),
    joinActivity: (activityId) => set((state) => ({
        activities: state.activities.map(a =>
            a.id === activityId ? { ...a, joined: true, interestedCount: a.interestedCount + 1 } : a
        ),
        selectedActivity: state.selectedActivity?.id === activityId
            ? { ...state.selectedActivity, joined: true, interestedCount: state.selectedActivity.interestedCount + 1 }
            : state.selectedActivity
    }))
}));

export default useActivityStore;
