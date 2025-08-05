"use client";

import NoteCard from "@/app/components/NoteCard";
import { Note } from "@/app/types/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getNoteByID, getNotes } from "../../api";
import { useProfessorStore } from "@/store/professorStore";
import SubjectSelector from "@/app/components/SubjectSelector";
import PaginatedComponent from "@/app/components/Paginated";
import { useAuth } from "@/app/context/AuthContext";
import NotAuthorized from "@/app/components/NotFoundPage";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { useDebounce } from "@/app/hooks/use-debounce";

const ApunteCard = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedMateria, setSelectedMateria] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const notesPerPage = 6;
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useParams();
  const professorId = parseInt(id as string, 10);
  const { professorName } = useProfessorStore((state) => state);

  const debouncedSearchTerm = useDebounce(text, 500);

  useEffect(() => {
    const fetchNotes = async () => {
      const data = await getNotes(professorId);
      setNotes(data);
    };

    fetchNotes();
  }, [professorId]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (debouncedSearchTerm.trim() === "") {
        const data = await getNotes(professorId);
        setNotes(data);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getNoteByID(debouncedSearchTerm, professorId);
        setNotes(data);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
        setNotes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [debouncedSearchTerm, professorId]);

  const filteredNotes = selectedMateria
    ? notes.filter((note) => note.subject === selectedMateria)
    : notes;

  const indexOfLastNote = currentPage * notesPerPage;
  const indexOfFirstNote = indexOfLastNote - notesPerPage;
  const currentNotes = filteredNotes.slice(indexOfFirstNote, indexOfLastNote);
  const totalPages = Math.ceil(filteredNotes.length / notesPerPage);

  if (!user?.username) {
    return <NotAuthorized />;
  }

  return (
    <>
      <div className="relative w-full max-w-md mx-auto my-4">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>

        <Input
          type="search"
          placeholder="Nombre del apunte"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="pl-9"
          autoComplete="off"
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <ArrowLeft
          className="cursor-pointer"
          onClick={() =>
            router.push(`/professors/${professorId}?name=${professorName}`)
          }
        />
        <header className="mb-8 mt-4">
          <h1 className="text-3xl font-bold mb-1">Apuntes</h1>
          <h2 className="text-3xl font-bold">{professorName}</h2>
        </header>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <Button asChild disabled={!user?.username}>
            <Link
              href={`/notes/form/${professorId}`}
              className="flex items-center gap-2"
            >
              <span>Crear Apunte</span>
            </Link>
          </Button>

          <SubjectSelector
            selectedMateria={selectedMateria}
            onMateriaChange={(materia) => {
              setSelectedMateria(materia);
              setCurrentPage(1);
            }}
            notes={notes}
            maxSubjects={5}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : currentNotes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 m-4 cursor-pointer">
              {currentNotes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>

            <PaginatedComponent
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron apuntes.
          </div>
        )}
      </div>
    </>
  );
};

export default ApunteCard;
