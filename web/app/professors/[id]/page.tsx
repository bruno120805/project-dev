"use client";

import { getProfessorByID } from "@/app/api";
import PaginatedComponent from "@/app/components/Paginated";
import { useAuth } from "@/app/context/AuthContext";
import { Review } from "@/app/types/types";
import { formatDate } from "@/app/utils/formatDate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useProfessorStore } from "@/store/professorStore";
import { ArrowLeft, Calendar, ChevronDown } from "lucide-react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfessorProfile() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [schoolName, setSchoolName] = useState<string>("");
  const reviewsPerPage = 5;
  const router = useRouter();
  const searchParams = useSearchParams();
  const professorName = searchParams.get("name");
  const { id } = useParams();
  const professorId = Number.parseInt(id as string);
  const { setProfessorName } = useProfessorStore((state) => state);
  const { user } = useAuth();

  useEffect(() => {
    const fetchReviews = async () => {
      const data = await getProfessorByID(professorId);
      setReviews(data);
    };

    fetchReviews();
  }, [professorId]);

  // Función para calcular estadísticas
  function calculateStats(reviews: Review[]) {
    if (reviews?.length === 0)
      return { avgQuality: 0, avgDifficulty: 0, wouldTakeAgainPercent: 0 };

    const totalQuality = reviews?.reduce((sum, r) => sum + r.rating, 0);
    const totalDifficulty = reviews?.reduce((sum, r) => sum + r.difficulty, 0);
    const wouldTakeAgainCount = reviews?.filter(
      (r) => r.would_take_again,
    ).length;

    return {
      avgQuality: (totalQuality / reviews?.length).toFixed(1),
      avgDifficulty: (totalDifficulty / reviews?.length).toFixed(1),
      wouldTakeAgainPercent: (
        (wouldTakeAgainCount / reviews?.length) *
        100
      ).toFixed(0),
    };
  }

  const { avgQuality, avgDifficulty, wouldTakeAgainPercent } =
    calculateStats(reviews);

  // Paginación
  const totalPages = Math.ceil(reviews?.length / reviewsPerPage);
  const paginatedReviews = reviews?.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage,
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Encabezado del profesor */}
        <div className="space-y-2">
          <ArrowLeft
            onClick={() => router.back()}
            className="w-6 h-6 mr-2 cursor-pointer"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-[#0a1629]">
            {professorName}
          </h1>
        </div>

        {/* Estadísticas */}
        <div className="flex flex-col sm:flex-row border-y py-6">
          <div className="flex-1 flex flex-col items-center border-b sm:border-b-0 sm:border-r py-4 sm:py-0">
            <span className="text-4xl font-bold text-[#0a1629]">
              {avgQuality || "N/A"}
            </span>
            <span className="text-sm text-muted-foreground text-center">
              Calidad general
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center border-b sm:border-b-0 sm:border-r py-4 sm:py-0">
            <span className="text-4xl font-bold text-[#0a1629]">
              {wouldTakeAgainPercent}%
            </span>
            <span className="text-sm text-muted-foreground text-center">
              Volverían a cursar
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center py-4 sm:py-0">
            <span className="text-4xl font-bold text-[#0a1629]">
              {avgDifficulty || "N/A"}
            </span>
            <span className="text-sm text-muted-foreground text-center">
              Nivel de dificultad
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-wrap gap-3">
          <Button
            disabled={!user?.username}
            onClick={() => router.push(`/form/${professorId}`)}
            className="bg-[#0a1629] hover:bg-[#1a2639]"
          >
            Calificar
          </Button>
          <Button
            disabled={!user?.username}
            onClick={() => {
              setProfessorName(professorName as string);
              router.push(`/notes/${professorId}`);
            }}
            variant="outline"
            className={`${user ? "order-[#0a1629] text-[#0a1629]" : "opacity-50 pointer-events-none cursor-not-allowed"}`}
          >
            Apuntes de estudiantes
          </Button>
        </div>

        {/* Sección de calificaciones */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold text-[#0a1629]">
            {reviews?.length} calificaciones de estudiantes
          </h2>

          <div className="relative w-52">
            <Button
              variant="outline"
              className="w-full justify-between"
              size="sm"
            >
              Todos los cursos
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </div>

          {/* Tarjetas de calificaciones */}
          {paginatedReviews?.map((review) => (
            <Card key={review.id} className="p-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center">
                    <span className="text-white text-xs">@</span>
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  <div className="font-medium">{review.subject}</div>
                  <p className="text-sm text-muted-foreground">{review.text}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(review.created_at)}
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Paginación */}
          {totalPages > 1 && (
            <PaginatedComponent
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
