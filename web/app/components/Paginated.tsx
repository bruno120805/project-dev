"use client";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";

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

        {/* Números de Página */}
        {[...Array(totalPages)].map((_, index) => {
          const page = index + 1;
          return (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={(e) => {
                  e.preventDefault(); // <--- clave
                  e.stopPropagation();
                  onPageChange(page);
                }}
                className={currentPage === page ? "bg-black text-white" : ""}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {/* Botón Siguiente */}
        <PaginationItem>
          <PaginationNext
            onClick={(e) => {
              e.preventDefault(); // <--- clave
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
