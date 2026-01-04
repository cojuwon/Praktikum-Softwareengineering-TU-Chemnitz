# ViewSets für die API
from .anfrage import AnfrageViewSet
from .begleitung import BegleitungViewSet
from .beratungstermin import BeratungsterminViewSet
from .fall import FallViewSet
from .gewaltfolge import GewaltfolgeViewSet
from .gewalttat import GewalttatViewSet
from .klient import KlientInViewSet
from .konto import KontoViewSet
from .preset import PresetViewSet
from .statistik import StatistikViewSet

__all__ = [
    'AnfrageViewSet',
    'BegleitungViewSet',
    'BeratungsterminViewSet',
    'FallViewSet',
    'GewaltfolgeViewSet',
    'GewalttatViewSet',
    'KlientInViewSet',
    'KontoViewSet',
    'PresetViewSet',
    'StatistikViewSet',
]
