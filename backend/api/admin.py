from django.contrib import admin
from .models import (
    Konto, 
    KlientIn, 
    Fall, 
    Begleitung, 
    Beratungstermin, 
    Gewalttat, 
    Gewaltfolge,
    Anfrage,
    Statistik,
    Eingabefeld,
    Preset
)

# Register your models here.

@admin.register(Konto)
class KontoAdmin(admin.ModelAdmin):
    list_display = ('mail_mb', 'vorname_mb', 'nachname_mb', 'rolle_mb', 'is_active')
    search_fields = ('mail_mb', 'nachname_mb')
    list_filter = ('rolle_mb', 'is_active')

@admin.register(KlientIn)
class KlientInAdmin(admin.ModelAdmin):
    list_display = ('klient_id', 'klient_code_display', 'klient_rolle', 'klient_alter', 'erstellt_am')
    search_fields = ('klient_id', 'klient_kontaktpunkt')
    list_filter = ('klient_rolle', 'klient_geschlechtsidentitaet', 'klient_wohnort')
    
    def klient_code_display(self, obj):
        # Fallback helper if klient_code is added later or just show ID
        return f"Klient #{obj.klient_id}"
    klient_code_display.short_description = "Code"

@admin.register(Fall)
class FallAdmin(admin.ModelAdmin):
    list_display = ('fall_id', 'klient', 'mitarbeiterin')
    list_filter = ('mitarbeiterin',)

@admin.register(Begleitung)
class BegleitungAdmin(admin.ModelAdmin):
    list_display = ('begleitungs_id', 'klient', 'datum', 'einrichtung')

@admin.register(Beratungstermin)
class BeratungsterminAdmin(admin.ModelAdmin):
    list_display = ('beratungs_id', 'termin_beratung', 'beratungsstelle', 'berater', 'fall')

@admin.register(Gewalttat)
class GewalttatAdmin(admin.ModelAdmin):
    list_display = ('tat_id', 'klient', 'tatort')

@admin.register(Gewaltfolge)
class GewaltfolgeAdmin(admin.ModelAdmin):
    list_display = ('gewalttat', 'psychische_folgen')

@admin.register(Anfrage)
class AnfrageAdmin(admin.ModelAdmin):
    list_display = ('anfrage_id', 'anfrage_datum', 'anfrage_art', 'mitarbeiterin')

@admin.register(Statistik)
class StatistikAdmin(admin.ModelAdmin):
    list_display = ('statistik_titel', 'creator', 'creation_date')

@admin.register(Eingabefeld)
class EingabefeldAdmin(admin.ModelAdmin):
    list_display = ('label', 'name', 'typ', 'required', 'sort_order')
    list_filter = ('typ', 'required')
    search_fields = ('label', 'name')
    ordering = ('sort_order', 'label')

@admin.register(Preset)
class PresetAdmin(admin.ModelAdmin):
    list_display = ('preset_beschreibung', 'ersteller')