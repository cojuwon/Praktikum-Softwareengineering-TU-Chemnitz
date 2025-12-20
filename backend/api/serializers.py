from rest_framework import serializers
from dj_rest_auth.serializers import LoginSerializer
from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import (
    Konto, KlientIn, Preset, Fall, Beratungstermin, Begleitung,
    Gewalttat, Gewaltfolge, Anfrage, Statistik
)

class KontoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Konto
        fields = ('id', 'vorname_mb', 'nachname_mb', 'mail_mb', 'rolle_mb')
        read_only_fields = ('id', 'mail_mb', 'rolle_mb')
        
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

class KlientInSerializer(serializers.ModelSerializer):
    class Meta:
        model = KlientIn
        fields = '__all__'

class PresetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Preset
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

class StatistikSerializer(serializers.ModelSerializer):
    class Meta:
        model = Statistik
        fields = '__all__'
