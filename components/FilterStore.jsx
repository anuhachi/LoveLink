import { create } from 'zustand';

// Define the Zustand store
const useFilterStore = create((set) => ({
  // Initial state
  minAge: 18,
  maxAge: 40,
  gender: 'female',
  ageRange: '18-25',

  // Action to update filters
  setFilters: (newFilters) =>
    set((state) => ({
      ...state,
      ...newFilters,
    })),

  // Action to update a specific filter
  setMinAge: (minAge) => set({ minAge }),
  setMaxAge: (maxAge) => set({ maxAge }),
  setGender: (gender) => set({ gender }),
  setAgeRange: (ageRange) => set({ ageRange }),
}));

export default useFilterStore;
