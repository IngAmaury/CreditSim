import * as React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
} from "@mui/material";

export function formatMoney(x) {
  if (x === null || x === undefined || Number.isNaN(Number(x))) return "-";
  return Number(x).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

export default function AmortizationTable({ rows }) {
  if (!rows?.length) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Tabla de Amortización
      </Typography>

      <TableContainer component={Paper} elevation={2}>
        <Table size="small" aria-label="tabla de amortización">
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.900" }}>
              <TableCell sx={{ color: "common.white", fontWeight: 700 }}>
                Mes
              </TableCell>
              <TableCell align="right" sx={{ color: "common.white", fontWeight: 700 }}>
                Mensualidad
              </TableCell>
              <TableCell align="right" sx={{ color: "common.white", fontWeight: 700 }}>
                Interés
              </TableCell>
              <TableCell align="right" sx={{ color: "common.white", fontWeight: 700 }}>
                Capital
              </TableCell>
              <TableCell align="right" sx={{ color: "common.white", fontWeight: 700 }}>
                Saldo
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((r, idx) => (
              <TableRow
                key={r.month ?? idx}
                sx={{
                  "&:nth-of-type(odd)": { backgroundColor: "action.hover" },
                }}
              >
                <TableCell>{r.month}</TableCell>
                <TableCell align="right">{formatMoney(r.payment)}</TableCell>
                <TableCell align="right">{formatMoney(r.interest)}</TableCell>
                <TableCell align="right">{formatMoney(r.principal)}</TableCell>
                <TableCell align="right">{formatMoney(r.balance)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
