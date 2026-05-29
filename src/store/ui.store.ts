import { create } from 'zustand'

interface UiStore {
  isEditProfileOpen: boolean
  openEditProfile: () => void
  closeEditProfile: () => void
}

export const useUiStore = create<UiStore>((set) => ({
  isEditProfileOpen: false,
  openEditProfile: () => set({ isEditProfileOpen: true }),
  closeEditProfile: () => set({ isEditProfileOpen: false }),
}))
