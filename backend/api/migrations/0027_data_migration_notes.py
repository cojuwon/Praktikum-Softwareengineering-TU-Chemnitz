from django.db import migrations

def convert_text_to_json(apps, schema_editor):
    Beratungstermin = apps.get_model('api', 'Beratungstermin')
    for termin in Beratungstermin.objects.all():
        if termin.notizen_beratung_old:
            termin.notizen_beratung = {
                "type": "doc",
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {
                                "type": "text",
                                "text": termin.notizen_beratung_old
                            }
                        ]
                    }
                ]
            }
            termin.save()

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0026_beratungstermin_notizen_beratung_old_and_more'),
    ]

    operations = [
        migrations.RunPython(convert_text_to_json),
    ]
