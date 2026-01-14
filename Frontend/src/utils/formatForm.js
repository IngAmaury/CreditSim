export function onlyDigitsAndDot(s) {
  return s.replace(/[^\d.]/g, "");
}

export function onlyDigits(s) {
  return s.replace(/[^\d]/g, "");
}

export function formatThousandsMX(s) {
  // s: string numeric WITHOUT commas
  if (!s) return "";
  const [intPart, decPart] = s.split(".");
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}

export function clampNumberString(s, min, max) {
  if (s === "" || s === ".") return s;
  const n = Number(s);
  if (Number.isNaN(n)) return "";
  return String(Math.min(max, Math.max(min, n)));
}
