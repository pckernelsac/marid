from fastapi import APIRouter

from app.api.v1.endpoints import (
    appointments,
    auth,
    budgets,
    cashbox,
    clinic,
    clinical_history,
    dashboard,
    odontogram,
    patients,
    radiographs,
    reports,
    treatments,
    users,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(patients.router)
api_router.include_router(odontogram.router)
api_router.include_router(clinical_history.router)
api_router.include_router(treatments.router)
api_router.include_router(cashbox.router)
api_router.include_router(appointments.router)
api_router.include_router(budgets.router)
api_router.include_router(clinic.router)
api_router.include_router(radiographs.router)
api_router.include_router(reports.router)
api_router.include_router(dashboard.router)
