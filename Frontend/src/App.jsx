import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  CssBaseline,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Divider,
} from "@mui/material";
import AmortizationTable from "./AmortizationTable.jsx";
import { simulateLoan, normalizeSimulationResponse } from "./api.js";
import { formatMoney } from "./AmortizationTable.jsx";
import { onlyDigits, formatThousandsMX, onlyDigitsAndDot, clampNumberString } from "./utils/formatForm.js";

const STORAGE_KEY = "creditsim.form.inputs";

function loadFormDefaults() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { amount: "50000", rate: "24", months: "12" };
    const parsed = JSON.parse(raw);

    return {
      amount: String(parsed.amount ?? "50000"),
      rate: String(parsed.rate ?? "24"),
      months: String(parsed.months ?? "12"),
    };
  } catch {
    return { amount: "50000", rate: "24", months: "12" };
  }
}

export default function App() {
  const [form, setForm] = React.useState(loadFormDefaults);
  const [result, setResult] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Persist form in localStorage
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  const handleAmountChange = (e) => {
    // Allow digits + optional dot, and format with commas
    const raw = onlyDigitsAndDot(e.target.value);

    // Avoid more than one dot
    const parts = raw.split(".");
    const normalized = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : raw;

    setForm((prev) => ({ ...prev, amount: formatThousandsMX(normalized) }));

    // Clean table when amount change
    setResult(null);
    setError("");
  };

  const handleRateChange = (e) => {
    const raw = onlyDigitsAndDot(e.target.value);

    // Keep at most 2 decimals (opcional)
    const [i, d] = raw.split(".");
    const normalized = d !== undefined ? `${i}.${d.slice(0, 2)}` : i;

    // Clamp 0..100 (solo cuando ya es número válido)
    const clamped = clampNumberString(normalized, 0, 100);

    setForm((prev) => ({ ...prev, rate: clamped }));
  };

  const handleMonthsChange = (e) => {
    const raw = onlyDigits(e.target.value); // only integers
    setForm((prev) => ({ ...prev, months: raw }));
  };


  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await simulateLoan({
        amount: form.amount,
        rate: form.rate,
        months: form.months,
      });

      const normalized = normalizeSimulationResponse(data);

      if (!normalized?.schedule?.length) {
        throw new Error("Backend returned an empty schedule.");
      }

      setResult(normalized);
    } catch (err) {
      setResult(null);
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          🪙 CreditSim
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Simulador de tabla de amortización (método francés).
        </Typography>

        <Paper elevation={3} sx={{ mt: 3, p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Datos del crédito
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Monto del crédito"
                value={form.amount}
                onChange={handleAmountChange}
                fullWidth
                slotProps={{ htmlInput: { inputMode: "decimal", placeholder: "50,000"} }}
              />
              <TextField
                label="Interés anual (%)"
                value={form.rate}
                onChange={handleRateChange}
                fullWidth
                slotProps={{ htmlInput: { 
                  inputMode: "decimal",
                  min: 0,
                  max: 100, } }}
              />
              <TextField
                label="Plazo (meses)"
                value={form.months}
                onChange={handleMonthsChange}
                fullWidth
                slotProps={{ htmlInput: { 
                  inputMode: "numeric",
                  min: 1,
                  step: 1, } }}
              />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 2 }} alignItems="center">
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{ minWidth: 140, borderRadius: 2 }}
              >
                {loading ? (
                  <>
                    <CircularProgress size={18} sx={{ mr: 1 }} />
                    Calculando...
                  </>
                ) : (
                  "Calcular"
                )}
              </Button>

              <Typography variant="body2" color="text.secondary">
                Tip: Cambiar el monto del crédito borra la tabla calculada.
              </Typography>
            </Stack>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {result && (
            <>
              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ mb: 1 }}>
                Resumen
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Mensualidad
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {formatMoney(result.monthly_payment)}
                  </Typography>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Interés total
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {formatMoney(result.total_interest)}
                  </Typography>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, flex: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Monto total
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {formatMoney(result.total_paid)}
                  </Typography>
                </Paper>
              </Stack>

              <AmortizationTable rows={result.schedule} />
            </>
          )}
        </Paper>
      </Container>
    </>
  );
}
