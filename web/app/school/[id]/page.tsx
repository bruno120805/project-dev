"use client";

import React, { useEffect, useState } from "react";
import { getSchoolByID, getSchools } from "@/app/api";
import PaginatedComponent from "@/app/components/Paginated";
import { Professor } from "@/app/types/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GraduationCap, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function GetSchools() {
  const router = useRouter();
  const { id } = useParams();
  const schoolId = Number.parseInt(id as string);
  const LIMIT = 8;

  const [text, setText] = useState("");
  const [schoolsOptions, setSchoolsOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const [professors, setProfessors] = useState<Professor[]>([]);
  const [totalProfessors, setTotalProfessors] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schooName, setSchoolName] = useState("");

  useEffect(() => {
    if (text.trim() === "") {
      setSchoolsOptions([]);
      setShowDropdown(false);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const results = await getSchools(text);
        setSchoolsOptions(results);
        setShowDropdown(true);
      } catch {
        toast.error("Error al buscar escuelas.");
        setSchoolsOptions([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [text]);

  const handleSelectSchool = (id: number) => {
    setText("");
    setSchoolsOptions([]);
    setShowDropdown(false);
    router.push(`/school/${id}`);
  };

  // Cargar profesores según escuela y paginación
  useEffect(() => {
    const fetchSchool = async () => {
      try {
        setIsLoading(true);
        const offset = (currentPage - 1) * LIMIT;
        const school = await getSchoolByID(schoolId, LIMIT, offset);

        setSchoolName(school.name || "");
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
  }, [schoolId, currentPage]);

  const sortedProfessors = React.useMemo(() => {
    return professors.slice().sort((a, b) => b.total_reviews - a.total_reviews);
  }, [professors]);

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
          onFocus={() => {
            if (schoolsOptions.length > 0) setShowDropdown(true);
          }}
          className="pl-9"
          autoComplete="off"
        />

        {/* Dropdown con opciones de escuelas */}
        {showDropdown && schoolsOptions.length > 0 && (
          <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-md shadow-md max-h-60 overflow-auto mt-1">
            {schoolsOptions.map((school) => (
              <li
                key={school.id}
                className="cursor-pointer px-4 py-2 hover:bg-primary/20"
                onClick={() => handleSelectSchool(school.id)}
              >
                {school.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Estado de carga */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center p-4 text-destructive">
          <p>{error}</p>
        </div>
      ) : professors.length === 0 ? (
        <div className="text-center p-4 text-muted-foreground">
          <p>No hay profesores en esta escuela.</p>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold text-center mb-6 text-slate-800">
            {schooName}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 m-4">
            {sortedProfessors.map((professor) => (
              <Link
                key={professor.id}
                href={`/professors/${professor.id}?name=${encodeURIComponent(
                  professor.name,
                )}`}
              >
                <Card className="overflow-hidden transition-all hover:shadow-md hover:border-primary/50 group cursor-pointer">
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
      )}
    </>
  );
}
