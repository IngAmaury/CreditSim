function toDetailString(detail) {
  if (!detail) return "Error desconocido";

  if (typeof detail === "string") return detail;

  // FastAPI/Pydantic suele mandar: [{loc, msg, type}, ...]
  if (Array.isArray(detail)) {
    const first = detail[0];
    if (first?.msg) return first.msg;
    return JSON.stringify(detail);
  }

  if (typeof detail === "object") {
    return detail.message || JSON.stringify(detail);
  }

  return String(detail);
}

export async function simulateLoan({ amount, rate, months }) {
  const cleanAmount = String(amount).replace(/,/g, "");
  try {
    const res = await fetch("/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(String(amount).replace(/,/g, "")),
        rate: Number(rate),
        months: Number(months),
      }),
    });

    let json = null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      json = await res.json();
    }

    if (!res.ok) {
      const detail = toDetailString(json?.detail || json?.message);
      throw new Error(`Error ${res.status}: ${detail}`);
    }

    return json;
  } catch (err) {
    // Error de red (backend apagado, sin internet, CORS, etc.)
    // fetch en ese caso NO tiene status.
    const isNetworkError = err instanceof TypeError && !("status" in err);

    if (isNetworkError) {
      throw new Error(
        "No se pudo conectar con el servidor. Verifica que el backend esté encendido o tu conexión a internet."
      );
    }

    // Si ya venía con status, lo dejamos
    throw err;
  }
}

/**
 * Supports both:
 * 1) object: { monthly_payment, total_paid, total_interest, schedule }
 * 2) tuple/list: [monthly_payment, total_paid, total_interest, schedule]
 */
export function normalizeSimulationResponse(data) {
  if (Array.isArray(data) && data.length === 4) {
    const [monthly_payment, total_paid, total_interest, schedule] = data;
    return { monthly_payment, total_paid, total_interest, schedule };
  }

  // If backend returns already structured object
  return {
    monthly_payment: data?.monthly_payment,
    total_paid: data?.total_paid,
    total_interest: data?.total_interest,
    schedule: data?.schedule,
  };
}

//Aditional auditory notification

export async function getAuditStatus(simulationId) {
  const res = await fetch(`/api/simulations/${simulationId}`);
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const detail = json?.detail || "Error al consultar auditoría";
    throw new Error(`HTTP ${res.status}: ${detail}`);
  }
  return json; // { id, audit_status, audit_error }
}