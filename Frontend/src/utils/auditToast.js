import toast from "react-hot-toast";

/**
 * Muestra un toast de "auditoría en proceso" y, después de delayMs,
 * hace 1 solo GET para leer el status y mostrar el resultado.
 *
 * fetchAuditStatus debe ser una función que reciba (simulationId)
 * y regrese un objeto: { audit_status }
 */
export function auditToast(simulationId, amount, fetchAuditStatus, delayMs = 3000) {
  if (!simulationId) return;

  toast(`Iniciando auditoría de riesgo \n Monto: ${amount}`, {icon: 'ℹ️'});

  setTimeout(async () => {
    try {
      const audit = await fetchAuditStatus(simulationId);

      if (audit?.audit_status === "SUCCESS") {
        toast.success(`Auditoría aprobada.\n Monto: ${amount}`);
      } else if (audit?.audit_status === "FAILED") {
        toast.error(`Auditoría fallida.\n Monto: ${amount}`);
      } else {
        toast("Auditoría sigue en proceso…");
      }
    } catch (err) {
      toast.error(err?.message || "No se pudo consultar la auditoría.");
    }
  }, delayMs);
}