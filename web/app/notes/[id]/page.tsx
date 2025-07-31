"use client";
import NoteCard from "@/app/components/NoteCard";
import { Note } from "@/app/types/types";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getNotes } from "../../api";
import { useProfessorStore } from "@/store/professorStore";
import SubjectSelector from "@/app/components/SubjectSelector";
import PaginatedComponent from "@/app/components/Paginated";
import { useAuth } from "@/app/context/AuthContext";
import NotAuthorized from "@/app/components/NotFoundPage";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ApunteCard = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedMateria, setSelectedMateria] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const notesPerPage = 6;
  const router = useRouter();
  const { user } = useAuth();

  const { id } = useParams();
  const professorId = parseInt(id as string, 10);
  const { professorName } = useProfessorStore((state) => state);

  useEffect(() => {
    const fetchNotes = async () => {
      const data = await getNotes(professorId);
      setNotes(data);
    };

    fetchNotes();
  }, [professorId]);

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
            setCurrentPage(1); // Reiniciar página al cambiar materia
          }}
          notes={notes}
        />
      </div>

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
    </div>
  );
};

export default ApunteCard;
