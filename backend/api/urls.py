from django.urls import path, include
from drf_spectacular.views import SpectacularSwaggerView, SpectacularRedocView, SpectacularAPIView


# Import the views and your custom serializers
from dj_rest_auth.views import LoginView
from dj_rest_auth.registration.views import RegisterView
from api.serializers import CustomLoginSerializer, CustomRegisterSerializer

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