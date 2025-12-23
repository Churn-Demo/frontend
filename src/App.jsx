import { useMemo, useState } from "react";
import logo from "../public/custech.png";

export default function App() {
  const [customerId, setCustomerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const prob = result?.churn_probability;
  const probPct = useMemo(() => {
    if (typeof prob !== "number") return null;
    return Math.round(prob * 100);
  }, [prob]);

  async function predict() {
    setError("");
    setResult(null);

    const id = customerId.trim();
    if (!id) {
      setError("Ingresa un customer_id (ej: N001)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/predict/by-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer_id: id }),
      });

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(text);
      }

      if (!res.ok) {
        throw new Error(json?.detail || json?.error || "Error al predecir");
      }

      setResult(json);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  const riskLabel = result?.risk_level ?? null;

  return (
    <div className="min-h-screen bg-custech-ink text-slate-100">
      {/* top bar */}
      <div className="border-b border-white/10 bg-custech-navy/40 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
          <img src={logo} alt="CusTech" className="h-10 w-auto" />
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight">
              CusTech • Churn Demo
            </h1>
            <p className="text-sm text-slate-300">
              Front (React) → Gateway (Java) → Data/ML (Python)
            </p>
          </div>

          <span className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 md:inline">
            model: <span className="font-mono">dataset-demo-v1</span>
          </span>
        </div>
      </div>

      {/* body */}
      <div className="mx-auto grid max-w-5xl gap-6 px-6 py-8 md:grid-cols-[1.2fr_0.8fr]">
        {/* left: input */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <h2 className="text-lg font-semibold">Consulta por customer_id</h2>
          <p className="mt-1 text-sm text-slate-300">
            Prueba con: <span className="font-mono">N001</span>,{" "}
            <span className="font-mono">N002</span>,{" "}
            <span className="font-mono">N003</span>
          </p>

          <div className="mt-5 flex gap-3">
            <input
              className="w-full rounded-xl bg-slate-950/60 px-4 py-3 text-lg outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-custech-blue"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              //placeholder="N001"
              onKeyDown={(e) => e.key === "Enter" && predict()}
            />
            <button
              className="rounded-xl bg-custech-orange px-5 py-3 text-lg font-semibold text-slate-950 shadow hover:brightness-110 active:brightness-95 disabled:opacity-60"
              onClick={predict}
              disabled={loading}
              title="Llama al Gateway Java (/api/predict/by-id)"
            >
              {loading ? "Prediciendo…" : "Predecir"}
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
              {error}
            </div>
          )}

          <div className="mt-6 rounded-2xl bg-slate-950/50 p-5 ring-1 ring-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Respuesta (JSON)</h3>
              <span className="text-xs text-slate-400">/api/predict/by-id</span>
            </div>

            <pre className="mt-3 max-h-[320px] overflow-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-200 ring-1 ring-white/10">
              {result ? JSON.stringify(result, null, 2) : "{}"}
            </pre>
          </div>
        </div>

        {/* right: summary */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <h2 className="text-lg font-semibold">Resumen</h2>

          <div className="mt-4 rounded-2xl bg-slate-950/50 p-5 ring-1 ring-white/10">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-300">Riesgo de churn</div>
              {riskLabel && (
                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    riskLabel === "ALTO"
                      ? "bg-red-500/15 text-red-200 ring-1 ring-red-500/30"
                      : riskLabel === "MEDIO"
                      ? "bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/30"
                      : "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/30",
                  ].join(" ")}
                >
                  {riskLabel}
                </span>
              )}
            </div>

            <div className="mt-3 text-4xl font-bold">
              {probPct !== null ? (
                <span>
                  {probPct}
                  <span className="text-xl text-slate-300">%</span>
                </span>
              ) : (
                <span className="text-slate-500">—</span>
              )}
            </div>

            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-custech-blue"
                style={{ width: probPct !== null ? `${probPct}%` : "0%" }}
              />
            </div>

            <div className="mt-3 text-sm text-slate-300">
              Predicción:{" "}
              <span className="font-mono">
                {result ? result.prediction : "—"}
              </span>{" "}
              • Fuente:{" "}
              <span className="font-mono">{result ? result.source : "—"}</span>
            </div>
          </div>

          <div className="mt-6 text-sm text-slate-300">
            <div className="font-semibold text-slate-200">
              ¿Qué hace “by-id”?
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                El front envía solo el{" "}
                <span className="font-mono">customer_id</span> al Gateway
                (Java).
              </li>
              <li>
                Java llama a Data (Python) para resolver features desde{" "}
                <span className="font-mono">new_customers</span>.
              </li>
              <li>
                Python infiere usando el modelo entrenado con{" "}
                <span className="font-mono">churn_demo.csv</span>.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 pb-10 text-xs text-slate-500">
        CusTech • Customer insights & Retention
      </div>
    </div>
  );
}
