const form = document.getElementById("record-form");
const typeInput = document.getElementById("type");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");
const noteInput = document.getElementById("note");
const recordList = document.getElementById("record-list");
const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");
const clearAllBtn = document.getElementById("clear-all");

dateInput.value = new Date().toISOString().slice(0, 10);
let records = [];
bootstrap();

async function bootstrap() {
  await loadRecords();
  bindEvents();
}

function bindEvents() {
  form.addEventListener("submit", addRecord);
  clearAllBtn.addEventListener("click", clearRecords);
}

async function loadRecords() {
  const response = await fetch("/api/records/");
  const data = await response.json();
  records = data.records || [];
  render();
}

async function addRecord(event) {
  event.preventDefault();
  const payload = {
    type: typeInput.value,
    amount: Number(amountInput.value),
    category: categoryInput.value.trim(),
    date: dateInput.value,
    note: noteInput.value.trim(),
  };

  const response = await fetch("/api/records/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCsrfToken(),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    window.alert("添加失败，请检查输入。")
    return;
  }

  form.reset();
  typeInput.value = "expense";
  dateInput.value = new Date().toISOString().slice(0, 10);
  await loadRecords();
}

async function clearRecords() {
  if (!records.length) return;
  if (!window.confirm("确定要清空全部记录吗？")) return;

  const response = await fetch("/api/records/clear/", {
    method: "DELETE",
    headers: { "X-CSRFToken": getCsrfToken() },
  });

  if (response.ok) {
    records = [];
    render();
  }
}

function render() {
  const income = records
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + Number(item.amount), 0);
  const expense = records
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  totalIncomeEl.textContent = formatCurrency(income);
  totalExpenseEl.textContent = formatCurrency(expense);
  balanceEl.textContent = formatCurrency(income - expense);

  if (!records.length) {
    recordList.innerHTML = "<li class='record-meta'>暂无记录，快添加第一笔吧！</li>";
    return;
  }

  recordList.innerHTML = records
    .map(
      (item) => `
      <li class="record-item ${item.type}">
        <div>
          <div><strong>${escapeHtml(item.category)}</strong> · ${item.type === "income" ? "收入" : "支出"}</div>
          <div class="record-meta">${item.date}${item.note ? ` · ${escapeHtml(item.note)}` : ""}</div>
        </div>
        <div>
          <strong>${formatCurrency(item.amount)}</strong>
          <button class="delete-btn" data-id="${item.id}" type="button">删除</button>
        </div>
      </li>`
    )
    .join("");

  for (const button of recordList.querySelectorAll(".delete-btn")) {
    button.addEventListener("click", async () => {
      const response = await fetch(`/api/records/${button.dataset.id}/`, {
        method: "DELETE",
        headers: { "X-CSRFToken": getCsrfToken() },
      });
      if (response.ok) {
        await loadRecords();
      }
    });
  }
}

function getCsrfToken() {
  return document.querySelector("[name=csrfmiddlewaretoken]").value;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(amount);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
