import json
from decimal import Decimal, InvalidOperation

from django.http import HttpRequest, JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_GET, require_http_methods

from .models import Record


@require_GET
def index(request: HttpRequest):
    return render(request, "ledger/index.html")


@require_http_methods(["GET", "POST"])
def records_api(request: HttpRequest):
    if request.method == "GET":
        return JsonResponse({"records": [record.to_dict() for record in Record.objects.all()]})

    try:
        payload = json.loads(request.body)
        amount = Decimal(str(payload.get("amount", "0")))
    except (json.JSONDecodeError, InvalidOperation):
        return JsonResponse({"error": "无效请求"}, status=400)

    if amount <= 0:
        return JsonResponse({"error": "金额必须大于 0"}, status=400)

    if payload.get("type") not in (Record.Type.EXPENSE, Record.Type.INCOME):
        return JsonResponse({"error": "无效类型"}, status=400)

    if not payload.get("category") or not payload.get("date"):
        return JsonResponse({"error": "分类和日期必填"}, status=400)

    record = Record.objects.create(
        record_type=payload["type"],
        amount=amount,
        category=payload["category"].strip(),
        date=payload["date"],
        note=(payload.get("note") or "").strip(),
    )
    return JsonResponse(record.to_dict(), status=201)


@require_http_methods(["DELETE"])
def delete_record(request: HttpRequest, record_id: int):
    deleted, _ = Record.objects.filter(id=record_id).delete()
    if not deleted:
        return JsonResponse({"error": "记录不存在"}, status=404)
    return JsonResponse({"ok": True})


@require_http_methods(["DELETE"])
def clear_records(request: HttpRequest):
    Record.objects.all().delete()
    return JsonResponse({"ok": True})
