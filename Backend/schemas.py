from pydantic import BaseModel, Field

class SimulateRequest(BaseModel):
    amount: float = Field(..., gt=0)
    rate: float = Field(..., ge=0, le=100)
    months: int = Field(..., gt=0)