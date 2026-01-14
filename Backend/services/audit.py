import asyncio
import random

async def risk_audit(simulation_id: int, amount: float, rate: float, months: int) -> None:
    try:
        await asyncio.sleep(random.uniform(1, 3))
        
        if random.random() < 0.10:
            raise RuntimeError("Scoring service failed (simulated)")
        print("AUDIT OK", simulation_id)
    except Exception as e:
        print("AUDIT FAILED", simulation_id, str(e))
