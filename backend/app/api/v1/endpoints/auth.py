from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import CurrentUser, DbSession
from app.core.security import create_access_token, decode_token
from app.schemas.auth import RefreshRequest, Token
from app.schemas.user import UserRead
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(db: DbSession, form_data: OAuth2PasswordRequestForm = Depends()) -> Token:
    """OAuth2 password flow. `username` field carries the email."""
    service = AuthService(db)
    user = service.authenticate(form_data.username, form_data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    db.commit()
    return Token(**service.issue_tokens(user))


@router.post("/refresh", response_model=Token)
def refresh(db: DbSession, body: RefreshRequest) -> Token:
    payload = decode_token(body.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token"
        )
    user_id = payload.get("sub")
    return Token(
        access_token=create_access_token(user_id),
        refresh_token=body.refresh_token,
    )


@router.get("/me", response_model=UserRead)
def me(current_user: CurrentUser) -> UserRead:
    return current_user
