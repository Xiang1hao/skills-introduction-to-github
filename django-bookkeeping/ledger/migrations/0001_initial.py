from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Record",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("record_type", models.CharField(choices=[("expense", "支出"), ("income", "收入")], max_length=20)),
                ("amount", models.DecimalField(decimal_places=2, max_digits=12)),
                ("category", models.CharField(max_length=100)),
                ("date", models.DateField()),
                ("note", models.CharField(blank=True, max_length=255)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"ordering": ["-date", "-id"]},
        )
    ]
