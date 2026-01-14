from db import engine
from db import get_db
from fastapi import FastAPI, HTTPException, Depends
from models import Base
from models import Simulation
from schemas import SimulateRequest
from services import calculate_french_amortization, risk_audit
from sqlalchemy.orm import Session
import asyncio
import json

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.post("/simulate")
async def simulate(payload: SimulateRequest, db: Session = Depends(get_db),):
    try:
        mp, tp, ti, schedule = calculate_french_amortization(
            amount=payload.amount,
            annual_rate=payload.rate,
            term_months=payload.months,
        )
        
        sim = Simulation(
            amount=payload.amount,
            rate=payload.rate,
            months=payload.months,
            monthly_payment=mp,
            total_paid=tp,
            total_interest=ti,
            schedule_json=json.dumps(schedule, ensure_ascii=False),
            audit_status="PENDING",
        )

        db.add(sim)
        db.commit()
        db.refresh(sim)

        asyncio.create_task(risk_audit(sim.id, payload.amount, payload.rate, payload.months))
        return {"ok": True, 
                "simulation_id": sim.id,
                "audit_status": "PENDING",
                "data": {
                    "monthly_payment": mp,
                    "total_paid": tp,
                    "total_interest": ti,
                    "schedule": schedule},
                }

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))