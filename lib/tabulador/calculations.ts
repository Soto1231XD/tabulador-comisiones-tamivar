import { LEYENDA_IMPUESTOS } from "./constants"
import { formatMXN } from "./format"
import type {
  CasoPrincipal,
  FueConBrokerExterno,
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

type TicketInput = BaseMontos & {
  casoPrincipal: CasoPrincipal | null
  fueConBrokerExterno: FueConBrokerExterno | null
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

export function getCasoPrincipal(
  exclusiva: OpcionSiNo | null,
  enlistaste: OpcionSiNo | null,
  vendiste: OpcionSiNo | null
): CasoPrincipal | null {
  if (exclusiva === "si" && enlistaste === "si" && vendiste === "si") return "caso-70"
  if (exclusiva === "no" && enlistaste === "no" && vendiste === "si") return "caso-equipo-tipo-asesor"
  if (exclusiva === "no" && enlistaste === "si" && vendiste === "si") return "caso-pregunta-broker-externo"
  if (exclusiva === "si" && enlistaste === "no" && vendiste === "si") return "caso-45"
  if (exclusiva === "si" && enlistaste === "si" && vendiste === "no") return "caso-pregunta-vendio"
  return null
}

export function getPorcentajeFinal(params: {
  casoPrincipal: CasoPrincipal | null
  fueConBrokerExterno: FueConBrokerExterno | null
  fueEnEquipoConOtroAsesor: OpcionSiNo | null
  quienVendio: QuienVendio | null
  tipoAsesorEquipo: TipoAsesorEquipo
}) {
  const { casoPrincipal, fueConBrokerExterno, fueEnEquipoConOtroAsesor, quienVendio, tipoAsesorEquipo } = params

  if (casoPrincipal === "caso-70") return 70
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
  if (casoPrincipal === "caso-pregunta-broker-externo" && fueConBrokerExterno === "si") return 10
  if (casoPrincipal === "caso-pregunta-broker-externo" && fueConBrokerExterno === "no") return 65
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
  fueConBrokerExterno: FueConBrokerExterno | null
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
    fueConBrokerExterno,
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
  if (casoPrincipal === "caso-pregunta-broker-externo" && !fueConBrokerExterno) return false
  if (casoPrincipal === "caso-equipo-tipo-asesor" && !fueEnEquipoConOtroAsesor) return false
  if (casoPrincipal === "caso-equipo-tipo-asesor" && fueEnEquipoConOtroAsesor === "si" && tipoAsesorEquipo === "na")
    return false
  if (!porcentajeFinal) return false
  return true
}

export function buildTicketText(params: TicketInput) {
  const {
    casoPrincipal,
    comisionNeta,
    comisionNetaRenta,
    comisionNum,
    comisionPrincipal,
    comisionPrincipalRenta,
    costoNum,
    fueConBrokerExterno,
    fueEnEquipoConOtroAsesor,
    montoRenta,
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
    return [
      "DESGLOSE",
      "",
      "Operacion: RENTA",
      `Costo: ${formatMXN(costoNum)}`,
      `Comision principal: ${formatMXN(comisionPrincipalRenta)}`,
      `Comision neta (7% ya descontado): ${formatMXN(comisionNetaRenta)}`,
      "",
      "Te corresponde el 45% de la comision principal, equivalente a:",
      `${formatMXN(montoRenta)} MXN`,
      "",
      LEYENDA_IMPUESTOS,
    ].join("\n")
  }

  if (!puedeVerResultado || !porcentajeFinal) return ""

  const montoFinal = comisionNeta * (porcentajeFinal / 100)
  const lineas = [
    "DESGLOSE",
    "",
    `Operacion: ${tipoOperacion?.toUpperCase()}`,
    `Costo de propiedad: ${formatMXN(costoNum)}`,
    `Comision principal (${comisionNum}%): ${formatMXN(comisionPrincipal)}`,
    `Comision neta (7% ya descontado): ${formatMXN(comisionNeta)}`,
    "",
  ]

  if (
    casoPrincipal === "caso-equipo-tipo-asesor" &&
    fueEnEquipoConOtroAsesor === "si" &&
    tipoAsesorEquipo === "interno"
  ) {
    lineas.push(
      "A los dos asesores les corresponde el 30% de la comision principal, equivalente a:",
      `${formatMXN(montoFinal)} MXN`,
      ""
    )
  } else if (
    casoPrincipal === "caso-equipo-tipo-asesor" &&
    fueEnEquipoConOtroAsesor === "si" &&
    tipoAsesorEquipo === "externo"
  ) {
    lineas.push(
      "Broker externo tiene el cliente.",
      "Tamivar tiene la propiedad.",
      "A ti te corresponde el 7.5%.",
      `${formatMXN(montoFinal)} MXN`,
      ""
    )
  } else {
    lineas.push(`Te corresponde el ${porcentajeFinal}% de la comision principal, equivalente a:`, `${formatMXN(montoFinal)} MXN`, "")
  }

  if (casoPrincipal === "caso-pregunta-vendio" && quienVendio === "broker-externo") {
    lineas.push(`*Puede subir a 25% segun tu seguimiento en el proceso, que equivaldria a ${formatMXN(montoPotencial25)}.`, "")
  }

  if (casoPrincipal === "caso-pregunta-broker-externo" && fueConBrokerExterno === "si") {
    lineas.push(`*Puede subir a 20% segun tu seguimiento en el proceso, que equivaldria a ${formatMXN(montoPotencial20)}.`, "")
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
