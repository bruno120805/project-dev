import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Flag, Star, Users } from "lucide-react";
import type { Review } from "../types/types";
import { formatDate } from "../utils/formatDate";

interface ProfessorRatingProps {
  review: Review;
  professorName: string | null;
}

const ProfessorRating = ({ review, professorName }: ProfessorRatingProps) => {
  const getQualityColor = (score: number) => {
    if (score >= 8) return "text-green-800 bg-green-100 border-green-200";
    if (score >= 6) return "text-yellow-800 bg-yellow-100 border-yellow-200";
    return "text-red-800 bg-red-100 border-red-200";
  };

  const getEmojiForRating = (rating: number) => {
    if (rating >= 8) return "😊";
    if (rating >= 6) return "😐";
    return "😞";
  };

  const getDifficultyColor = (score: number) => {
    if (score <= 3) return "text-green-800 bg-green-100 border-green-200";
    if (score <= 6) return "text-yellow-800 bg-yellow-100 border-yellow-200";
    return "text-red-800 bg-red-100 border-red-200";
  };

  return (
    <Card className="w-full max-w-4xl mx-auto my-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-2xl">
                {getEmojiForRating(review.rating)}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 capitalize">
                {review.subject}
              </h3>
              {professorName && (
                <p className="text-sm text-gray-600 mt-1">
                  Prof. {professorName}
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Calendar className="w-4 h-4" />
                {formatDate(review.created_at)}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 hover:text-gray-800"
          >
            <Flag className="w-4 h-4 mr-2" />
            Reportar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Course Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Asistencia:</span>
            <Badge
              variant={review.would_take_again ? "default" : "secondary"}
              className="text-xs"
            >
              {review.would_take_again ? "Obligatoria" : "No Obligatoria"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Calificación Recibida:</span>
            <span className="text-gray-900 font-medium">N/A</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Interés en la Clase:</span>
            <span className="text-gray-900 font-medium">N/A</span>
          </div>
        </div>

        <Separator />

        {/* Scores */}
        <div className="flex flex-wrap gap-3">
          <Badge
            className={`${getQualityColor(review.rating)} font-medium border px-2 py-1`}
          >
            <span className="mr-1 font-bold text-sm">{review.rating}</span>
            <span className="text-xs">CALIDAD GENERAL</span>
          </Badge>
          <Badge
            className={`${getDifficultyColor(review.difficulty)} font-medium border px-2 py-1`}
          >
            <span className="mr-1 font-bold text-sm">{review.difficulty}</span>
            <span className="text-xs">FACILIDAD</span>
          </Badge>
        </div>

        {/* Tags */}
        {review.tags && review.tags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">
              Características:
            </h4>
            <div className="flex gap-2 flex-wrap">
              {review.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-gray-50 text-gray-700 hover:bg-gray-100 uppercase text-xs border-gray-200"
                >
                  {tag.replaceAll("-", " ")}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Comment */}
        {review.text && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-200">
            <p className="text-gray-700 leading-relaxed text-sm">
              {review.text}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfessorRating;
