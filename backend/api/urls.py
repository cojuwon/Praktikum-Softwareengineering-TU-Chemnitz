from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularSwaggerView, SpectacularRedocView, SpectacularAPIView


# Import the views and your custom serializers
from dj_rest_auth.views import LoginView
from dj_rest_auth.registration.views import RegisterView
from api.serializers import CustomLoginSerializer, CustomRegisterSerializer

# Import ViewSets
from .views.anfrage import AnfrageViewSet
from .views.begleitung import BegleitungViewSet
from .views.beratungstermin import BeratungsterminViewSet
from .views.fall import FallViewSet
from .views.gewaltfolge import GewaltfolgeViewSet
from .views.gewalttat import GewalttatViewSet
from .views.klient import KlientInViewSet
from .views.konto import KontoViewSet
from .views.preset import PresetViewSet
from .views.statistik import StatistikViewSet
from .views.eingabefeld import EingabefeldViewSet
from .views.groups import GroupViewSet, PermissionViewSet
from .views.fall_notiz import FallNotizViewSet
from .views.system_settings import SystemSettingsViewSet


# Router für ViewSets mit automatischer URL-Generierung
router = DefaultRouter()
router.register(r'anfragen', AnfrageViewSet, basename='anfrage')
router.register(r'begleitungen', BegleitungViewSet, basename='begleitung')
router.register(r'beratungstermine', BeratungsterminViewSet, basename='beratungstermin')
router.register(r'eingabefelder', EingabefeldViewSet, basename='eingabefeld')
router.register(r'faelle', FallViewSet, basename='fall')
router.register(r'fall-notizen', FallNotizViewSet, basename='fall-notiz')
router.register(r'gewaltfolgen', GewaltfolgeViewSet, basename='gewaltfolge')
router.register(r'gewalttaten', GewalttatViewSet, basename='gewalttat')
router.register(r'klienten', KlientInViewSet, basename='klient')
router.register(r'konten', KontoViewSet, basename='konto')
router.register(r'presets', PresetViewSet, basename='preset')
router.register(r'statistiken', StatistikViewSet, basename='statistik')
router.register(r'statistik', StatistikViewSet, basename='statistik_singular')
router.register(r'groups', GroupViewSet, basename='group')
router.register(r'permissions', PermissionViewSet, basename='permission')
router.register(r'system-settings', SystemSettingsViewSet, basename='system-settings')


urlpatterns = [
    # 1. Explicitly override Login and Registration with your custom serializers
    path('auth/login/', LoginView.as_view(serializer_class=CustomLoginSerializer), name='rest_login'),
    path('auth/registration/', RegisterView.as_view(serializer_class=CustomRegisterSerializer), name='rest_register'),

    # 2. Include the rest of the auth URLs (Logout, Password Reset, etc.)
    path('auth/', include('dj_rest_auth.urls')),
    
    # 3. API ViewSets (mit automatischer Permission-Prüfung)
    path('', include(router.urls)),
    
    # 4. Documentation URLs
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
]