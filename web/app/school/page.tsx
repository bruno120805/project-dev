"use client";

import type React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  Users,
  School,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSchoolsStore } from "@/store/schoolsStore";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "../hooks/use-debounce";
import { getSchools } from "../api";
import { School as SchoolType } from "../types/types";
import Link from "next/link";

export default function SchoolPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedUniversity, setSearchedUniversity] = useState<string | null>(
    null,
  );
  const [filteredSchools, setFilteredSchools] = useState<SchoolType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const schools = useSchoolsStore((state) => state.schools);

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch schools when debounced search term changes
  useEffect(() => {
    const fetchSchools = async () => {
      if (debouncedSearchTerm.trim() === "") {
        setFilteredSchools(schools);
        setSearchedUniversity(null);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getSchools(debouncedSearchTerm);
        setFilteredSchools(data);
        setSearchedUniversity(debouncedSearchTerm.toUpperCase());
      } catch (error) {
        console.error("Error fetching schools:", error);
        setFilteredSchools([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchools();
  }, [debouncedSearchTerm, schools]);

  // Inicializar las escuelas filtradas con todas las escuelas al cargar
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSchools(schools);
    }
  }, [schools, searchTerm]);

  // Función para manejar la búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // La búsqueda se maneja automáticamente por el efecto del término debounced
  };

  // Manejar cambios en el campo de búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="space-y-6">
        {/* Encabezado */}
        <h1 className="text-xl font-semibold">
          Escribe el nombre de la universidad
        </h1>

        {/* Formulario de búsqueda */}
        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Tu búsqueda"
              className="pl-10 pr-4 py-2 w-full"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </form>

        {/* Resultados de búsqueda */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredSchools && filteredSchools.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-base font-medium">
              {searchedUniversity
                ? `Resultados para ${searchedUniversity}`
                : "Universidades disponibles"}
            </h2>

            <div className="space-y-3">
              {filteredSchools.map((school) => (
                <Link href={`/school/${school.id}`} key={school.id}>
                  <Card
                    key={school.id}
                    className="p-5 hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary m-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2">
                          <School className="h-5 w-5 text-primary" />
                          <h3 className="font-semibold text-lg first-letter:uppercase">
                            {school.name}
                          </h3>
                        </div>

                        <div className="flex items-start gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <p className="text-sm uppercase">{school.address}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Users className="h-3 w-3" />
                            <span>{school.total_professors} profesores</span>
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-center h-full">
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchedUniversity
                ? `No se encontraron resultados para "${searchedUniversity}"`
                : "Ingresa un término de búsqueda para encontrar universidades"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
