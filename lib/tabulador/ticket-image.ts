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

export function downloadTicketAsImage(ticketTexto: string) {
  if (!ticketTexto) return

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  const width = 1200
  const paddingX = 64
  const paddingY = 72
  const lineHeight = 42
  const maxTextWidth = width - paddingX * 2

  ctx.font = "500 32px Arial"
  const rawLines = ticketTexto.split("\n")
  const wrappedLines: string[] = []
  rawLines.forEach((line) => {
    wrapLine(ctx, line, maxTextWidth).forEach((wrapped) => wrappedLines.push(wrapped))
  })

  const height = Math.max(720, paddingY * 2 + wrappedLines.length * lineHeight)
  canvas.width = width
  canvas.height = height

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = "#e2e8f0"
  ctx.fillRect(24, 24, width - 48, height - 48)

  ctx.fillStyle = "#ffffff"
  ctx.fillRect(32, 32, width - 64, height - 64)

  let y = paddingY
  wrappedLines.forEach((line, index) => {
    const isTitle = index === 0 && line.trim().toUpperCase() === "DESGLOSE"
    if (isTitle) {
      ctx.font = "700 44px Arial"
      ctx.fillStyle = "#0f172a"
    } else {
      ctx.font = "500 32px Arial"
      ctx.fillStyle = "#1e293b"
    }

    if (!line.trim()) {
      y += lineHeight
      return
    }

    ctx.fillText(line, paddingX, y)
    y += lineHeight
  })

  const url = canvas.toDataURL("image/png")
  const link = document.createElement("a")
  link.href = url
  link.download = "ticket-comision-tamivar.png"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
