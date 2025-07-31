"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Search } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { getProfessors, getSchoolByID } from "../api";
import { School } from "../types/types";
import PaginatedComponent from "../components/Paginated";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useProfessorsStore } from "@/store/professorsStore";

const LIMIT = 8; // límite por página

const ProfessorsPage = () => {
  const professors = useProfessorsStore((state) => state.professors);
  const [schools, setSchools] = useState<Map<string, School | null>>(new Map());
  const [currentPage, setCurrentPage] = useState(1);
  const [text, setText] = useState<string>("");

  const router = useRouter();

  const handleSubmit = async () => {
    const data = await getProfessors(text);
    if (data.length > 0) {
      router.push(`/professors`);
    } else {
      toast.error("No se encontraron resultados.");
    }
  };

  useEffect(() => {
    const fetchSchools = async () => {
      const uniqueSchoolIds = new Set(professors.map((p) => p.school_id));
      const newSchools = new Map(schools);

      await Promise.all(
        Array.from(uniqueSchoolIds).map(async (schoolId) => {
          const schoolIdStr = schoolId.toString();
          if (!newSchools.has(schoolIdStr)) {
            const school = await getSchoolByID(schoolId);
            newSchools.set(schoolIdStr, school);
          }
        }),
      );

      setSchools(new Map(newSchools));
    };

    if (professors.length > 0) fetchSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [professors]);

  // Resetear página si cambia búsqueda o lista de profesores
  useEffect(() => {
    setCurrentPage(1);
  }, [text, professors]);

  // Filtrar profesores según texto de búsqueda
  const filteredProfessors = useMemo(() => {
    if (!text.trim()) return professors;
    return professors.filter((p) =>
      p.name.toLowerCase().includes(text.toLowerCase()),
    );
  }, [professors, text]);

  // Ordenar profesores por total_reviews descendente
  const sortedProfessors = useMemo(() => {
    return filteredProfessors
      .slice()
      .sort((a, b) => b.total_reviews - a.total_reviews);
  }, [filteredProfessors]);

  // Calcular paginación
  const totalPages = Math.max(1, Math.ceil(sortedProfessors.length / LIMIT));
  const startIndex = (currentPage - 1) * LIMIT;
  const paginatedProfessors = sortedProfessors.slice(
    startIndex,
    startIndex + LIMIT,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return (
    <>
      <div className="relative w-full max-w-md mx-auto my-4">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search className="h-4 w-4" />
        </div>

        <Input
          type="search"
          placeholder="Tu profesor"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          className="pl-9" // Padding para icono
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 m-4">
        {paginatedProfessors.map((professor) => (
          <Card
            key={professor.id}
            className="overflow-hidden cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group"
            onClick={() =>
              router.push(
                `/professors/${professor.id}?name=${encodeURIComponent(professor.name)}`,
              )
            }
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
                    Escuela
                  </span>
                  <p className="text-sm font-medium uppercase">
                    {schools.get(professor.school_id.toString())?.name ||
                      "Cargando..."}
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
        ))}
      </div>

      <PaginatedComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default ProfessorsPage;
