export async function simulateLoan({ amount, rate, months }) {
  const cleanAmount = String(amount).replace(/,/g, "");
  const res = await fetch("/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: Number(cleanAmount),
      rate: Number(rate),
      months: Number(months),
    }),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      json?.detail ||
      json?.message ||
      "Request failed. Please check your inputs and try again.";
    throw new Error(message);
  }

  // Expect: { ok: true, data: ... }
  return json?.data ?? json;
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
