import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProfessorStore {
  professorName: string | null;
  setProfessorName: (name: string) => void;
}

export const useProfessorStore = create<ProfessorStore>()(
  persist(
    (set) => ({
      professorName: null,
      setProfessorName: (name) => set({ professorName: name }),
    }),
    {
      name: "professor-name-storage",
    },
  ),
);
