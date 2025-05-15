import { Professor } from "@/app/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProfessorsStore {
  professors: Professor[];
  setProfessors: (professors: Professor[]) => void;
}

export const useProfessorsStore = create(
  persist<ProfessorsStore>(
    (set) => ({
      professors: [],
      setProfessors: (professors) => set({ professors }),
    }),
    { name: "professors-storage" },
  ),
);
