import { create } from 'zustand';

interface CreditsState {
  // trigger for credit updates, incremented each time credits change
  updateTrigger: number;
  // method to trigger credit updates
  triggerUpdate: () => void;
}

/**
 * Credits store for managing credit balance updates.
 *
 * This store provides a simple trigger mechanism to notify components
 * when credits have been consumed or updated, ensuring UI components can
 * refetch the latest credit balance.
 */
export const useCreditsStore = create<CreditsState>((set) => ({
  updateTrigger: 0,
  triggerUpdate: () =>
    set((state) => ({
      updateTrigger: state.updateTrigger + 1,
    })),
}));
