"use client";

import dynamic from "next/dynamic";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, Download, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getNotesByID } from "@/app/api";
import { useParams, useRouter } from "next/navigation";
import { Note } from "@/app/types/types";
import ImageViewer from "@/app/components/ImageViewer";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";

const PDFViewer = dynamic(() => import("@/app/components/PDFViewer"), {
  ssr: false,
});

export default function NotesPage() {
  const { id } = useParams();
  const noteId = parseInt(id as string, 10);
  const [notes, setNotes] = useState<Note>();
  const [scrollY, setScrollY] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getNotesByID(noteId);
        setNotes(data);
      } catch (err) {
        toast.error("No se pudo cargar el apunte.");
      }
    };

    fetchNotes();
  }, [noteId]);

  // Guardar posición del scroll (por si se quiere usar)
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const downloadImagesAsZip = async () => {
    if (!notes?.files_url || notes.files_url.length === 0) return;

    setIsDownloading(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder("archivos");

      for (const fileUrl of notes.files_url) {
        try {
          const response = await fetch(fileUrl);
          if (!response.ok) {
            toast.error(`No se pudo descargar: ${fileUrl}`);
            continue;
          }

          const blob = await response.blob();
          const filename = fileUrl.split("/").pop() || "archivo";
          folder?.file(filename, blob);
        } catch (error) {
          toast.error(`Error con archivo: ${fileUrl}`);
          console.error(error);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "apuntes.zip");
    } catch (error) {
      toast.error("Error al generar el archivo ZIP.");
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  const goTop = () => {
    document.body.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="container mx-auto py-8 px-4 md:px-6 lg:px-8 min-h-screen">
      <ArrowLeft
        onClick={() => router.push(`/notes/${notes?.professor_id}`)}
        className="mb-4 cursor-pointer"
      />

      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          {`Apuntes de ${notes?.subject}`}
        </h1>

        <div className="mb-4">
          <span>{notes?.content}</span>
        </div>

        <Tabs defaultValue="ver-apunte" className="mb-8">
          <TabsList className="grid grid-cols-2 gap-3 w-full max-w-md">
            <TabsTrigger value="ver-apunte">Ver apunte</TabsTrigger>
            <TabsTrigger value="descargar" onClick={downloadImagesAsZip}>
              Descargar Todo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ver-apunte" className="mt-6">
            <div className="h-full flex flex-col overflow-y-auto">
              {notes?.files_url.length === 0 ? (
                <p className="text-gray-500 text-center">
                  Contenido del apunte se mostrará aquí
                </p>
              ) : (
                notes?.files_url.map((file) => {
                  if (!file || typeof file !== "string") return null;
                  const isPdf = file.toLowerCase().endsWith(".pdf");

                  return isPdf ? (
                    <PDFViewer key={file} fileUrl={file} />
                  ) : (
                    <ImageViewer key={file} fileUrl={file} />
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <div
        className={
          "fixed bottom-0 z-[10] flex w-full p-10 duration-200 " +
          (scrollY > 0
            ? " opacity-full pointer-events-auto"
            : " pointer-events-none opacity-0")
        }
      >
        <button
          onClick={goTop}
          className="ml-auto grid aspect-square cursor-pointer place-items-center rounded-full bg-slate-900 px-3 text-white hover:bg-slate-800 sm:px-4"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
    </main>
  );
}
