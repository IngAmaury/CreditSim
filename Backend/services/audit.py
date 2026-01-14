import asyncio
import random
from db import SessionLocal
from models import Simulation

async def risk_audit(simulation_id: int, amount: float, rate: float, months: int) -> None:
    status = "FAILED"
    error_msg = None
    
    try:
        await asyncio.sleep(random.uniform(1, 3))
        
        if random.random() < 0.10:
            raise RuntimeError("Scoring service failed (simulated)")
        
        status = "SUCCESS"
        print("AUDIT OK", simulation_id)
    except Exception as e:
        print("AUDIT FAILED", simulation_id, str(e))

    # UPDATE database
    db = SessionLocal()
    try:
        sim = db.get(Simulation, simulation_id)
        if sim is not None:
            sim.audit_status = status
            sim.audit_error = error_msg
            db.commit()
    finally:
        db.close()
