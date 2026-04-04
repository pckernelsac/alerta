/** Fecha/hora localizada (Perú). */
export function formatDateTime(ts: number): string {
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(ts));
}
