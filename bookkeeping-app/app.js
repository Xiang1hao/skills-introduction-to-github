const STORAGE_KEY = "bookkeeping_records_v1";

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

let records = loadRecords();

dateInput.value = new Date().toISOString().slice(0, 10);
render();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const record = {
    id: crypto.randomUUID(),
    type: typeInput.value,
    amount: Number(amountInput.value),
    category: categoryInput.value.trim(),
    date: dateInput.value,
    note: noteInput.value.trim(),
  };

  if (!record.category || !record.date || record.amount <= 0) {
    return;
  }

  records.unshift(record);
  persist();
  render();
  form.reset();
  typeInput.value = "expense";
  dateInput.value = new Date().toISOString().slice(0, 10);
});

clearAllBtn.addEventListener("click", () => {
  if (!records.length) {
    return;
  }
  const ok = window.confirm("确定要清空全部记录吗？");
  if (!ok) {
    return;
  }
  records = [];
  persist();
  render();
});

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
  }).format(amount);
}

function render() {
  const income = records
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);
  const expense = records
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

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
    button.addEventListener("click", () => {
      records = records.filter((item) => item.id !== button.dataset.id);
      persist();
      render();
    });
  }
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
