from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select

from app.api.deps import CurrentUser, DbSession, require_roles
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])

AdminOnly = Depends(require_roles(UserRole.ADMIN))


@router.get("", response_model=list[UserRead])
def list_users(
    db: DbSession,
    _: CurrentUser,
    role: UserRole | None = Query(default=None),
    active_only: bool = Query(default=True),
) -> list[UserRead]:
    stmt = select(User)
    if role is not None:
        stmt = stmt.where(User.role == role)
    if active_only:
        stmt = stmt.where(User.is_active.is_(True))
    stmt = stmt.order_by(User.full_name)
    return list(db.execute(stmt).scalars().all())


@router.post(
    "", response_model=UserRead, status_code=status.HTTP_201_CREATED, dependencies=[AdminOnly]
)
def create_user(db: DbSession, data: UserCreate) -> UserRead:
    return UserService(db).create(data)


@router.patch("/{user_id}", response_model=UserRead, dependencies=[AdminOnly])
def update_user(db: DbSession, user_id: int, data: UserUpdate) -> UserRead:
    return UserService(db).update(user_id, data)
