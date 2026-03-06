import { LEYENDA_IMPUESTOS } from "./constants"
import { formatMXN } from "./format"
import type {
  CasoPrincipal,
  OpcionSiNo,
  QuienVendio,
  TipoAsesorEquipo,
  TipoOperacion,
} from "./types"

type BaseMontos = {
  costoNum: number
  comisionNum: number
  comisionPrincipal: number
  comisionNeta: number
  comisionPrincipalRenta: number
  comisionNetaRenta: number
  montoRenta: number
  montoPotencial25: number
  montoPotencial20: number
  montoPotencial5: number
}

type DesgloseAsesor = {
  comisionBrutaAsesor: number
  impuestosAsesor: number
  comisionNetaAsesor: number
}

type TicketInput = BaseMontos & {
  casoPrincipal: CasoPrincipal | null
  fueEnEquipoConOtroAsesor: OpcionSiNo | null
  porcentajeFinal: number | null
  puedeVerResultado: boolean
  puedeVerResultadoRenta: boolean
  quienVendio: QuienVendio | null
  tipoAsesorEquipo: TipoAsesorEquipo
  tipoOperacion: TipoOperacion | null
}

export function getBaseMontos(costo: string, comision: string): BaseMontos {
  const costoNum = Number(costo || 0)
  const comisionNum = Number(comision || 0)
  const comisionPrincipal = (costoNum * comisionNum) / 100
  const comisionNeta = comisionPrincipal * 0.93
  const comisionPrincipalRenta = costoNum
  const comisionNetaRenta = comisionPrincipalRenta * 0.93
  const montoRenta = comisionNetaRenta * 0.45

  return {
    costoNum,
    comisionNum,
    comisionPrincipal,
    comisionNeta,
    comisionPrincipalRenta,
    comisionNetaRenta,
    montoRenta,
    montoPotencial25: comisionNeta * 0.25,
    montoPotencial20: comisionNeta * 0.2,
    montoPotencial5: comisionNeta * 0.05,
  }
}

export function getDesgloseAsesor(params: {
  comisionPrincipal: number
  comisionPrincipalRenta: number
  porcentajeFinal: number | null
  tipoOperacion: TipoOperacion | null
}) : DesgloseAsesor {
  const { comisionPrincipal, comisionPrincipalRenta, porcentajeFinal, tipoOperacion } = params

  const comisionBrutaAsesor =
    tipoOperacion === "renta"
      ? comisionPrincipalRenta * 0.45
      : comisionPrincipal * ((porcentajeFinal ?? 0) / 100)

  const impuestosAsesor = comisionBrutaAsesor * 0.07
  const comisionNetaAsesor = comisionBrutaAsesor - impuestosAsesor

  return {
    comisionBrutaAsesor,
    impuestosAsesor,
    comisionNetaAsesor,
  }
}

export function getCasoPrincipal(
  exclusiva: OpcionSiNo | null,
  enlistaste: OpcionSiNo | null,
  vendiste: OpcionSiNo | null
): CasoPrincipal | null {
  if (exclusiva === "si" && enlistaste === "si" && vendiste === "si") return "caso-70"
  if (exclusiva === "no" && enlistaste === "no" && vendiste === "si") return "caso-equipo-tipo-asesor"
  if (exclusiva === "no" && enlistaste === "si" && vendiste === "si") return "caso-65-directo"
  if (exclusiva === "no" && enlistaste === "si" && vendiste === "no") return "caso-10-directo"
  if (exclusiva === "si" && enlistaste === "no" && vendiste === "si") return "caso-45"
  if (exclusiva === "si" && enlistaste === "si" && vendiste === "no") return "caso-pregunta-vendio"
  return null
}

export function getPorcentajeFinal(params: {
  casoPrincipal: CasoPrincipal | null
  fueEnEquipoConOtroAsesor: OpcionSiNo | null
  quienVendio: QuienVendio | null
  tipoAsesorEquipo: TipoAsesorEquipo
}) {
  const { casoPrincipal, fueEnEquipoConOtroAsesor, quienVendio, tipoAsesorEquipo } = params

  if (casoPrincipal === "caso-70") return 70
  if (casoPrincipal === "caso-65-directo") return 65
  if (casoPrincipal === "caso-10-directo") return 10
  if (casoPrincipal === "caso-equipo-tipo-asesor" && fueEnEquipoConOtroAsesor === "no" && tipoAsesorEquipo === "na")
    return 25
  if (
    casoPrincipal === "caso-equipo-tipo-asesor" &&
    fueEnEquipoConOtroAsesor === "si" &&
    tipoAsesorEquipo === "interno"
  ) {
    return 30
  }
  if (
    casoPrincipal === "caso-equipo-tipo-asesor" &&
    fueEnEquipoConOtroAsesor === "si" &&
    tipoAsesorEquipo === "externo"
  ) {
    return 7.5
  }
  if (casoPrincipal === "caso-45") return 45
  if (casoPrincipal === "caso-pregunta-vendio" && quienVendio === "broker-externo") return 15
  if (casoPrincipal === "caso-pregunta-vendio" && quienVendio === "tamivar") return 40
  return null
}

export function puedeVerResultadoVenta(params: {
  casoPrincipal: CasoPrincipal | null
  comisionNum: number
  costoNum: number
  enlistaste: OpcionSiNo | null
  exclusiva: OpcionSiNo | null
  fueEnEquipoConOtroAsesor: OpcionSiNo | null
  porcentajeFinal: number | null
  tipoAsesorEquipo: TipoAsesorEquipo
  quienVendio: QuienVendio | null
  tipoOperacion: TipoOperacion | null
  vendiste: OpcionSiNo | null
}) {
  const {
    casoPrincipal,
    comisionNum,
    costoNum,
    enlistaste,
    exclusiva,
    fueEnEquipoConOtroAsesor,
    porcentajeFinal,
    tipoAsesorEquipo,
    quienVendio,
    tipoOperacion,
    vendiste,
  } = params

  if (tipoOperacion !== "venta") return false
  if (!costoNum || !comisionNum) return false
  if (!exclusiva || !enlistaste || !vendiste) return false
  if (casoPrincipal === "caso-pregunta-vendio" && !quienVendio) return false
  if (casoPrincipal === "caso-equipo-tipo-asesor" && !fueEnEquipoConOtroAsesor) return false
  if (casoPrincipal === "caso-equipo-tipo-asesor" && fueEnEquipoConOtroAsesor === "si" && tipoAsesorEquipo === "na")
    return false
  if (!porcentajeFinal) return false
  return true
}

export function buildTicketText(params: TicketInput) {
  const {
    casoPrincipal,
    comisionNum,
    comisionPrincipal,
    comisionPrincipalRenta,
    costoNum,
    fueEnEquipoConOtroAsesor,
    montoPotencial20,
    montoPotencial25,
    montoPotencial5,
    porcentajeFinal,
    puedeVerResultado,
    puedeVerResultadoRenta,
    quienVendio,
    tipoAsesorEquipo,
    tipoOperacion,
  } = params

  if (tipoOperacion === "renta" && puedeVerResultadoRenta) {
    const { comisionBrutaAsesor, impuestosAsesor, comisionNetaAsesor } = getDesgloseAsesor({
      comisionPrincipal,
      comisionPrincipalRenta,
      porcentajeFinal: 45,
      tipoOperacion,
    })

    return [
      "DESGLOSE",
      "",
      "Operación: RENTA",
      `Costo de la propiedad: ${formatMXN(costoNum)}`,
      `Comisión general: ${formatMXN(comisionPrincipalRenta)}`,
      `Comisión bruta a asesor: ${formatMXN(comisionBrutaAsesor)}`,
      `Impuestos (7%): ${formatMXN(impuestosAsesor)}`,
      "",
      "Te corresponde el 45% de la comisión principal menos impuestos, equivalente a:",
      `${formatMXN(comisionNetaAsesor)} MXN`,
      "",
      LEYENDA_IMPUESTOS,
    ].join("\n")
  }

  if (!puedeVerResultado || !porcentajeFinal) return ""

  const { comisionBrutaAsesor, impuestosAsesor, comisionNetaAsesor } = getDesgloseAsesor({
    comisionPrincipal,
    comisionPrincipalRenta,
    porcentajeFinal,
    tipoOperacion,
  })
  const lineas = [
    "DESGLOSE",
    "",
    `Operación: ${tipoOperacion?.toUpperCase()}`,
    `Costo de la propiedad: ${formatMXN(costoNum)}`,
    `Comisión general ${comisionNum}%: ${formatMXN(comisionPrincipal)}`,
    `Comisión bruta a asesor: ${formatMXN(comisionBrutaAsesor)}`,
    `Impuestos (7%): ${formatMXN(impuestosAsesor)}`,
    "",
  ]

  if (
    casoPrincipal === "caso-equipo-tipo-asesor" &&
    fueEnEquipoConOtroAsesor === "si" &&
    tipoAsesorEquipo === "interno"
  ) {
    lineas.push(
      "A los dos asesores les corresponde el 30% de la comisión principal menos impuestos, equivalente a:",
      `${formatMXN(comisionNetaAsesor)} MXN`,
      ""
    )
  } else if (
    casoPrincipal === "caso-equipo-tipo-asesor" &&
    fueEnEquipoConOtroAsesor === "si" &&
    tipoAsesorEquipo === "externo"
  ) {
    lineas.push(
      "Broker externo tiene el cliente (Asesor interno hizo la referencia).",
      "Tamivar tiene la propiedad.",
      "A ti te corresponde el 7.5%.",
      `${formatMXN(comisionNetaAsesor)} MXN`,
      ""
    )
  } else {
    lineas.push(
      `Te corresponde el ${porcentajeFinal}% de la comisión principal menos impuestos, equivalente a:`,
      `${formatMXN(comisionNetaAsesor)} MXN`,
      ""
    )
  }

  if (casoPrincipal === "caso-pregunta-vendio" && quienVendio === "broker-externo") {
    lineas.push(`*Puede subir a 25% segun tu seguimiento en el proceso, que equivaldria a ${formatMXN(montoPotencial25)}.`, "")
  }

  if (casoPrincipal === "caso-10-directo") {
    lineas.push(`*Puede subir a 20% segun tu seguimiento en el proceso, que equivaldria a ${formatMXN(montoPotencial20)}.`, "")
    lineas.push("Este porcentaje es lo mismo si lo vende un broker externo o interno.", "")
  }

  if (
    casoPrincipal === "caso-equipo-tipo-asesor" &&
    fueEnEquipoConOtroAsesor === "si" &&
    tipoAsesorEquipo === "externo"
  ) {
    lineas.push(`*Puede subir un 5% mas segun tu seguimiento en el proceso, que equivaldria a ${formatMXN(montoPotencial5)}.`, "")
  }

  lineas.push(LEYENDA_IMPUESTOS)
  return lineas.join("\n")
}
