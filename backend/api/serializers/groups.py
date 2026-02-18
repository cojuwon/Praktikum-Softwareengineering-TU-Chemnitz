from rest_framework import serializers
from django.contrib.auth.models import Group, Permission

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ('id', 'name', 'codename', 'content_type')

class GroupSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        write_only=True, 
        queryset=Permission.objects.all(), 
        source='permissions'
    )

    class Meta:
        model = Group
        fields = ('id', 'name', 'permissions', 'permission_ids')
