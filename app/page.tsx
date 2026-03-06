"use client"

import { useMemo, useState } from "react"
import { QuestionSiNo } from "@/components/tabulador/question-si-no"
import {
  buildTicketText,
  getBaseMontos,
  getCasoPrincipal,
  getPorcentajeFinal,
  puedeVerResultadoVenta,
} from "@/lib/tabulador/calculations"
import { LEYENDA_IMPUESTOS } from "@/lib/tabulador/constants"
import { formatMXN, formatThousands, sanitizeNumericInput } from "@/lib/tabulador/format"
import { downloadTicketAsImage } from "@/lib/tabulador/ticket-image"
import type {
  OpcionSiNo,
  QuienVendio,
  TipoAsesorEquipo,
  TipoOperacion,
} from "@/lib/tabulador/types"

export default function Home() {
  const [mostrarBienvenida, setMostrarBienvenida] = useState(true)
  const [tipoOperacion, setTipoOperacion] = useState<TipoOperacion | null>(null)
  const [costo, setCosto] = useState("")
  const [comision, setComision] = useState("5")

  const [exclusiva, setExclusiva] = useState<OpcionSiNo | null>(null)
  const [enlistaste, setEnlistaste] = useState<OpcionSiNo | null>(null)
  const [vendiste, setVendiste] = useState<OpcionSiNo | null>(null)
  const [quienVendio, setQuienVendio] = useState<QuienVendio | null>(null)
  const [fueEnEquipoConOtroAsesor, setFueEnEquipoConOtroAsesor] = useState<OpcionSiNo | null>(null)
  const [tipoAsesorEquipo, setTipoAsesorEquipo] = useState<TipoAsesorEquipo>("na")
  const costoFormateado = formatThousands(costo)

  const baseMontos = useMemo(() => getBaseMontos(costo, comision), [comision, costo])

  const casoPrincipal = useMemo(() => getCasoPrincipal(exclusiva, enlistaste, vendiste), [enlistaste, exclusiva, vendiste])

  const porcentajeFinal = useMemo(
    () =>
      getPorcentajeFinal({
        casoPrincipal,
        fueEnEquipoConOtroAsesor,
        quienVendio,
        tipoAsesorEquipo,
      }),
    [casoPrincipal, fueEnEquipoConOtroAsesor, quienVendio, tipoAsesorEquipo]
  )

  const montoFinal = useMemo(() => {
    if (!porcentajeFinal) return 0
    return baseMontos.comisionNeta * (porcentajeFinal / 100)
  }, [baseMontos.comisionNeta, porcentajeFinal])

  const puedeVerResultado = useMemo(
    () =>
      puedeVerResultadoVenta({
        casoPrincipal,
        comisionNum: baseMontos.comisionNum,
        costoNum: baseMontos.costoNum,
        enlistaste,
        exclusiva,
        fueEnEquipoConOtroAsesor,
        porcentajeFinal,
        tipoAsesorEquipo,
        quienVendio,
        tipoOperacion,
        vendiste,
      }),
    [
      baseMontos.comisionNum,
      baseMontos.costoNum,
      casoPrincipal,
      enlistaste,
      exclusiva,
      fueEnEquipoConOtroAsesor,
      porcentajeFinal,
      tipoAsesorEquipo,
      quienVendio,
      tipoOperacion,
      vendiste,
    ]
  )

  const todasNoEnEscenarioVenta = useMemo(() => {
    if (tipoOperacion !== "venta") return false
    return exclusiva === "no" && enlistaste === "no" && vendiste === "no"
  }, [enlistaste, exclusiva, tipoOperacion, vendiste])

  const puedeVerResultadoRenta = useMemo(() => {
    if (tipoOperacion !== "renta") return false
    return baseMontos.costoNum > 0
  }, [baseMontos.costoNum, tipoOperacion])

  const ticketTexto = useMemo(
    () =>
      buildTicketText({
        ...baseMontos,
        casoPrincipal,
        fueEnEquipoConOtroAsesor,
        porcentajeFinal,
        puedeVerResultado,
        puedeVerResultadoRenta,
        quienVendio,
        tipoAsesorEquipo,
        tipoOperacion,
      }),
    [
      baseMontos,
      casoPrincipal,
      fueEnEquipoConOtroAsesor,
      porcentajeFinal,
      puedeVerResultado,
      puedeVerResultadoRenta,
      quienVendio,
      tipoAsesorEquipo,
      tipoOperacion,
    ]
  )

  const descargarTicket = () => {
    downloadTicketAsImage(ticketTexto)
  }

  const handleCostoChange = (value: string) => {
    setCosto(sanitizeNumericInput(value))
  }

  const reiniciar = () => {
    setTipoOperacion(null)
    setMostrarBienvenida(false)
    setCosto("")
    setComision("5")
    setExclusiva(null)
    setEnlistaste(null)
    setVendiste(null)
    setQuienVendio(null)
    setFueEnEquipoConOtroAsesor(null)
    setTipoAsesorEquipo("na")
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#bfdbfe_0%,_#eff6ff_45%,_#f8fafc_100%)] px-3 py-4 md:px-6 md:py-10">
      <div className="pointer-events-none absolute -left-16 top-28 h-48 w-48 rounded-full bg-cyan-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-10 h-48 w-48 rounded-full bg-blue-300/40 blur-3xl" />

      <div className="relative mx-auto w-full max-w-2xl">
        <div className="mb-3 rounded-3xl border border-blue-100 bg-white/90 p-4 shadow-sm backdrop-blur md:mb-6 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700">Tamivar</p>
              <h1 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 md:text-3xl">Tabulador de comisiones</h1>
            </div>
            {!mostrarBienvenida && (
              <button
                onClick={() => setMostrarBienvenida(true)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
              >
                Bienvenida
              </button>
            )}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 md:text-sm">{LEYENDA_IMPUESTOS}</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/95 p-4 shadow-xl shadow-blue-100/60 md:p-8">
          {mostrarBienvenida ? (
            <section className="space-y-5">
              <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-5 text-white">
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">Bienvenido</p>
                <h2 className="mt-2 text-2xl font-semibold leading-tight">Simula tu comision en menos de 5 minuto</h2>
                <p className="mt-3 text-sm text-blue-50">
                  Este tabulador te ayuda a calcular tu porcentaje segun el escenario de cierre. El resultado ya contempla descuentos aplicados.
                </p>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">1. Elige tipo de operacion</p>
                  <p className="mt-1 text-sm text-slate-600">Selecciona venta o renta para iniciar el flujo correcto.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">2. Completa los datos</p>
                  <p className="mt-1 text-sm text-slate-600">Responde preguntas y el sistema calcula tu porcentaje automaticamente.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">3. Descarga tu ticket</p>
                  <p className="mt-1 text-sm text-slate-600">Genera evidencia del desglose en formato imagen para compartir.</p>
                </div>
              </div>

              <button
                onClick={() => setMostrarBienvenida(false)}
                className="min-h-12 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:brightness-105"
              >
                Comenzar simulacion
              </button>
            </section>
          ) : (
            <>
          {!tipoOperacion && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900">1) Selecciona el tipo de operacion</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <button
                  onClick={() => setTipoOperacion("venta")}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-left transition hover:border-blue-400 hover:shadow-sm"
                >
                  <p className="text-base font-semibold text-slate-900">Venta</p>
                  <p className="mt-1 text-sm text-slate-500">Calcular reparto por porcentaje de comision.</p>
                </button>

                <button
                  onClick={() => setTipoOperacion("renta")}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-4 text-left transition hover:border-blue-400 hover:shadow-sm"
                >
                  <p className="text-base font-semibold text-slate-900">Renta</p>
                  <p className="mt-1 text-sm text-slate-500">Calcular ticket directo por costo.</p>
                </button>
              </div>
            </section>
          )}

          {tipoOperacion === "renta" && (
            <section className="space-y-7">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">2) Datos de la renta</h2>
                <div className="mt-4 max-w-sm">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Costo (MXN)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Ej. 18000"
                      value={costoFormateado}
                      onChange={(e) => handleCostoChange(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>
                </div>
              </div>

              {puedeVerResultadoRenta && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">Desglose</h3>
                  <p className="mt-3 text-slate-700">
                    Te corresponde el <span className="font-semibold">45%</span> de la comision principal que equivale a:
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{formatMXN(baseMontos.montoRenta)} MXN</p>

                  <button
                    onClick={descargarTicket}
                    className="mt-5 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:brightness-105"
                  >
                    Descargar ticket
                  </button>

                  <p className="mt-4 text-xs text-slate-500">{LEYENDA_IMPUESTOS}</p>
                </div>
              )}

              <button
                onClick={reiniciar}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Nueva simulacion
              </button>
            </section>
          )}

          {tipoOperacion === "venta" && (
            <section className="space-y-7">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">2) Datos de la venta</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Costo (MXN)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Ej. 2800000"
                      value={costoFormateado}
                      onChange={(e) => handleCostoChange(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-700">Comision</span>
                    <select
                      value={comision}
                      onChange={(e) => setComision(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((option) => (
                        <option key={option} value={option}>
                          {option}%
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">3) Responde el escenario</h2>
                <div className="mt-4 space-y-4">
                  <QuestionSiNo titulo="Es una propiedad exclusiva?" value={exclusiva} onChange={setExclusiva} />
                  <QuestionSiNo titulo="Tu la enlistaste?" value={enlistaste} onChange={setEnlistaste} />
                  <QuestionSiNo titulo="Tu la vendiste?" value={vendiste} onChange={setVendiste} />
                </div>
              </div>

              {casoPrincipal === "caso-pregunta-vendio" && (
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">4) Quien vendio la casa?</h2>
                  <div className="mt-3 grid gap-2 rounded-2xl bg-slate-100 p-1 md:grid-cols-2">
                    <button
                      onClick={() => setQuienVendio("broker-externo")}
                      className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        quienVendio === "broker-externo" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Broker-Externo
                    </button>
                    <button
                      onClick={() => setQuienVendio("tamivar")}
                      className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                        quienVendio === "tamivar" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      Tamivar
                    </button>
                  </div>
                </div>
              )}

              {casoPrincipal === "caso-equipo-tipo-asesor" && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">4) Fue en equipo con otro asesor?</h2>
                    <div className="mt-3 grid gap-2 rounded-2xl bg-slate-100 p-1 md:grid-cols-2">
                      <button
                        onClick={() => setFueEnEquipoConOtroAsesor("si")}
                        className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                          fueEnEquipoConOtroAsesor === "si" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        Si
                      </button>
                      <button
                        onClick={() => {
                          setFueEnEquipoConOtroAsesor("no")
                          setTipoAsesorEquipo("na")
                        }}
                        className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                          fueEnEquipoConOtroAsesor === "no" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">5) Que tipo de asesor fue</h2>
                    <div className="mt-3 grid gap-2 rounded-2xl bg-slate-100 p-1 md:grid-cols-3">
                      <button
                        onClick={() => setTipoAsesorEquipo("interno")}
                        disabled={fueEnEquipoConOtroAsesor === "no"}
                        className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                          tipoAsesorEquipo === "interno" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        Interno
                      </button>
                      <button
                        onClick={() => setTipoAsesorEquipo("externo")}
                        disabled={fueEnEquipoConOtroAsesor === "no"}
                        className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                          tipoAsesorEquipo === "externo" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        Externo
                      </button>
                      <button
                        onClick={() => setTipoAsesorEquipo("na")}
                        className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                          tipoAsesorEquipo === "na" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        NA
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {todasNoEnEscenarioVenta && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                  <h3 className="text-lg font-semibold text-rose-900">Alerta</h3>
                  <p className="mt-3 whitespace-pre-line text-rose-800">
                    Para que este sistema te
                    pueda arrojar un dato
                    concreto, debes colocar por
                    lo menos un &quot;SI&quot; en alguna
                    de las opciones
                  </p>
                  <button
                    onClick={reiniciar}
                    className="mt-4 rounded-2xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    Regresar
                  </button>
                </div>
              )}

              {exclusiva && enlistaste && vendiste && !casoPrincipal && !todasNoEnEscenarioVenta && (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Este caso aun no esta configurado en el tabulador actual.
                </p>
              )}

              {puedeVerResultado && porcentajeFinal && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">Desglose</h3>
                  {casoPrincipal === "caso-equipo-tipo-asesor" &&
                  fueEnEquipoConOtroAsesor === "si" &&
                  tipoAsesorEquipo === "interno" ? (
                    <p className="mt-3 text-slate-700">
                      A los dos asesores les corresponde el <span className="font-semibold">30%</span> de la comision principal que
                      equivale a:
                    </p>
                  ) : casoPrincipal === "caso-equipo-tipo-asesor" &&
                    fueEnEquipoConOtroAsesor === "si" &&
                    tipoAsesorEquipo === "externo" ? (
                    <div className="mt-3 space-y-1 text-slate-700">
                      <p>Broker externo tiene el cliente (Asesor interno hizo la referencia).</p>
                      <p>Tamivar tiene la propiedad.</p>
                      <p>
                        A ti te corresponde el <span className="font-semibold">7.5%</span>.
                      </p>
                    </div>
                  ) : (
                    <p className="mt-3 text-slate-700">
                      Te corresponde el <span className="font-semibold">{porcentajeFinal}%</span> de la comision principal que equivale a:
                    </p>
                  )}
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{formatMXN(montoFinal)} MXN</p>

                  {casoPrincipal === "caso-pregunta-vendio" && quienVendio === "broker-externo" && (
                    <p className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                      *Puede subir a 25% segun tu seguimiento en el proceso, que equivaldria a{" "}
                      <span className="font-semibold">{formatMXN(baseMontos.montoPotencial25)}</span>.
                    </p>
                  )}

                  {casoPrincipal === "caso-10-directo" && (
                    <p className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                      *Puede subir a 20% segun tu seguimiento en el proceso, que equivaldria a{" "}
                      <span className="font-semibold">{formatMXN(baseMontos.montoPotencial20)}</span>.
                    </p>
                  )}

                  {casoPrincipal === "caso-10-directo" && (
                    <p className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                      Este porcentaje es lo mismo si lo vende un broker externo o interno.
                    </p>
                  )}

                  {casoPrincipal === "caso-equipo-tipo-asesor" &&
                    fueEnEquipoConOtroAsesor === "si" &&
                    tipoAsesorEquipo === "externo" && (
                      <p className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                        *Puede subir un 5% mas segun tu seguimiento en el proceso, que equivaldria a{" "}
                        <span className="font-semibold">{formatMXN(baseMontos.montoPotencial5)}</span>.
                      </p>
                    )}

                  <button
                    onClick={descargarTicket}
                    className="mt-5 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:brightness-105"
                  >
                    Descargar ticket
                  </button>

                  <p className="mt-4 text-xs text-slate-500">{LEYENDA_IMPUESTOS}</p>
                </div>
              )}

              <button
                onClick={reiniciar}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Nueva simulacion
              </button>
            </section>
          )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}
