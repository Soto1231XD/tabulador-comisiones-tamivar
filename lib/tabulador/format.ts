export function formatMXN(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(value)
}

export function sanitizeNumericInput(value: string) {
  return value.replace(/\D/g, "")
}

export function formatThousands(value: string) {
  if (!value) return ""
  const numeric = sanitizeNumericInput(value)
  if (!numeric) return ""

  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 0,
  }).format(Number(numeric))
}
