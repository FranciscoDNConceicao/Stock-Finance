"""Paper-trading wallet: orders fill at the latest close stored in the database."""

from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.prices import latest_quotes
from app.core.security import get_current_user
from app.database import get_db
from app.models.AccountSchemas import PositionOut, TradeIn, TransactionOut, WalletOut
from app.models.Company.Company import CompanyTable
from app.models.User.User import UserTable
from app.models.Wallet.Wallet import WalletPositionTable, WalletTransactionTable

router = APIRouter()

CENTS = Decimal("0.0001")


def _money(value: Decimal) -> float:
    return round(float(value), 2)


def build_wallet(session: Session, user: UserTable) -> WalletOut:
    rows = (
        session.query(WalletPositionTable, CompanyTable)
        .join(CompanyTable, CompanyTable.id == WalletPositionTable.company_id)
        .filter(WalletPositionTable.user_id == user.id)
        .order_by(CompanyTable.code)
        .all()
    )
    quotes = latest_quotes(session, [position.company_id for position, _ in rows])

    positions: list[PositionOut] = []
    holdings = day = total = Decimal(0)
    for position, company in rows:
        quote = quotes.get(position.company_id)
        quantity = Decimal(position.quantity)
        cost = Decimal(position.cost_basis)
        # Without a price the position is valued at cost, so it adds no fake P/L
        value = quantity * quote.last if quote else cost
        day_change = quantity * (quote.last - quote.previous) if quote and quote.previous else Decimal(0)
        total_change = value - cost

        holdings += value
        day += day_change
        total += total_change
        positions.append(
            PositionOut(
                company_id=company.id,
                code=company.code,
                name=company.name,
                color=company.color,
                quantity=float(quantity),
                avg_price=_money(cost / quantity) if quantity else 0.0,
                last_price=float(quote.last) if quote else None,
                previous_close=float(quote.previous) if quote and quote.previous else None,
                last_update=quote.last_date if quote else None,
                market_value=_money(value),
                day_change=_money(day_change),
                total_change=_money(total_change),
                total_change_pct=round(float(total_change / cost), 4) if cost else 0.0,
            )
        )

    cash = Decimal(user.cash_balance)
    return WalletOut(
        currency="USD",
        cash=_money(cash),
        holdings_value=_money(holdings),
        balance=_money(cash + holdings),
        day_change=_money(day),
        total_change=_money(total),
        positions=positions,
    )


@router.get("", response_model=WalletOut)
def get_wallet(user: UserTable = Depends(get_current_user), session: Session = Depends(get_db)):
    return build_wallet(session, user)


@router.post("/transactions", response_model=WalletOut, status_code=status.HTTP_201_CREATED)
def trade(order: TradeIn, user: UserTable = Depends(get_current_user), session: Session = Depends(get_db)):
    """Buys or sells shares at the latest stored close and returns the updated wallet."""
    company = session.get(CompanyTable, order.company_id)
    if company is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    quote = latest_quotes(session, [company.id]).get(company.id)
    if quote is None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="No price available for this company")

    # Lock the account and the position so concurrent orders can't overspend
    account = session.query(UserTable).filter(UserTable.id == user.id).with_for_update().one()
    position = (
        session.query(WalletPositionTable)
        .filter(WalletPositionTable.user_id == user.id, WalletPositionTable.company_id == company.id)
        .with_for_update()
        .first()
    )

    quantity = order.quantity
    amount = (quantity * quote.last).quantize(CENTS)
    cash = Decimal(account.cash_balance)

    if order.side == "buy":
        if amount > cash:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient cash")
        account.cash_balance = cash - amount
        if position is None:
            session.add(
                WalletPositionTable(user_id=user.id, company_id=company.id, quantity=quantity, cost_basis=amount)
            )
        else:
            position.quantity = Decimal(position.quantity) + quantity
            position.cost_basis = Decimal(position.cost_basis) + amount
    else:
        held = Decimal(position.quantity) if position else Decimal(0)
        if quantity > held:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Not enough shares to sell")
        account.cash_balance = cash + amount
        if quantity == held:
            session.delete(position)
        else:
            cost = Decimal(position.cost_basis)
            position.cost_basis = (cost - cost * quantity / held).quantize(CENTS)
            position.quantity = held - quantity

    session.add(
        WalletTransactionTable(
            user_id=user.id,
            company_id=company.id,
            side=order.side,
            quantity=quantity,
            price=quote.last,
            price_date=quote.last_date,
        )
    )
    session.commit()
    session.refresh(account)
    return build_wallet(session, account)


@router.get("/transactions", response_model=list[TransactionOut])
def list_transactions(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user: UserTable = Depends(get_current_user),
    session: Session = Depends(get_db),
):
    rows = (
        session.query(WalletTransactionTable, CompanyTable)
        .join(CompanyTable, CompanyTable.id == WalletTransactionTable.company_id)
        .filter(WalletTransactionTable.user_id == user.id)
        .order_by(WalletTransactionTable.executed_at.desc(), WalletTransactionTable.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [
        TransactionOut(
            id=tx.id,
            company_id=company.id,
            code=company.code,
            name=company.name,
            color=company.color,
            side=tx.side,
            quantity=float(tx.quantity),
            price=float(tx.price),
            total=_money(Decimal(tx.quantity) * Decimal(tx.price)),
            price_date=tx.price_date,
            executed_at=tx.executed_at,
        )
        for tx, company in rows
    ]
