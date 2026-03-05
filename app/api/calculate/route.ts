import { NextResponse } from "next/server"
import { z } from "zod"
import { obtenerReparto } from "@/lib/rules"
import { calcularMontos } from "@/lib/calculator"

const schema = z.object({
  precioVenta: z.number(),
  porcentajeComision: z.number(),
  exclusiva: z.boolean(),
  origenCliente: z.enum(["asesor", "tamivar", "broker"]),
  origenPropiedad: z.enum(["asesor", "tamivar", "externa"]),
  cierreEquipo: z.boolean()
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = schema.parse(body)

    const reparto = obtenerReparto(data)

    const resultado = calcularMontos(
      data.precioVenta,
      data.porcentajeComision,
      reparto
    )

    return NextResponse.json({
      comisionTotal: resultado.comisionTotal,
      reparto: {
        asesor: {
          porcentaje: reparto.asesor,
          monto: resultado.asesor
        },
        tamivar: {
          porcentaje: reparto.tamivar,
          monto: resultado.tamivar
        },
        broker: reparto.broker
          ? {
              porcentaje: reparto.broker,
              monto: resultado.broker
            }
          : null
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Datos inválidos" },
      { status: 400 }
    )
  }
}