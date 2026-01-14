from fastapi import FastAPI, HTTPException
from services import calculate_french_amortization
from schemas import SimulateRequest

app = FastAPI()

@app.post("/simulate")
def simulate(payload: SimulateRequest):
    try:
        mp, tp, ti, schedule = calculate_french_amortization(
            amount=payload.amount,
            annual_rate=payload.rate,
            term_months=payload.months,
        )
        return {"ok": True, "data": {
            "montly_payment": mp,
            "total_paid": tp,
            "total_interest": ti,
            "schedule": schedule
        }}

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))