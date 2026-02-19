from rest_framework import serializers
from django.utils.text import slugify
from api.models import Eingabefeld

class EingabefeldSerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Eingabefeld
        fields = '__all__'

    def validate(self, data):
        # Auto-generate name if not provided
        if not data.get('name'):
            if not data.get('label'):
                raise serializers.ValidationError({"name": "Name oder Label muss angegeben werden."})
            
            base_name = slugify(data['label']).replace('-', '_')
            if not base_name:
                base_name = 'field'
            
            # Context for uniqueness check
            context = data.get('context', self.instance.context if self.instance else 'anfrage')
            
            # Generate unique name
            name = base_name
            counter = 1
            
            # Check for duplicates (excluding self if updating)
            qs = Eingabefeld.objects.filter(context=context, name=name)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
                
            while qs.exists():
                name = f"{base_name}_{counter}"
                qs = Eingabefeld.objects.filter(context=context, name=name)
                if self.instance:
                    qs = qs.exclude(pk=self.instance.pk)
                counter += 1
            
            data['name'] = name
            
        return data
