import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ReviewFormProps {
  professorId: number;
  onReviewSubmit: (review: {
    rating: number;
    difficulty: number;
    text: string;
  }) => void;
}

export default function ReviewForm({
  professorId,
  onReviewSubmit,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || difficulty === 0 || text.trim() === "") {
      alert("Por favor, completa todos los campos.");
      return;
    }

    onReviewSubmit({ rating, difficulty, text });
    setRating(0);
    setDifficulty(0);
    setText("");
  };

  return (
    <Card className="p-4 mt-4">
      <h3 className="text-lg font-semibold mb-2">Agregar una reseña</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        />
        <Input
          type="number"
          min="1"
          max="5"
          value={difficulty}
          onChange={(e) => setDifficulty(Number(e.target.value))}
        />
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe tu experiencia..."
        />
        <Button type="submit" className="bg-[#0a1629] hover:bg-[#1a2639]">
          Enviar Reseña
        </Button>
      </form>
    </Card>
  );
}
