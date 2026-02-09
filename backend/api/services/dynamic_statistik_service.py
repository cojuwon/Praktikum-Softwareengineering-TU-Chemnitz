"""
DynamicStatistikService - Dynamische Daten-Aggregation für konfigurierbares Reporting.
Ersetzt hardcodierte Aggregationen durch metadatengetriebene Queries.
"""
from django.db.models import Count, Sum, Avg, F, Q
from django.db.models.fields import (
    CharField, IntegerField, DateField, BooleanField, 
    TextField, DecimalField, FloatField
)
from django.db.models.fields.related import ForeignKey
from django.apps import apps
import logging
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError

logger = logging.getLogger(__name__)


# Erlaubte Models für Statistik-Queries
ALLOWED_MODELS = ['Anfrage', 'Fall', 'KlientIn', 'Beratungstermin', 'Begleitung', 'Gewalttat', 'Gewaltfolge']


class ModelMetadataExtractor:
    """Extrahiert Metadaten aus Django-Models für dynamische Statistik-Konfiguration."""
    
    # Feld-Typen, die als Filter verwendet werden können
    FILTERABLE_FIELD_TYPES = (DateField, BooleanField, CharField, IntegerField)
    
    # Feld-Typen, die als Gruppierung (Dimension) verwendet werden können
    GROUPABLE_FIELD_TYPES = (CharField, IntegerField, BooleanField)
    
    # Feld-Typen, die für Sum-Aggregation geeignet sind
    SUMMABLE_FIELD_TYPES = (IntegerField, DecimalField, FloatField)
    
    @classmethod
    def extract(cls, model) -> dict:
        """
        Extrahiert alle relevanten Metadaten aus einem Django-Model.
        
        Returns:
            Dict mit filterable_fields, groupable_fields, metrics
        """
        meta = model._meta
        
        filterable = []
        groupable = []
        summable = []
        
        for field in meta.get_fields():
            # Überspringe Relationen (außer ForeignKey) - prüfe ob related_model tatsächlich gesetzt ist
            if getattr(field, 'related_model', None) is not None and not isinstance(field, ForeignKey):
                continue
            
            # Überspringe automatisch generierte Felder
            if getattr(field, 'auto_created', False) and not isinstance(field, ForeignKey):
                continue
                
            field_info = cls._get_field_info(field)
            if not field_info:
                continue
            
            # Kategorisieren
            if isinstance(field, cls.FILTERABLE_FIELD_TYPES):
                filterable.append(field_info)
            
            if isinstance(field, cls.GROUPABLE_FIELD_TYPES):
                # Nur Felder mit Choices sind gute Dimensionen
                if getattr(field, 'choices', None):
                    groupable.append(field_info)
            
            if isinstance(field, cls.SUMMABLE_FIELD_TYPES):
                summable.append({
                    'name': field.name,
                    'label': getattr(field, 'verbose_name', field.name),
                    'metric': 'sum'
                })
        
        return {
            'model_name': model.__name__,
            'verbose_name': meta.verbose_name,
            'verbose_name_plural': meta.verbose_name_plural,
            'filterable_fields': filterable,
            'groupable_fields': groupable,
            'metrics': [
                {'name': 'count', 'label': 'Anzahl'},
                *[{'name': f'sum_{s["name"]}', 'label': f'Summe {s["label"]}'} for s in summable]
            ]
        }
    
    @classmethod
    def _get_field_info(cls, field) -> dict | None:
        """Extrahiert Feld-Informationen mit Choices."""
        if not hasattr(field, 'name'):
            return None
            
        info = {
            'name': field.name,
            'label': getattr(field, 'verbose_name', field.name),
            'type': cls._get_field_type_name(field)
        }
        
        # Choices hinzufügen falls vorhanden
        choices = getattr(field, 'choices', None)
        if choices:
            info['choices'] = [
                {'value': c[0], 'label': c[1]} for c in choices
            ]
        
        return info
    
    @classmethod
    def _get_field_type_name(cls, field) -> str:
        """Gibt den Feld-Typ als String zurück."""
        if isinstance(field, DateField):
            return 'date'
        elif isinstance(field, BooleanField):
            return 'boolean'
        elif isinstance(field, (IntegerField, DecimalField, FloatField)):
            return 'number'
        elif isinstance(field, CharField) and getattr(field, 'choices', None):
            return 'select'
        elif isinstance(field, (CharField, TextField)):
            return 'text'
        else:
            return 'unknown'


class DynamicStatistikService:
    """Service für dynamische Statistik-Abfragen."""
    
    @staticmethod
    def get_metadata() -> dict:
        """
        Liefert Metadaten für alle analysierbaren Models.
        
        Returns:
            Dict mit Model-Namen als Keys und deren Metadaten als Values
        """
        result = {}
        for model_name in ALLOWED_MODELS:
            try:
                model = apps.get_model('api', model_name)
                result[model_name] = ModelMetadataExtractor.extract(model)
            except LookupError:
                logger.warning(f"Model {model_name} nicht gefunden")
        return result
    
    @staticmethod
    def get_allowed_fields(model_name: str) -> set:
        """Gibt alle erlaubten Felder für ein Model zurück (für Whitelist-Validierung)."""
        metadata = DynamicStatistikService.get_metadata()
        if model_name not in metadata:
            return set()
        
        model_meta = metadata[model_name]
        allowed = set()
        
        for field in model_meta['filterable_fields']:
            allowed.add(field['name'])
        
        for field in model_meta['groupable_fields']:
            allowed.add(field['name'])
            
        return allowed
    
    @staticmethod
    def validate_query(base_model: str, filters: dict, group_by: str, metric: str = 'count') -> tuple[bool, str]:
        """
        Validiert eine Query gegen die erlaubten Felder und Metriken.
        
        Returns:
            Tuple (is_valid, error_message)
        """
        if base_model not in ALLOWED_MODELS:
            return False, f"Model '{base_model}' ist nicht für Statistiken freigegeben."
        
        metadata = DynamicStatistikService.get_metadata()
        if base_model not in metadata:
             return False, f"Model '{base_model}' nicht gefunden."
             
        model_meta = metadata[base_model]
        
        # Erstelle Sets für schnelle Suche
        allowed_fields = set()
        for field in model_meta['filterable_fields']:
            allowed_fields.add(field['name'])
        for field in model_meta['groupable_fields']:
            allowed_fields.add(field['name'])
            
        # 1. Validiere group_by
        if group_by and group_by not in allowed_fields:
            return False, f"Feld '{group_by}' ist nicht als Gruppierung erlaubt für {base_model}."
        
        # 2. Validiere Filter-Felder und Lookups
        ALLOWED_LOOKUPS = {'', 'gte', 'lte', 'exact', 'in', 'icontains', 'gt', 'lt', 'contains', 'startswith', 'endswith', 'year', 'month', 'day'}
        
        for filter_key in filters.keys():
            parts = filter_key.split('__')
            field_name = parts[0]
            
            # Lookup validieren (alles nach dem ersten __)
            if len(parts) > 1:
                lookup = parts[-1] # Simple check: last part must be allowed lookup
                # Besser: Checke alle Parts ab index 1, falls chained lookups
                for part in parts[1:]:
                    if part not in ALLOWED_LOOKUPS:
                        return False, f"Ungültiger Filter-Lookup: '{part}' in '{filter_key}'."
            
            if field_name not in allowed_fields:
                return False, f"Filterfeld '{field_name}' ist nicht erlaubt für {base_model}."
                
        # 3. Validiere Metric und Sum-Field
        if metric != 'count':
            if metric.startswith('sum_'):
                 # Prüfe ob Metrik in den Metadaten des Models existiert
                 allowed_metrics = {m['name'] for m in model_meta['metrics']}
                 if metric not in allowed_metrics:
                     return False, f"Metrik '{metric}' ist für {base_model} nicht erlaubt oder Feld nicht summierbar."
            else:
                 return False, f"Ungültige Metrik: '{metric}'."
        
        return True, ""
    
    @staticmethod
    def execute_query(
        base_model: str, 
        filters: dict = None, 
        group_by: str = None, 
        metric: str = 'count'
    ) -> list:
        """
        Führt eine dynamische Statistik-Abfrage aus.
        """
        filters = filters or {}
        
        # Validierung (inkl. Metrik)
        is_valid, error = DynamicStatistikService.validate_query(base_model, filters, group_by, metric)
        if not is_valid:
            raise ValueError(error)
        
        # Model laden
        try:
            model = apps.get_model('api', base_model)
        except LookupError:
            raise ValueError(f"Model '{base_model}' nicht gefunden.")
        
        # QuerySet aufbauen
        queryset = model.objects.all()
        
        # Filter anwenden
        if filters:
            try:
                queryset = queryset.filter(**filters)
            except (ValueError, TypeError, DjangoValidationError) as e:
                raise DRFValidationError(f"Ungültiger Filterwert: {str(e)}")
        
        # Gruppierung und Aggregation
        if group_by:
            queryset = queryset.values(group_by)
            
            # Aggregation
            if metric == 'count':
                queryset = queryset.annotate(value=Count('pk'))
            elif metric.startswith('sum_'):
                sum_field = metric[4:]  # Entferne 'sum_' Prefix
                queryset = queryset.annotate(value=Sum(sum_field))
            else:
                 raise ValueError(f"Ungültige Metrik: {metric}")
            
            # Labels für Choice-Felder hinzufügen
            results = list(queryset)
            results = DynamicStatistikService._add_choice_labels(model, group_by, results)
            
            return results
        else:
            # Ohne Gruppierung: Gesamtaggregat
            if metric == 'count':
                return [{'value': queryset.count()}]
            elif metric.startswith('sum_'):
                sum_field = metric[4:]
                result = queryset.aggregate(value=Sum(sum_field))
                return [{'value': result['value'] or 0}]
            else:
                raise ValueError(f"Ungültige Metrik: {metric}")
    
    @staticmethod
    def _add_choice_labels(model, field_name: str, results: list) -> list:
        """Fügt lesbare Labels für Choice-Felder hinzu."""
        try:
            field = model._meta.get_field(field_name)
            choices = getattr(field, 'choices', None)
            if choices:
                choice_map = {c[0]: c[1] for c in choices}
                for item in results:
                    raw_value = item.get(field_name)
                    item['label'] = choice_map.get(raw_value, str(raw_value) if raw_value else 'Unbekannt')
            else:
                for item in results:
                    raw_value = item.get(field_name)
                    item['label'] = str(raw_value) if raw_value is not None else 'Unbekannt'
        except Exception as e:
            logger.warning(f"Konnte keine Labels für {field_name} generieren: {e}")
            for item in results:
                item['label'] = str(item.get(field_name, 'Unbekannt'))
        
        return results
