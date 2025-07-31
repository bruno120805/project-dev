import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import TagSelector from "./TagSelector";

interface TeacherFeedbackProps {
  selectedTags: string[];
  onFeedbackChange?: (feedback: { selectedTags: string[] }) => void;
}

const TeacherFeedback = ({ onFeedbackChange }: TeacherFeedbackProps) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Tags basados en la imagen proporcionada
  const feedbackTags = [
    // Aspectos positivos
    { id: "excelente", label: "Excelente", category: "positive" as const },
    {
      id: "buena-retroalimentacion",
      label: "Da Buena Retroalimentación",
      category: "positive" as const,
    },
    {
      id: "brinda-apoyo",
      label: "Brinda Apoyo",
      category: "positive" as const,
    },
    {
      id: "clases-excelentes",
      label: "Clases Excelentes",
      category: "positive" as const,
    },
    {
      id: "credito-extra",
      label: "Da Crédito Extra",
      category: "positive" as const,
    },

    // Aspectos neutrales/informativos
    {
      id: "asistencia-obligatoria",
      label: "Asistencia Obligatoria",
      category: "neutral" as const,
    },
    {
      id: "respetado-estudiantes",
      label: "Respetado por los Estudiantes",
      category: "neutral" as const,
    },
    {
      id: "examenes-sorpresa",
      label: "Hace Exámenes Sorpresa",
      category: "neutral" as const,
    },
    {
      id: "participacion-importante",
      label: "La Participación Importa",
      category: "neutral" as const,
    },
    {
      id: "clases-largas",
      label: "Las Clases son Largas",
      category: "neutral" as const,
    },

    // Aspectos negativos/desafiantes
    {
      id: "califica-duro",
      label: "Califica Duro",
      category: "negative" as const,
    },
    {
      id: "no-enseña-nada",
      label: "No Enseña Nada",
      category: "negative" as const,
    },
    {
      id: "muchas-tareas",
      label: "Muchas Tareas",
      category: "negative" as const,
    },
    {
      id: "examenes-dificiles",
      label: "Los Exámenes son Difíciles",
      category: "negative" as const,
    },
    {
      id: "pocos-examenes",
      label: "Pocos Exámenes",
      category: "negative" as const,
    },
    {
      id: "muchos-examenes",
      label: "Muchos Exámenes",
      category: "negative" as const,
    },
    {
      id: "deja-trabajos-largos",
      label: "Deja Trabajos Largos",
      category: "negative" as const,
    },
    {
      id: "muchos-proyectos",
      label: "Muchos Proyectos Grupales",
      category: "negative" as const,
    },
    {
      id: "tomaria-otra-vez",
      label: "Tomaría su Clase Otra Vez",
      category: "positive" as const,
    },
  ];

  const handleTagToggle = (tagId: string) => {
    const newSelectedTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId];

    setSelectedTags(newSelectedTags);

    if (onFeedbackChange) {
      onFeedbackChange({
        selectedTags: newSelectedTags,
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="space-y-6">
        <TagSelector
          tags={feedbackTags}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
          title="¿Cómo describirías a este profesor?"
        />

        {selectedTags.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">
              Has seleccionado {selectedTags.length} etiqueta
              {selectedTags.length !== 1 ? "s" : ""}
            </p>
            <div className="text-xs text-gray-500">
              💡 Tip: Puedes hacer clic en las etiquetas para deseleccionarlas
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherFeedback;
