import { School } from "@/app/types/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SchoolStore {
  schools: School[];
  setSchools: (schools: School[]) => void;
}

export const useSchoolsStore = create(
  persist<SchoolStore>(
    (set) => ({
      schools: [],
      setSchools: (schools) => set({ schools }),
    }),
    { name: "school-storage" },
  ),
);
