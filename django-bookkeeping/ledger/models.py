from django.db import models


class Record(models.Model):
    class Type(models.TextChoices):
        EXPENSE = "expense", "支出"
        INCOME = "income", "收入"

    record_type = models.CharField(max_length=20, choices=Type.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=100)
    date = models.DateField()
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-id"]

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.record_type,
            "amount": float(self.amount),
            "category": self.category,
            "date": self.date.isoformat(),
            "note": self.note,
        }
