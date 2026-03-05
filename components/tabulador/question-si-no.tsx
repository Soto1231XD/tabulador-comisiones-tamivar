import type { OpcionSiNo } from "@/lib/tabulador/types"

type QuestionSiNoProps = {
  titulo: string
  value: OpcionSiNo | null
  onChange: (value: OpcionSiNo) => void
}

export function QuestionSiNo({ titulo, value, onChange }: QuestionSiNoProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-slate-700">{titulo}</p>
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
        <button
          onClick={() => onChange("si")}
          className={`min-h-11 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            value === "si"
              ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-200"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Si
        </button>
        <button
          onClick={() => onChange("no")}
          className={`min-h-11 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            value === "no"
              ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-200"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          No
        </button>
      </div>
    </div>
  )
}
