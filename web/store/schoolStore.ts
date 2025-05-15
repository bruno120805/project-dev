import { School } from "@/app/types/types";
import { create } from "zustand";

interface SchoolStore {
  school: School | null;
  setSchool: (school: School) => void;
}

export const useSchoolStore = create<SchoolStore>((set) => ({
  school: null,
  setSchool: (school) => set({ school }),
}));
