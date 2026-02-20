"""ViewSet für Eingabefeld-Management."""

from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiTypes
from datetime import datetime
from django_filters.rest_framework import DjangoFilterBackend

from api.models import Eingabefeld
from api.serializers import EingabefeldSerializer
from api.permissions import DjangoModelPermissionsWithView

class EingabefeldViewSet(viewsets.ModelViewSet):
    """
    ViewSet für CRUD-Operationen auf Eingabefelder.
    """
    queryset = Eingabefeld.objects.all()
    serializer_class = EingabefeldSerializer
    permission_classes = [permissions.IsAuthenticated, DjangoModelPermissionsWithView]
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['context', 'typ', 'required']
    search_fields = ['name', 'label']
    ordering_fields = ['sort_order', 'label']
    pagination_class = None

    def list(self, request, *args, **kwargs):
        """
        Auto-initializes fields if requested context has no fields in the DB yet, or if required fields are missing.
        """
        context_param = request.query_params.get('context')
        from api.services.eingabefeld_init_service import init_fall_fields, init_anfrage_fields
        if context_param == 'fall':
            init_fall_fields()
        elif context_param == 'anfrage':
            init_anfrage_fields()
        else:
            init_fall_fields()
            init_anfrage_fields()
            
        return super().list(request, *args, **kwargs)

    @extend_schema(
        request=OpenApiTypes.OBJECT,
        responses={200: EingabefeldSerializer},
        description="Setzt den Wert des Eingabefeldes basierend auf dem Typ."
    )
    @action(detail=True, methods=['post', 'patch'], url_path='set-value')
    def set_value(self, request, pk=None):
        """
        Setzt den Wert des Eingabefeldes.
        Erwartet {'wert': 'Neuer Wert'} im Body.
        Validiert den Wert basierend auf dem Typ des Feldes.
        """
        eingabefeld = self.get_object()
        
        # Explizite Berechtigungsprüfung für 'change'
        if not request.user.has_perm('api.change_eingabefeld'):
             return Response(
                {"detail": "Sie haben keine Berechtigung, dieses Eingabefeld zu bearbeiten."},
                status=status.HTTP_403_FORBIDDEN
            )

        if 'wert' not in request.data:
            return Response(
                {"detail": "Das Feld 'wert' ist erforderlich."},
                status=status.HTTP_400_BAD_REQUEST
            )

        wert = request.data.get('wert')
        
        # Validierung basierend auf Typ
        if wert is not None and str(wert).strip():
            if eingabefeld.typ == 'Zahl':
                try:
                    float(wert)
                except ValueError:
                    return Response(
                        {"detail": "Der Wert muss eine Zahl sein."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            elif eingabefeld.typ == 'Datum':
                # Versuche verschiedene Datumsformate
                valid_date = False
                for fmt in ('%Y-%m-%d', '%d.%m.%Y'):
                    try:
                        datetime.strptime(str(wert), fmt)
                        valid_date = True
                        break
                    except ValueError:
                        continue
                
                if not valid_date:
                    return Response(
                        {"detail": "Der Wert muss ein gültiges Datum sein (YYYY-MM-DD oder DD.MM.YYYY)."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

        # Wert speichern
        eingabefeld.wert = str(wert) if wert is not None else ""
        eingabefeld.save()
        
        serializer = self.get_serializer(eingabefeld)
        return Response(serializer.data, status=status.HTTP_200_OK)


    @extend_schema(
        responses={200: OpenApiTypes.OBJECT},
        description="Liest den Wert des Eingabefeldes typgerecht aus."
    )
    @action(detail=True, methods=['get'], url_path='get-value')
    def get_value(self, request, pk=None):
        """
        Gibt den Wert des Eingabefeldes zurück, konvertiert in den entsprechenden Datentyp.
        Rückgabeformat: {'wert': <konvertierter_wert>, 'typ': <typ>}
        """
        eingabefeld = self.get_object()
        
        # Berechtigungsprüfung erfolgt implizit durch DjangoModelPermissionsWithView für GET (view_eingabefeld)
        
        raw_value = eingabefeld.wert
        converted_value = raw_value
        
        if raw_value and str(raw_value).strip():
            if eingabefeld.typ == 'Zahl':
                try:
                    # Versuche erst int, dann float
                    if '.' in raw_value or ',' in raw_value:
                        converted_value = float(raw_value.replace(',', '.'))
                    else:
                        converted_value = int(raw_value)
                except ValueError:
                    # Fallback auf String, falls Parsing fehlschlägt (sollte nicht passieren)
                    converted_value = raw_value
            elif eingabefeld.typ == 'Datum':
                # Datum wird als String zurückgegeben, aber Frontend erwartet ISO
                # Hier könnten wir es parsen und als echtes Date-Objekt zurückgeben,
                # aber JSON serialisiert es eh wieder zu String.
                # Wir lassen es als String, da es bereits validiert wurde.
                converted_value = raw_value
        else:
            converted_value = None

        return Response({
            'wert': converted_value,
            'typ': eingabefeld.typ
        }, status=status.HTTP_200_OK)

    @extend_schema(
        request=OpenApiTypes.OBJECT,
        responses={200: OpenApiTypes.OBJECT},
        description="Aktualisiert die Sortierung der Felder."
    )
    @action(detail=False, methods=['post'], url_path='reorder')
    def reorder(self, request):
        """
        Erwartet eine Liste von Objekten: [{'id': 1, 'sort_order': 0}, ...]
        """
        # Explizite Berechtigungsprüfung für 'change'
        if not request.user.has_perm('api.change_eingabefeld'):
             return Response(
                {"detail": "Sie haben keine Berechtigung, Eingabefelder zu bearbeiten."},
                status=status.HTTP_403_FORBIDDEN
            )

        data = request.data
        if not isinstance(data, list):
            return Response(
                {"detail": "Erwartet eine Liste von Objekten."},
                status=status.HTTP_400_BAD_REQUEST
            )

        for item in data:
            feld_id = item.get('id')
            sort_order = item.get('sort_order')
            
            if feld_id is not None and sort_order is not None:
                try:
                    feld = Eingabefeld.objects.get(pk=feld_id)
                    feld.sort_order = sort_order
                    feld.save()
                except Eingabefeld.DoesNotExist:
                    continue
        
        return Response({"status": "success"}, status=status.HTTP_200_OK)
