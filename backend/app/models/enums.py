import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    DENTIST = "dentist"
    ASSISTANT = "assistant"
    RECEPTIONIST = "receptionist"


class Sex(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class ToothNotation(str, enum.Enum):
    PERMANENT = "permanent"
    TEMPORARY = "temporary"


class ToothSurface(str, enum.Enum):
    VESTIBULAR = "vestibular"
    LINGUAL = "lingual"
    MESIAL = "mesial"
    DISTAL = "distal"
    OCLUSAL = "oclusal"
    ROOT = "root"
    CROWN = "crown"
    WHOLE = "whole"


class ToothCondition(str, enum.Enum):
    HEALTHY = "healthy"
    CARIES = "caries"
    RESIN = "resin"
    ENDODONTICS = "endodontics"
    CROWN = "crown"
    IMPLANT = "implant"
    EXTRACTION = "extraction"
    ABSENT = "absent"
    PROSTHESIS = "prosthesis"
    SEALANT = "sealant"
    FRACTURE = "fracture"
    MOBILITY = "mobility"


class TreatmentStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"


class AppointmentStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class BudgetStatus(str, enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    APPROVED = "approved"
    REJECTED = "rejected"


class CashMovementType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    CARD = "card"
    TRANSFER = "transfer"
    YAPE = "yape"
    PLIN = "plin"
    OTHER = "other"
