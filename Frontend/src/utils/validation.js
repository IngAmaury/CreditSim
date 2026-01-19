function parseAmountToNumber(s) {
  // "50,000" -> 50000
  const clean = String(s ?? "").replace(/,/g, "");
  const n = Number(clean);
  return Number.isFinite(n) ? n : NaN;
}

function parseRateToNumber(s) {
  if (s == "") {
    return -1;
  }
  const n = Number(String(s ?? ""));
  return Number.isFinite(n) ? n : NaN;
}

function parseMonthsToInt(s) {
  // fuerza entero
  const clean = String(s ?? "").trim();
  if (!/^\d+$/.test(clean)) return NaN;
  const n = Number(clean);
  return Number.isFinite(n) ? n : NaN;
}

export function validateForm(form) {
  const amount = parseAmountToNumber(form.amount);
  const rate = parseRateToNumber(form.rate);
  const months = parseMonthsToInt(form.months);

  if (!Number.isFinite(amount) || amount <= 0) {
    return { ok: false, msg: "El monto del crédito debe ser un número mayor que 0." };
  }
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
    return { ok: false, msg: "La tasa anual debe estar entre 0 y 100." };
  }
  if (!Number.isFinite(months) || months < 1) {
    return { ok: false, msg: "El plazo debe ser un entero mayor o igual a 1." };
  }

  return { ok: true, values: { amount, rate, months } };
}
