from django.contrib import admin

from .models import Record


@admin.register(Record)
class RecordAdmin(admin.ModelAdmin):
    list_display = ("id", "record_type", "amount", "category", "date", "created_at")
    list_filter = ("record_type", "date")
    search_fields = ("category", "note")
