"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { getProfessors, getSchoolByID } from "../api";
import { School } from "../types/types";
import PaginatedComponent from "../components/Paginated";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useProfessorsStore } from "@/store/professorsStore";

const LIMIT = 8; // Definir el límite como constante global

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

  useEffect(() => {
    const totalPages = Math.ceil(professors.length / LIMIT);
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [professors.length, currentPage]);

  const startIndex = (currentPage - 1) * LIMIT;
  const paginatedProfessors = professors.slice(startIndex, startIndex + LIMIT);

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
          className="pl-9" // Padding izquierdo para dejar espacio al icono
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 m-4">
        {paginatedProfessors.map((professor) => (
          <Card
            key={professor.id}
            className="overflow-hidden transition-all hover:shadow-md hover:border-primary/50 group"
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
        totalPages={Math.max(1, Math.ceil(professors.length / LIMIT))}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default ProfessorsPage;
