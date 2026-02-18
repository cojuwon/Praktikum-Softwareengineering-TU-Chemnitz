from rest_framework import viewsets, permissions, filters
from api.models import FallNotiz
from api.serializers import FallNotizSerializer

class FallNotizViewSet(viewsets.ModelViewSet):
    """
    ViewSet für Fall-Notizen.
    """
    queryset = FallNotiz.objects.all()
    serializer_class = FallNotizSerializer
    permission_classes = [permissions.IsAuthenticated] # Erweitern mit spezifischen Permissions

    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        """
        Filtert Notizen nach Fall, falls 'fall_id' im Query-Parameter ist.
        """
        queryset = super().get_queryset()
        fall_id = self.request.query_params.get('fall', None)
        if fall_id is not None:
            queryset = queryset.filter(fall_id=fall_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(autor=self.request.user)
