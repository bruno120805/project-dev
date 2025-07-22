"use client";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";

function getPagination(
  current: number,
  total: number,
  delta: number = 2,
): (number | string)[] {
  const range: (number | string)[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);

  if (left > 2) {
    range.push("...");
  }

  for (let i = left; i <= right; i++) {
    range.push(i);
  }

  if (right < total - 1) {
    range.push("...");
  }

  if (total > 1) {
    range.push(total);
  }

  return range;
}

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function PaginatedComponent({
  currentPage,
  totalPages,
  onPageChange,
}: Props) {
  return (
    <Pagination className="mb-4">
      <PaginationContent>
        {/* Botón Anterior */}
        <PaginationItem>
          <PaginationPrevious
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
            className={
              currentPage === 1 ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>

        {/* Páginas con puntos suspensivos */}
        {getPagination(currentPage, totalPages).map((item, index) => (
          <PaginationItem key={index}>
            {typeof item === "number" ? (
              <PaginationLink
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPageChange(item);
                }}
                className={currentPage === item ? "bg-black text-white" : ""}
              >
                {item}
              </PaginationLink>
            ) : (
              <span className="px-2 text-gray-500 select-none">...</span>
            )}
          </PaginationItem>
        ))}

        {/* Botón Siguiente */}
        <PaginationItem>
          <PaginationNext
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
            className={
              currentPage === totalPages ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
