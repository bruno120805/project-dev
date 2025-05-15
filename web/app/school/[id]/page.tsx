"use client";
import { getSchoolByID, getSchools } from "@/app/api";
import PaginatedComponent from "@/app/components/Paginated";
import { Professor } from "@/app/types/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GraduationCap, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function GetSchools() {
  const router = useRouter();
  const { id } = useParams();
  const schoolId = Number.parseInt(id as string);
  const LIMIT = 8;

  const [professors, setProfessors] = useState<Professor[]>([]);
  const [totalProfessors, setTotalProfessors] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState<string>("");

  const handleSubmit = async () => {
    const data = await getSchools(text);
    if (data.length > 0) {
      router.push(`/school/${data[0].id}`);
    } else {
      toast.error("No se encontraron resultados.");
    }
  };

  useEffect(() => {
    const fetchSchool = async () => {
      try {
        setIsLoading(true);
        const offset = (currentPage - 1) * LIMIT;
        const school = await getSchoolByID(schoolId, LIMIT, offset);

        setProfessors(school.professors || []);
        setTotalProfessors(school.total_professors || 0);
        setError(null);
      } catch (error) {
        setError("Failed to load professors data");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchool();
  }, [schoolId, currentPage]); // Se ejecuta al cambiar de escuela o de página

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  if (!professors.length) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        <p>No professors found for this school.</p>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="relative w-full max-w-md mx-auto my-4">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>

        <Input
          type="search"
          placeholder="Tu escuela"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="pl-9" // Padding izquierdo para dejar espacio al icono
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 m-4">
        {professors.map((professor) => (
          <Link
            key={professor.id}
            href={`/professors/${professor.id}?name=${encodeURIComponent(professor.name)}`}
          >
            <Card
              key={professor.id}
              className="overflow-hidden transition-all hover:shadow-md hover:border-primary/50 group cursor-pointer"
            >
              <CardContent className="p-5 flex flex-col items-center text-center">
                <div className="flex flex-col items-center gap-2 mb-3">
                  <div className="bg-primary/10 p-2.5 rounded-full group-hover:bg-primary/20 transition-colors">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold line-clamp-1">
                    {professor.name}
                  </h3>
                </div>

                <div className="space-y-2 w-full">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs uppercase font-medium text-muted-foreground">
                      Materia
                    </span>
                    <p className="text-sm font-medium uppercase">
                      {professor.subject}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs uppercase font-medium text-muted-foreground">
                      Reseñas
                    </span>
                    <div className="flex items-center">
                      <span className="bg-primary/10 text-primary text-sm font-medium px-3 py-0.5 rounded-full">
                        {professor.total_reviews}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Paginación */}
      <PaginatedComponent
        currentPage={currentPage}
        totalPages={Math.max(1, Math.ceil(totalProfessors / LIMIT))}
        onPageChange={setCurrentPage}
      />
    </>
  );
}
