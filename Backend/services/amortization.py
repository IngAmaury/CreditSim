from decimal import Decimal, ROUND_HALF_UP
from typing import Union, TypedDict

PrecisionNumber = Union[int, float, str, Decimal]

class AmortRow(TypedDict):
    month: int
    payment: float
    interest: float
    principal: float
    balance: float

def money(value: PrecisionNumber, precision: str = "0.01") -> float:
    """
    Convert a number to float and round it using ROUND_HALF_UP.
    Default: 2 decimals ("0.01").
    """
    q = Decimal(precision)

    d = value if isinstance(value,Decimal) else Decimal(str(value))

    return float(d.quantize(q, rounding=ROUND_HALF_UP))

def calculate_french_amortization(
        amount:float = 1000,
        annual_rate: float = 1,
        term_months: int = 12
        ) -> tuple[float, float, float, list[AmortRow]]:
    
    """
    Calculate a French amortization schedule.

    In the French amortization system, the monthly payment is constant across the loan term.
    Each payment is split into:
    - Interest (based on the remaining balance)
    - Principal (the part that reduces the remaining balance)

    Inputs
    ------
    amount:
        Loan principal (the initial amount borrowed). Must be a number greater than 0.
    annual_rate:
        Annual interest rate in percent (e.g., 24 means 24% per year).
        Must be a number between 0 and 100.
    term_months:
        Loan term in months. Must be an integer greater than 0.

    Returns
    -------
    (monthly_payment, total_paid, total_interest, schedule):
        monthly_payment:
            Fixed payment per month.
        total_paid:
            Total amount paid over the full term (amount + interest).
        total_interest:
            Total interest paid over the full term.
        schedule:
            List of rows (one per month). Each row contains:
            - month: int (1 ... term_months)
            - payment: float (fixed monthly payment)
            - interest: float (interest paid that month)
            - principal: float (principal paid that month)
            - balance: float (remaining balance after the payment)

    Raises
    ------
    ValueError:
        If the inputs do not meet the required constraints.
    """
    # Inputs validations:
    if not isinstance(amount, (int, float)) or amount <= 0:
        raise ValueError("Amount must be a number greater than 0")
    
    if not isinstance(annual_rate, (int, float)) or annual_rate < 0 or annual_rate > 100:
        raise ValueError("The annual rate must be a number between 0 and 100")
    
    if not isinstance(term_months, int) or term_months <= 0:
        raise ValueError("Payment periods must be an integer greater than 0")
    
    # Calculate amortization:
    schedule: list[AmortRow] = []
    total_interest: float = 0.0
    current_amount = amount
    month_rate = (annual_rate/100)/12

    if month_rate == 0:
        monthly_payment = amount / term_months
    else:
        # L (r / [1 - (1 + r)^-n] )
        monthly_payment = amount * (month_rate / (1 - (1 + month_rate)**(-term_months)))

    total_paid = monthly_payment * term_months

    for m in range(term_months):
        interest = current_amount*month_rate
        principal = monthly_payment-interest
        schedule.append({
            'month': m+1,
            'payment': money(monthly_payment),
            'interest': money(interest),
            'principal': money(principal),
            'balance': money(current_amount-principal),
        })
        current_amount -= principal
        total_interest += interest
    
    return money(monthly_payment), money(total_paid), money(total_interest), schedule
