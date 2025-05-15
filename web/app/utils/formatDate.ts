export function formatDate(dateString?: string): string {
  if (!dateString) return "Fecha no disponible";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "Fecha inválida";

  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}
