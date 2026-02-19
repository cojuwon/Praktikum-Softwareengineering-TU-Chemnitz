"""Serializers für Authentifizierung und Benutzerkonten."""

from rest_framework import serializers
from dj_rest_auth.serializers import LoginSerializer
from dj_rest_auth.registration.serializers import RegisterSerializer

from api.models import Konto


class KontoSerializer(serializers.ModelSerializer):
    """Serializer für Benutzerdetails ohne Berechtigungen."""
    class Meta:
        model = Konto
        fields = ('id', 'vorname_mb', 'nachname_mb', 'mail_mb', 'rolle_mb', 'status_mb', 'is_active')
        read_only_fields = ('id',)


class KontoAdminSerializer(serializers.ModelSerializer):
    """
    Serializer für Admins: Kann User anlegen/bearbeiten inkl. Passwort und Status.
    """
    password = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = Konto
        fields = ('id', 'vorname_mb', 'nachname_mb', 'mail_mb', 'rolle_mb', 'status_mb', 'password', 'is_active')
        read_only_fields = ('id',)

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user


class KontoMeSerializer(serializers.ModelSerializer):
    """
    Erweiterter Serializer für den eingeloggten User (/auth/user/ Endpoint).
    Liefert Berechtigungen und Gruppen mit für das Frontend Permission-Handling.
    """
    # Liefert eine Liste aller Rechte (z.B. ["api.delete_fall", "api.can_export_statistik"])
    permissions = serializers.SerializerMethodField()
    # Liefert Gruppennamen (z.B. ["Basis", "Erweiterung", "Admin"]) für grobe UI-Steuerung
    groups = serializers.SlugRelatedField(
        many=True, read_only=True, slug_field='name'
    )

    class Meta:
        model = Konto
        fields = ['id', 'vorname_mb', 'nachname_mb', 'mail_mb', 'rolle_mb', 'status_mb', 'groups', 'permissions']
        read_only_fields = ['id', 'mail_mb', 'rolle_mb', 'status_mb', 'groups', 'permissions']

    def get_permissions(self, user):
        """
        Holt Rechte, die dem User direkt zugewiesen sind UND die Rechte seiner Gruppen.
        Dies beinhaltet AUTOMATISCH auch die Custom Permissions!
        """
        return list(user.get_all_permissions())


class CustomLoginSerializer(LoginSerializer):
    """Login Serializer ohne Username (nur E-Mail)."""
    username = None

    def validate(self, attrs):
        return super().validate(attrs)


class CustomRegisterSerializer(RegisterSerializer):
    """Registrierungs-Serializer mit Vorname und Nachname."""
    username = None

    vorname_mb = serializers.CharField(required=True)
    nachname_mb = serializers.CharField(required=True)

    def validate_email(self, email):
        if Konto.objects.filter(mail_mb=email).exists():
            raise serializers.ValidationError("Ein Nutzer mit dieser E-Mail-Adresse existiert bereits.")
        return email

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data.update({
            'vorname_mb': self.validated_data.get('vorname_mb', ''),
            'nachname_mb': self.validated_data.get('nachname_mb', ''),
        })
        return data

    def save(self, request):
        user = super().save(request)
        user.vorname_mb = self.cleaned_data.get('vorname_mb')
        user.nachname_mb = self.cleaned_data.get('nachname_mb')
        user.is_active = False  # User muss erst vom Admin freigeschaltet werden
        user.status_mb = 'P'    # Explizit Pending setzen
        user.save(update_fields=['vorname_mb', 'nachname_mb', 'is_active', 'status_mb'])
        return user
