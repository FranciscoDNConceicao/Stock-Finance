from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.prices import latest_quotes
from app.core.security import get_current_user
from app.database import get_db
from app.models.AccountSchemas import WatchlistIn, WatchlistItemOut
from app.models.Company.Company import CompanyTable
from app.models.User.User import UserTable
from app.models.Watchlist.Watchlist import WatchlistTable

router = APIRouter()


def _items(session: Session, user_id: int, company_id: int | None = None) -> list[WatchlistItemOut]:
    query = (
        session.query(WatchlistTable, CompanyTable)
        .join(CompanyTable, CompanyTable.id == WatchlistTable.company_id)
        .filter(WatchlistTable.user_id == user_id)
    )
    if company_id is not None:
        query = query.filter(WatchlistTable.company_id == company_id)
    rows = query.order_by(WatchlistTable.added_at.desc(), WatchlistTable.id.desc()).all()
    quotes = latest_quotes(session, [company.id for _, company in rows])

    items = []
    for entry, company in rows:
        quote = quotes.get(company.id)
        items.append(
            WatchlistItemOut(
                company_id=company.id,
                code=company.code,
                name=company.name,
                color=company.color,
                currency=company.currency_name,
                last_price=float(quote.last) if quote else None,
                change=round(quote.change, 4) if quote and quote.change is not None else None,
                last_update=quote.last_date if quote else None,
                added_at=entry.added_at,
            )
        )
    return items


@router.get("", response_model=list[WatchlistItemOut])
def get_watchlist(user: UserTable = Depends(get_current_user), session: Session = Depends(get_db)):
    return _items(session, user.id)


@router.post("", response_model=WatchlistItemOut, status_code=status.HTTP_201_CREATED)
def add_to_watchlist(
    body: WatchlistIn,
    response: Response,
    user: UserTable = Depends(get_current_user),
    session: Session = Depends(get_db),
):
    """Adds a company. Adding one that is already there is a no-op (200)."""
    if session.get(CompanyTable, body.company_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    session.add(WatchlistTable(user_id=user.id, company_id=body.company_id))
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        response.status_code = status.HTTP_200_OK
    return _items(session, user.id, body.company_id)[0]


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_watchlist(
    company_id: int, user: UserTable = Depends(get_current_user), session: Session = Depends(get_db)
):
    deleted = (
        session.query(WatchlistTable)
        .filter(WatchlistTable.user_id == user.id, WatchlistTable.company_id == company_id)
        .delete()
    )
    session.commit()
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company is not in the watchlist")
