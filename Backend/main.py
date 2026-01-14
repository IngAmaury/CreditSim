from fastapi import FastAPI, HTTPException
from schemas import SimulateRequest
from services import calculate_french_amortization, risk_audit
import asyncio

app = FastAPI()

@app.post("/simulate")
def simulate(payload: SimulateRequest):
    try:
        mp, tp, ti, schedule = calculate_french_amortization(
            amount=payload.amount,
            annual_rate=payload.rate,
            term_months=payload.months,
        )
        
        simulation_id = 1

        asyncio.create_task(risk_audit(simulation_id, payload.amount, payload.rate, payload.months))
        return {"ok": True, "data": {
            "monthly_payment": mp,
            "total_paid": tp,
            "total_interest": ti,
            "schedule": schedule},
            }

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))