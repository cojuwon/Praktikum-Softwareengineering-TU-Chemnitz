"""
Serializers Package für die API.

Alle Serializers werden hier re-exportiert für einfachen Import:
    from api.serializers import AnfrageSerializer, KontoSerializer
"""

from .auth import (
    KontoSerializer,
    KontoMeSerializer,
    CustomLoginSerializer,
    CustomRegisterSerializer,
)
from .klient import KlientInSerializer
from .fall import FallSerializer
from .beratungstermin import BeratungsterminSerializer
from .begleitung import BegleitungSerializer
from .gewalttat import GewalttatSerializer
from .gewaltfolge import GewaltfolgeSerializer
from .anfrage import AnfrageSerializer
from .preset import PresetSerializer
from .statistik import StatistikSerializer

__all__ = [
    # Auth
    'KontoSerializer',
    'KontoMeSerializer',
    'CustomLoginSerializer',
    'CustomRegisterSerializer',
    # Models
    'KlientInSerializer',
    'FallSerializer',
    'BeratungsterminSerializer',
    'BegleitungSerializer',
    'GewalttatSerializer',
    'GewaltfolgeSerializer',
    'AnfrageSerializer',
    'PresetSerializer',
    'StatistikSerializer',
]
