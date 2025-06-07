"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUp, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { getNotesByID } from "@/app/api";
import { useParams, useRouter } from "next/navigation";
import { Note } from "@/app/types/types";
import PDFViewer from "@/app/components/PDFViewer";
import ImageViewer from "@/app/components/ImageViewer";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function NotesPage() {
  const { id } = useParams();
  const [notes, setNotes] = useState<Note>();
  const [scrollY, setScrollY] = useState(0);
  const noteId = parseInt(id as string, 10);
  const router = useRouter();

  useEffect(() => {
    const fetchNotes = async () => {
      const data = await getNotesByID(noteId);

      setNotes(data);
    };

    fetchNotes();
  }, [noteId]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const downloadImagesAsZip = async () => {
    if (!notes?.files_url) return;

    const zip = new JSZip();
    const folder = zip.folder("archivos");

    for (const fileUrl of notes.files_url) {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const filename = fileUrl.split("/").pop() || "archivo";

      folder?.file(filename, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "apuntes.zip");
  };

  function goTop() {
    document.body.scrollIntoView();
  }

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
        <div>
          <span>{`${notes?.content}`}</span>
        </div>

        <Tabs defaultValue="ver-apunte" className="mb-8">
          <TabsList className="grid grid-cols-2 gap-3 w-full max-w-md">
            <TabsTrigger value="ver-apunte">Ver apunte</TabsTrigger>
            <TabsTrigger value="descargar" className="bg-slate-900 text-white">
              Descargar
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
                  const isPdf = file.toLowerCase().endsWith(".pdf");

                  return isPdf ? (
                    <PDFViewer key={file} fileUrl={file} />
                  ) : (
                    <ImageViewer key={file} fileUrl={file} />
                  );
                })
              )}
            </div>{" "}
          </TabsContent>
          <TabsContent value="resumen" className="mt-6">
            <div className="border rounded-lg p-6 min-h-[400px] bg-white">
              <p className="text-gray-500 text-center">
                Resumen del apunte se mostrará aquí
              </p>
            </div>
          </TabsContent>
          <TabsContent value="flashcards" className="mt-6">
            <div className="border rounded-lg p-6 min-h-[400px] bg-white">
              <p className="text-gray-500 text-center">
                Flashcards se mostrarán aquí
              </p>
            </div>
          </TabsContent>
          <TabsContent value="generar-quiz" className="mt-6">
            <div className="border rounded-lg p-6 min-h-[400px] bg-white">
              <p className="text-gray-500 text-center">
                Generador de quiz se mostrará aquí
              </p>
            </div>
          </TabsContent>
          <TabsContent value="descargar" className="mt-6">
            <div className="border rounded-lg p-6 min-h-[400px] bg-white">
              <div className="flex justify-center items-center h-full">
                <Button
                  onClick={downloadImagesAsZip}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar todo
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

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

        {/* <div className="border rounded-lg overflow-hidden"> */}
        {/*   <table className="w-full"> */}
        {/*     <tbody> */}
        {/*       <tr className="border-b"> */}
        {/*         <td className="py-3 px-4 font-medium bg-gray-50"> */}
        {/*           Institución */}
        {/*         </td> */}
        {/*         <td className="py-3 px-4">Nombre de la Institución</td> */}
        {/*       </tr> */}
        {/*       <tr className="border-b"> */}
        {/*         <td className="py-3 px-4 font-medium bg-gray-50"> */}
        {/*           Fecha de creación */}
        {/*         </td> */}
        {/*         <td className="py-3 px-4">17/11/12</td> */}
        {/*       </tr> */}
        {/*       <tr className="border-b"> */}
        {/*         <td className="py-3 px-4 font-medium bg-gray-50">Materia</td> */}
        {/*         <td className="py-3 px-4">Cálculo Vectorial</td> */}
        {/*       </tr> */}
        {/*       <tr> */}
        {/*         <td className="py-3 px-4 font-medium bg-gray-50">Páginas</td> */}
        {/*         <td className="py-3 px-4">5</td> */}
        {/*       </tr> */}
        {/*     </tbody> */}
        {/*   </table> */}
        {/* </div> */}
      </div>
    </main>
  );
}
