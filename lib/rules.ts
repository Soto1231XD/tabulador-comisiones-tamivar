export type Reparto = {
  asesor: number
  tamivar: number
  broker?: number
}

type EscenarioInput = {
    exclusiva: boolean
    origenCliente: "asesor" | "tamivar" | "broker"
    origenPropiedad: "asesor" | "tamivar" | "externa"
    cierreEquipo: boolean
}

export function obtenerReparto(data: EscenarioInput): Reparto {

  // Exclusiva + asesor vende su propiedad
  if (data.exclusiva && data.origenCliente === "asesor" && data.origenPropiedad === "asesor") {
    return { asesor: 70, tamivar: 30 }
  }

  // Exclusiva + lead TAMIVAR
  if (data.exclusiva && data.origenCliente === "tamivar") {
    return { asesor: 40, tamivar: 60 }
  }

  // Sin exclusiva + asesor vende
  if (!data.exclusiva && data.origenCliente === "asesor") {
    return { asesor: 65, tamivar: 35 }
  }

  // Cierre en equipo
  if (data.cierreEquipo) {
    return { asesor: 30, tamivar: 20 }
  }

  // Caso base
    return { asesor: 50, tamivar: 50 }
}