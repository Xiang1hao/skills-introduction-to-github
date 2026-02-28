from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("api/records/", views.records_api, name="records_api"),
    path("api/records/<int:record_id>/", views.delete_record, name="delete_record"),
    path("api/records/clear/", views.clear_records, name="clear_records"),
]
