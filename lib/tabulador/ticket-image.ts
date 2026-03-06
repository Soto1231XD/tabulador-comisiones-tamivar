function wrapLine(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  if (!text.trim()) return [""]
  const words = text.split(" ")
  const lines: string[] = []
  let current = words[0] ?? ""

  for (let i = 1; i < words.length; i += 1) {
    const candidate = `${current} ${words[i]}`
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate
    } else {
      lines.push(current)
      current = words[i]
    }
  }

  lines.push(current)
  return lines
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

function drawPerforatedSides(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 8,
  gap = 24
) {
  const start = y + 96
  const end = y + height - 40
  for (let currentY = start; currentY <= end; currentY += gap) {
    ctx.beginPath()
    ctx.fillStyle = "#f1f5f9"
    ctx.arc(x, currentY, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(x + width, currentY, radius, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function downloadTicketAsImage(ticketTexto: string) {
  if (!ticketTexto) return

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const width = 1200
  const outerX = 72
  const outerY = 44
  const ticketWidth = width - outerX * 2
  const contentPadding = 54
  const headerHeight = 138
  const lineHeight = 39
  const footerHeight = 94
  const maxTextWidth = ticketWidth - contentPadding * 2

  ctx.font = "500 30px Arial"
  const rawLines = ticketTexto.split("\n")
  const wrappedLines: string[] = []
  rawLines.forEach((line) => {
    wrapLine(ctx, line, maxTextWidth).forEach((wrapped) => wrappedLines.push(wrapped))
  })

  const contentHeight = Math.max(430, wrappedLines.length * lineHeight + 26)
  const ticketHeight = headerHeight + contentHeight + footerHeight
  const height = ticketHeight + outerY * 2

  canvas.width = width
  canvas.height = height

  ctx.fillStyle = "#f1f5f9"
  ctx.fillRect(0, 0, width, height)

  // Soft outer shadow
  ctx.save()
  ctx.shadowColor = "rgba(15, 23, 42, 0.14)"
  ctx.shadowBlur = 28
  ctx.shadowOffsetY = 10
  drawRoundedRect(ctx, outerX, outerY, ticketWidth, ticketHeight, 26)
  ctx.fillStyle = "#ffffff"
  ctx.fill()
  ctx.restore()

  // Ticket body
  drawRoundedRect(ctx, outerX, outerY, ticketWidth, ticketHeight, 26)
  ctx.fillStyle = "#ffffff"
  ctx.fill()

  // Header
  const headerGradient = ctx.createLinearGradient(outerX, outerY, outerX + ticketWidth, outerY)
  headerGradient.addColorStop(0, "#1d4ed8")
  headerGradient.addColorStop(1, "#06b6d4")
  drawRoundedRect(ctx, outerX, outerY, ticketWidth, headerHeight, 26)
  ctx.fillStyle = headerGradient
  ctx.fill()

  // Normalize header lower corners
  ctx.fillRect(outerX, outerY + 46, ticketWidth, headerHeight - 46)

  ctx.fillStyle = "#dbeafe"
  ctx.font = "600 22px Arial"
  ctx.fillText("TAMIVAR", outerX + contentPadding, outerY + 42)

  ctx.fillStyle = "#ffffff"
  ctx.font = "700 42px Arial"
  ctx.fillText("TICKET DE COMISIÓN", outerX + contentPadding, outerY + 90)

  const dateLabel = new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date())
  ctx.font = "600 21px Arial"
  ctx.fillStyle = "#e0f2fe"
  const dateWidth = ctx.measureText(dateLabel).width
  ctx.fillText(dateLabel, outerX + ticketWidth - contentPadding - dateWidth, outerY + 42)

  // Perforated sides
  drawPerforatedSides(ctx, outerX, outerY, ticketWidth, ticketHeight)

  // Separator
  ctx.beginPath()
  ctx.setLineDash([12, 10])
  ctx.strokeStyle = "#cbd5e1"
  ctx.lineWidth = 3
  const separatorY = outerY + headerHeight + 18
  ctx.moveTo(outerX + 24, separatorY)
  ctx.lineTo(outerX + ticketWidth - 24, separatorY)
  ctx.stroke()
  ctx.setLineDash([])

  // Content
  let y = outerY + headerHeight + 64
  wrappedLines.forEach((line) => {
    const isTitle = line.trim().toUpperCase() === "DESGLOSE"
    const isAmount = line.includes("MXN")
    const isLegend = line.trim().startsWith("*")

    if (isTitle) {
      ctx.font = "700 34px Arial"
      ctx.fillStyle = "#0f172a"
    } else if (isAmount) {
      ctx.font = "700 36px Arial"
      ctx.fillStyle = "#0b3b8f"
    } else if (isLegend) {
      ctx.font = "500 24px Arial"
      ctx.fillStyle = "#475569"
    } else {
      ctx.font = "500 30px Arial"
      ctx.fillStyle = "#1e293b"
    }

    if (!line.trim()) {
      y += 18
      return
    }

    ctx.fillText(line, outerX + contentPadding, y)
    y += lineHeight
  })

  // Footer bar
  const footerY = outerY + ticketHeight - footerHeight
  ctx.fillStyle = "#f8fafc"
  ctx.fillRect(outerX + 1, footerY, ticketWidth - 2, footerHeight - 1)

  ctx.beginPath()
  ctx.moveTo(outerX + 28, footerY)
  ctx.lineTo(outerX + ticketWidth - 28, footerY)
  ctx.strokeStyle = "#e2e8f0"
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.font = "600 22px Arial"
  ctx.fillStyle = "#334155"
  ctx.fillText("Documento generado por Tabulador TAMIVAR", outerX + contentPadding, footerY + 38)
  ctx.font = "500 20px Arial"
  ctx.fillStyle = "#64748b"
  ctx.fillText("Uso interno para asesores inmobiliarios", outerX + contentPadding, footerY + 68)

  const url = canvas.toDataURL("image/png")
  const link = document.createElement("a")
  link.href = url
  link.download = "ticket-comision-tamivar.png"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
