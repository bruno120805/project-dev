import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Note } from "../types/types";

interface MateriaSelectorProps {
  selectedMateria: string | null;
  onMateriaChange: (materia: string | null) => void;
  notes: Note[];
  maxSubjects?: number;
}

const SubjectSelector: React.FC<MateriaSelectorProps> = ({
  selectedMateria,
  onMateriaChange,
  notes,
  maxSubjects,
}) => {
  const uniqueSubjects = Array.from(new Set(notes.map((note) => note.subject)));

  const limitedSubjects = maxSubjects
    ? uniqueSubjects.slice(0, maxSubjects)
    : uniqueSubjects;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-between w-1/2 sm:w-auto"
        >
          {selectedMateria || "Todas las materias"}
          <ChevronDown size={16} className="ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onMateriaChange(null)}>
          Todas las materias
        </DropdownMenuItem>
        {limitedSubjects.map((materia) => (
          <DropdownMenuItem
            key={materia}
            onClick={() => onMateriaChange(materia)}
          >
            {materia}
          </DropdownMenuItem>
        ))}
        {maxSubjects && uniqueSubjects.length > maxSubjects && (
          <DropdownMenuItem disabled>
            +{uniqueSubjects.length - maxSubjects} más...
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SubjectSelector;
