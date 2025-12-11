from django.urls import path, include
from drf_spectacular.views import SpectacularSwaggerView, SpectacularRedocView, SpectacularAPIView


# Import the views and your custom serializers
from dj_rest_auth.views import LoginView
from dj_rest_auth.registration.views import RegisterView
from api.serializers import CustomLoginSerializer, CustomRegisterSerializer
from .views import anfrage
from .views import begleitung
from .views import beratungstermin
from .views import eingabefeld
from .views import fall
from .views import gewaltfolge
from .views import gewalttat
from .views import klient
from .views import konto
from .views import preset
from .views import statistik

urlpatterns = [
    # 1. Explicitly override Login and Registration with your custom serializers
    path('auth/login/', LoginView.as_view(serializer_class=CustomLoginSerializer), name='rest_login'),
    path('auth/registration/', RegisterView.as_view(serializer_class=CustomRegisterSerializer), name='rest_register'),

    # 2. Include the rest of the auth URLs (Logout, Password Reset, etc.)
    path('auth/', include('dj_rest_auth.urls')),
    
    # 3. Documentation URLs
    path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
]