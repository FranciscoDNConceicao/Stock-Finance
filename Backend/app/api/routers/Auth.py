from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.rate_limit import limiter
from app.core.security import create_access_token, get_current_user, hash_password, verify_password
from app.database import get_db
from app.models.AccountSchemas import Credentials, TokenOut, UserOut
from app.models.User.User import UserTable
from app.settings import settings

router = APIRouter()


def _token_for(user: UserTable) -> TokenOut:
    return TokenOut(
        access_token=create_access_token(user.id),
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserOut.model_validate(user),
    )


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
@limiter.limit(settings.RATE_LIMIT_AUTH)
def register(request: Request, credentials: Credentials, session: Session = Depends(get_db)):
    """Creates an account with a paper-trading wallet and returns an access token."""
    user = UserTable(
        email=credentials.email,
        hashed_password=hash_password(credentials.password),
        cash_balance=settings.WALLET_STARTING_BALANCE,
    )
    session.add(user)
    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered") from None
    session.refresh(user)
    return _token_for(user)


@router.post("/login", response_model=TokenOut)
@limiter.limit(settings.RATE_LIMIT_AUTH)
def login(request: Request, credentials: Credentials, session: Session = Depends(get_db)):
    user = session.query(UserTable).filter(UserTable.email == credentials.email).first()
    if user is None or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return _token_for(user)


@router.get("/me", response_model=UserOut)
def me(user: UserTable = Depends(get_current_user)):
    return user
