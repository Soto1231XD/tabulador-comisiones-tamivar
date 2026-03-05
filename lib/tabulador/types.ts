export type TipoOperacion = "venta" | "renta"
export type OpcionSiNo = "si" | "no"
export type QuienVendio = "broker-externo" | "tamivar"
export type FueConBrokerExterno = "si" | "no"
export type TipoAsesorEquipo = "interno" | "externo" | "na"

export type CasoPrincipal =
  | "caso-70"
  | "caso-equipo-tipo-asesor"
  | "caso-pregunta-broker-externo"
  | "caso-45"
  | "caso-pregunta-vendio"
