"use client";

import type React from "react";

import { createReview } from "@/app/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import TeacherFeedback from "@/app/components/TeacherFeedback";

export default function Page() {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    text: "",
    subject: "",
    difficulty: 7,
    rating: 4,
    would_take_again: true,
    tags: [] as string[],
  });

  const professorId = parseInt(id as string, 10);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, text: e.target.value });
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, subject: e.target.value });
  };

  const handleDifficultyChange = (value: number[]) => {
    setFormData({ ...formData, difficulty: value[0] });
  };

  const handleRatingChange = (value: number[]) => {
    setFormData({ ...formData, rating: value[0] });
  };

  const handleWouldTakeAgainChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      would_take_again: checked,
    }));
  };

  const handleTagsChange = ({ selectedTags }: { selectedTags: string[] }) => {
    console.log(selectedTags);
    setFormData((prev) => ({
      ...prev,
      tags: selectedTags,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar que los campos obligatorios no estén vacíos
    if (!formData.text.trim() || !formData.subject.trim()) {
      toast.error("Todos los campos son obligatorios");
      return;
    }

    try {
      await createReview(formData, professorId);
      toast.success("Evaluación enviada con éxito");

      router.push(`/professors/${professorId}`);
    } catch (error: any) {
      if (error instanceof Error) {
        console.log(error);
        toast.error(error.message);
      } else {
        toast.error("Ocurrió un error desconocido");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-4xl shadow-lg">
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-lg text-primary hover:underline mt-2 ml-2"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
          </button>
        </div>
        <CardHeader className=" rounded-t-lg py-8">
          <CardTitle className="text-3xl md:text-4xl text-center">
            Evaluación de Curso
          </CardTitle>
          <CardDescription className="text-center text-base md:text-lg mt-2">
            Comparte tu experiencia sobre este curso
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 pt-8 px-6 md:px-10">
            <div className="space-y-3">
              <Label htmlFor="subject" className="text-lg">
                Asignatura
              </Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={handleSubjectChange}
                className="text-lg py-6"
              />
            </div>

            <TeacherFeedback
              selectedTags={formData.tags}
              onFeedbackChange={handleTagsChange}
            />

            <div className="space-y-3">
              <Label htmlFor="text" className="text-lg">
                Comentario
              </Label>
              <Textarea
                id="text"
                rows={6}
                value={formData.text}
                onChange={handleTextChange}
                className="text-lg resize-none"
              />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="difficulty" className="text-lg">
                      Dificultad
                    </Label>
                    <span className="text-lg font-medium bg-primary/10 px-3 py-1 rounded-full">
                      {formData.difficulty}/10
                    </span>
                  </div>
                  <Slider
                    id="difficulty"
                    min={1}
                    max={10}
                    step={1}
                    value={[formData.difficulty]}
                    onValueChange={handleDifficultyChange}
                    className="py-4"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="rating" className="text-lg">
                      Calificación
                    </Label>
                    <span className="text-lg font-medium bg-primary/10 px-3 py-1 rounded-full">
                      {formData.rating}/5
                    </span>
                  </div>
                  <Slider
                    id="rating"
                    min={1}
                    max={5}
                    step={1}
                    value={[formData.rating]}
                    onValueChange={handleRatingChange}
                    className="py-4"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between  p-6 rounded-lg">
              <Label
                htmlFor="would-take-again"
                className="cursor-pointer text-lg"
              >
                ¿Tomarías este curso de nuevo?
              </Label>
              <Switch
                id="would-take-again"
                checked={formData.would_take_again}
                onCheckedChange={handleWouldTakeAgainChange}
                className="scale-125 cursor-pointer"
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t p-8">
            <Button
              type="submit"
              className="text-lg py-6 px-8 w-full md:w-auto"
            >
              Enviar evaluación
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
