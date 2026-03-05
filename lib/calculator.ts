import Decimal from "decimal.js"
import { Reparto } from "./rules"

export function calcularMontos(
  precioVenta: number,
  porcentajeComision: number,
  reparto: Reparto
) {
  const precio = new Decimal(precioVenta)
  const comisionTotal = precio.mul(porcentajeComision).div(100)

  return {
    comisionTotal: comisionTotal.toFixed(2),
    asesor: comisionTotal.mul(reparto.asesor).div(100).toFixed(2),
    tamivar: comisionTotal.mul(reparto.tamivar).div(100).toFixed(2),
    broker: reparto.broker
      ? comisionTotal.mul(reparto.broker).div(100).toFixed(2)
      : "0.00"
  }
}