"use client";
import { cn } from "@/lib/utils";
import { Note } from "../types/types";
import { CalendarIcon } from "lucide-react";
import { formatDate } from "../utils/formatDate";
import { useRouter } from "next/navigation";

interface NoteCardProps {
  note: Note;
}

const NoteCard = ({ note }: NoteCardProps) => {
  const router = useRouter();

  const handleOnClick = () => {
    router.push(`/notes/${note.id}/view`);
  };

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden transition-all hover:shadow-md",
      )}
    >
      <button
        onClick={() => handleOnClick()}
        className="p-4 flex flex-col justify-between h-full text-left w-full cursor-pointer"
      >
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-gray-500">{3} páginas</div>
          <h3 className="font-medium text-base">{note.title}</h3>
        </div>

        <div className="pt-4 flex items-center text-gray-500 text-sm">
          <CalendarIcon size={14} className="mr-1" />
          <span>{formatDate(note.created_at)}</span>
        </div>
      </button>
    </div>
  );
};

export default NoteCard;
