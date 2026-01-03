from rest_framework import serializers
from dj_rest_auth.serializers import LoginSerializer
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import Konto, KlientIn, Fall, Beratungstermin, Begleitung, Gewalttat, Gewaltfolge, Anfrage, Preset, Statistik
import sys

print("--- LOADING API SERIALIZERS ---", file=sys.stderr)


class KontoSerializer(serializers.ModelSerializer):
    """Serializer für Benutzerdetails ohne Berechtigungen."""
    class Meta:
        model = Konto
        fields = ('id', 'vorname_mb', 'nachname_mb', 'mail_mb', 'rolle_mb')
        read_only_fields = ('id', 'mail_mb', 'rolle_mb')


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
        fields = ['id', 'vorname_mb', 'nachname_mb', 'mail_mb', 'rolle_mb', 'groups', 'permissions']
        read_only_fields = ['id', 'mail_mb', 'rolle_mb', 'groups', 'permissions']

    def get_permissions(self, user):
        """
        Holt Rechte, die dem User direkt zugewiesen sind UND die Rechte seiner Gruppen.
        Dies beinhaltet AUTOMATISCH auch die Custom Permissions!
        """
        return list(user.get_all_permissions())


class CustomLoginSerializer(LoginSerializer):
    username = None 
    def validate(self, attrs):
        return super().validate(attrs)
    
class CustomRegisterSerializer(RegisterSerializer):
    username = None
    
    vorname_mb = serializers.CharField(required=True)
    nachname_mb = serializers.CharField(required=True)
    
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
        user.save()
        return user


# --- Model Serializers für ViewSets ---

class KlientInSerializer(serializers.ModelSerializer):
    class Meta:
        model = KlientIn
        fields = '__all__'


class FallSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fall
        fields = '__all__'


class BeratungsterminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Beratungstermin
        fields = '__all__'


class BegleitungSerializer(serializers.ModelSerializer):
    class Meta:
        model = Begleitung
        fields = '__all__'


class GewalttatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gewalttat
        fields = '__all__'


class GewaltfolgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gewaltfolge
        fields = '__all__'


class AnfrageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Anfrage
        fields = '__all__'


class PresetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Preset
        fields = '__all__'


class StatistikSerializer(serializers.ModelSerializer):
    class Meta:
        model = Statistik
        fields = '__all__'