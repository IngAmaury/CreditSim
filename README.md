# 🪙 CreditSim

This project is a simple credit simulator. It calculates a monthly amortization schedule (French system) and shows it in a table.
The backend also saves each simulation in a database, and it runs a mock “risk audit” asynchronously (it does not block the main response).

## Tech Stack 💻
- Frontend: React (Vite).
- Backend: FastAPI(Python).
- Database: SQLite.

## Project Installation 🔽

Requirements:
- **Node.js** (recommended: LTS)
- **Python** (recommended: 3.10+)
- **pip** (Python package manager)

### **Backend** 

1. Create and activate a virtual environment.

Windows: 
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

MacOS/Linux:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies.

```bash
pip install -r requirements.txt
```

3. Run the API (local).

```bash
fastapi dev main.py
```

The backend will run at:

- http://127.0.0.1:8000

Optional (Swagger UI):

- http://127.0.0.1:8000/docs

### **Frontend**

1. Install dependencies.

```bash
cd frontend
npm install
```

2. Run the app local.

```bash
npm run dev
```

## How to use (local) ⌨️

1. Start the backend.

2. Start the frontend.

3. Open the frontend URL in your browser.

4. Enter: 
    - *Monto del crédito* (Loan amount)
    - *Interés anual (%)* (Annual interest rate)
    - *Plazo (meses)* (Term in months)

5. Click *"Calcular"* to generate the amortization table.

## API Endpoints 🎯

<mark>POST /simulate</mark>

Calculates the amortization schedule and saves the simulation in the database.

**Request body (JSON):**

```json
{
  "amount": 50000,
  "rate": 24,
  "months": 1
}
```

**Response (example):**

```json
{
  "ok": true,
  "simulation_id": 1,
  "audit_status": "PENDING",
  "data": {
    "monthly_payment": 25752.48,
    "total_paid": 1504.95,
    "total_interest": 51504.95,
    "schedule": [
        { "month": 1, "payment": 25752.48, "interest": 1000.00, "principal": 24752.48, "balance": 25247.52 },
        { "month": 2, "payment": 25752.48, "interest": 504.95, "principal": 25247.52, "balance": 0 }
    ]
  }
}
```
<mark> GET /simulations/{id} </mark>

Returns the current status of the risk audit for a given simulation.

**Response (example):**

```json
{
  "id": 1,
  "audit_status": "SUCCESS"
}
```

## Database 🗃️

The database is stored as a file: creditsim.db.

> Location: it is created in the directory where the backend is executed.

This project stores:

- Input values (amount, annual rate, months).
- Calculation results (monthly payment, total interest and principal).
- Full amortization schedule (stored as JSON).
- Audit status (PENDING, SUCCESS, FAILED)

## Risk Audit (Mock Scoring) 🚩

After each simulation:
- The API triggers a mock external scoring/audit process.
- It runs asynchronously (background) and does not block the /simulate response.
- It takes 1–3 seconds.
- It fails ~10% of the time (simulated).