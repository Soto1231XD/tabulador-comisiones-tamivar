import type { OpcionSiNo } from "@/lib/tabulador/types"

type QuestionSiNoProps = {
  titulo: string
  value: OpcionSiNo | null
  onChange: (value: OpcionSiNo) => void
}

export function QuestionSiNo({ titulo, value, onChange }: QuestionSiNoProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-700">{titulo}</p>
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
        <button
          onClick={() => onChange("si")}
          className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            value === "si" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Si
        </button>
        <button
          onClick={() => onChange("no")}
          className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            value === "no" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          No
        </button>
      </div>
    </div>
  )
}
