"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  X,
  Upload,
  FileText,
  ImageIcon,
  File,
  Video,
  Music,
  BookOpenIcon,
  ArrowLeft,
} from "lucide-react";
import { NotesForm } from "@/app/types/types";
import { useParams, useRouter } from "next/navigation";
import { createNote } from "@/app/api";
import { toast } from "react-toastify";

export default function NoteForm() {
  const [formData, setFormData] = useState<NotesForm>({
    content: "",
    subject: "",
    title: "",
    files: [],
  });

  const router = useRouter();
  const params = useParams();
  const professorId = parseInt(params.id as string, 10);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    field: keyof Omit<NotesForm, "files" | "files_url">,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith("image/"))
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    if (type.startsWith("video/"))
      return <Video className="h-5 w-5 text-purple-500" />;
    if (type.startsWith("audio/"))
      return <Music className="h-5 w-5 text-green-500" />;
    if (type.includes("pdf"))
      return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...newFiles],
    }));
  };

  const removeFile = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createNote(formData, professorId);
      toast.success("Apunte subido con éxito");
      router.push(`/notes/${professorId}`);
    } catch (error: any) {
      if (error.message === "file too large") {
        toast.error("El archivo es demasiado grande. Máximo 10MB.");
      } else if (error.message == "invalid file extension") {
        toast.error("Extensión de archivo no válida. Solo PDF e imágenes.");
      } else {
        toast.error(error.message || "Error al subir el apunte");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-2 pb-8 text-center">
          <ArrowLeft className="cursor-pointer" onClick={() => router.back()} />
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
            <BookOpenIcon className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Sube tu apunte y ayuda a otros estudiantes
          </CardTitle>
          <CardDescription className="text-gray-600 text-lg">
            Completa la información y sube tus apuntes
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Title */}
            <div className="space-y-3">
              <Label
                htmlFor="title"
                className="text-sm font-semibold text-gray-700"
              >
                Título
              </Label>
              <Input
                id="title"
                placeholder="Ingresa un título llamativo..."
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors duration-200 rounded-xl"
              />
            </div>

            {/* Subject */}
            <div className="space-y-3">
              <Label
                htmlFor="subject"
                className="text-sm font-semibold text-gray-700"
              >
                Materia
              </Label>
              <Input
                id="subject"
                placeholder="Escribe la materia del apunte..."
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors duration-200 rounded-xl"
              />
            </div>

            {/* Content */}
            <div className="space-y-3">
              <Label
                htmlFor="content"
                className="text-sm font-semibold text-gray-700"
              >
                Contenido
              </Label>
              <Textarea
                id="content"
                placeholder="Escribe tu contenido aquí... Sé creativo y detallado."
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                className="min-h-[140px] border-2 border-gray-200 focus:border-blue-500 transition-colors duration-200 rounded-xl resize-none"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-gray-700">
                Archivos
              </Label>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
                  ${
                    isDragOver
                      ? "border-blue-500 bg-blue-50 scale-105"
                      : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                  }
                `}
              >
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <Upload
                      className={`h-6 w-6 ${
                        isDragOver ? "text-blue-600" : "text-gray-500"
                      }`}
                    />
                  </div>
                  <p className="text-lg font-medium text-gray-700">
                    {isDragOver
                      ? "¡Suelta los archivos aquí!"
                      : "Arrastra archivos aquí"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Soporta PDF e imágenes (PNG, JPG, JPEG) solo hasta 10MB
                  </p>
                </div>

                {/* Botón separado para abrir selector */}
                <div className="mt-6">
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Seleccionar Archivos
                  </Button>
                </div>

                {/* Input oculto para archivos */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,image/png,image/jpeg"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0"
                  tabIndex={-1}
                />
              </div>

              {/* File List */}
              {formData.files.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Archivos seleccionados ({formData.files.length})
                    </span>
                  </div>

                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {formData.files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 group hover:shadow-md transition-all duration-200"
                      >
                        {getFileIcon(file)}
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-medium text-gray-900 truncate"
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-100 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                disabled={
                  !formData.title.trim() ||
                  !formData.subject.trim() ||
                  !formData.content.trim()
                }
              >
                <Upload className="mr-2 h-5 w-5" />
                Subir apunte
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
