from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularSwaggerView, SpectacularRedocView, SpectacularAPIView

# Import the views and your custom serializers
from dj_rest_auth.views import LoginView
from dj_rest_auth.registration.views import RegisterView
from api.serializers import CustomLoginSerializer, CustomRegisterSerializer
from .views.konto import KontoViewSet
from .views.klient import KlientInViewSet
from .views.preset import PresetViewSet
from .views.fall import FallViewSet
from .views.beratungstermin import BeratungsterminViewSet
from .views.begleitung import BegleitungViewSet
from .views.gewalttat import GewalttatViewSet
from .views.gewaltfolge import GewaltfolgeViewSet
from .views.anfrage import AnfrageViewSet
from .views.statistik import StatistikViewSet
from .views.eingabefeld import EingabefeldView

router = DefaultRouter()
router.register(r'konto', KontoViewSet)
router.register(r'klient', KlientInViewSet)
router.register(r'preset', PresetViewSet)
router.register(r'fall', FallViewSet)
router.register(r'beratungstermin', BeratungsterminViewSet)
router.register(r'begleitung', BegleitungViewSet)
router.register(r'gewalttat', GewalttatViewSet)
router.register(r'gewaltfolge', GewaltfolgeViewSet)
router.register(r'anfrage', AnfrageViewSet)
router.register(r'statistik', StatistikViewSet)

urlpatterns = [
    # 1. Explicitly override Login and Registration with your custom serializers
    path('auth/login/', LoginView.as_view(serializer_class=CustomLoginSerializer), name='rest_login'),
    path('auth/registration/', RegisterView.as_view(serializer_class=CustomRegisterSerializer), name='rest_register'),

    # 2. Include the rest of the auth URLs (Logout, Password Reset, etc.)
    path('auth/', include('dj_rest_auth.urls')),
    
    # 3. Router URLs
    path('', include(router.urls)),

    # 4. Custom Views
    path('eingabefelder/', EingabefeldView.as_view(), name='eingabefelder'),

    # 5. Documentation URLs
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
]
