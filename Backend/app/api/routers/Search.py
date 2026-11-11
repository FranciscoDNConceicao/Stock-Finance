from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.AccountSchemas import CompanySearchResult
from app.models.Company.Company import CompanyTable as Company

router = APIRouter()


def _escape_like(text: str) -> str:
    return text.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")


@router.get("/search", response_model=list[CompanySearchResult])
def search_companies(
    q: str = Query(..., min_length=1, max_length=50, description="Ticker or company name"),
    limit: int = Query(10, ge=1, le=50),
    session: Session = Depends(get_db),
):
    """Companies whose ticker or name matches `q`: exact ticker first, then ticker prefix, then name."""
    term = q.strip()
    if not term:
        return []
    pattern = _escape_like(term)
    rank = case(
        (Company.code.ilike(pattern, escape="\\"), 0),
        (Company.code.ilike(f"{pattern}%", escape="\\"), 1),
        (Company.name.ilike(f"{pattern}%", escape="\\"), 2),
        else_=3,
    )
    rows = (
        session.query(Company.id, Company.code, Company.name, Company.color)
        .filter(or_(Company.code.ilike(f"{pattern}%", escape="\\"), Company.name.ilike(f"%{pattern}%", escape="\\")))
        .order_by(rank, Company.code)
        .limit(limit)
        .all()
    )
    return [CompanySearchResult(id=r.id, code=r.code, name=r.name, color=r.color) for r in rows]
