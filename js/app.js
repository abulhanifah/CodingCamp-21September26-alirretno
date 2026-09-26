/**
 * Expense & Budget Visualizer
 * Vanilla JS · LocalStorage · No dependencies
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY_EXPENSES = 'ebv_expenses';
const STORAGE_KEY_BUDGET   = 'ebv_budget';

const CATEGORY_ICONS = {
  Food:          '🍔',
  Transport:     '🚗',
  Housing:       '🏠',
  Health:        '💊',
  Entertainment: '🎬',
  Shopping:      '🛍️',
  Utilities:     '⚡',
  Other:         '📦',
};

const CHART_COLORS = [
  '#4f6ef7', '#ef4444', '#22c55e', '#f59e0b',
  '#a855f7', '#06b6d4', '#f97316', '#64748b',
];

// ─── State ────────────────────────────────────────────────────────────────────

let expenses = [];
let budget   = 0;
let pendingDeleteId = null;
let toastTimer = null;

// ─── LocalStorage Helpers ─────────────────────────────────────────────────────

function saveExpenses() {
  localStorage.setItem(STORAGE_KEY_EXPENSES, JSON.stringify(expenses));
}

function saveBudget() {
  localStorage.setItem(STORAGE_KEY_BUDGET, JSON.stringify(budget));
}

function loadData() {
  try {
    const rawExpenses = localStorage.getItem(STORAGE_KEY_EXPENSES);
    const rawBudget   = localStorage.getItem(STORAGE_KEY_BUDGET);
    expenses = rawExpenses ? JSON.parse(rawExpenses) : [];
    budget   = rawBudget   ? parseFloat(JSON.parse(rawBudget)) : 0;
  } catch {
    expenses = [];
    budget   = 0;
  }
}

// ─── DOM References ──────────────────────────────────────────────────────────

const inputBudget       = document.getElementById('input-budget');
const btnSetBudget      = document.getElementById('btn-set-budget');
const labelSpent        = document.getElementById('label-spent');
const labelBudget       = document.getElementById('label-budget');
const progressBar       = document.getElementById('progress-bar');
const progressStatus    = document.getElementById('progress-status');

const sumBudget         = document.getElementById('sum-budget');
const sumSpent          = document.getElementById('sum-spent');
const sumRemaining      = document.getElementById('sum-remaining');
const sumCount          = document.getElementById('sum-count');

const formExpense       = document.getElementById('form-expense');
const inputDesc         = document.getElementById('input-desc');
const inputAmount       = document.getElementById('input-amount');
const inputCategory     = document.getElementById('input-category');
const inputDate         = document.getElementById('input-date');
const formError         = document.getElementById('form-error');

const expenseList       = document.getElementById('expense-list');
const filterCategory    = document.getElementById('filter-category');
const sortExpenses      = document.getElementById('sort-expenses');

const canvasDonut       = document.getElementById('chart-donut');
const chartLegend       = document.getElementById('chart-legend');
const chartEmpty        = document.getElementById('chart-empty');
const canvasBar         = document.getElementById('chart-bar');
const barEmpty          = document.getElementById('bar-empty');

const modalOverlay      = document.getElementById('modal-overlay');
const modalCancel       = document.getElementById('modal-cancel');
const modalConfirm      = document.getElementById('modal-confirm');
const btnReset          = document.getElementById('btn-reset');
const toast             = document.getElementById('toast');

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatCurrency(amount) {
  return 'Rp ' + Number(amount).toLocaleString('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function totalSpent() {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

// ─── Toast Notifications ──────────────────────────────────────────────────────

function showToast(message, type = 'info') {
  toast.textContent = message;
  toast.className   = `toast ${type}`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.className = 'toast hidden';
  }, 3000);
}

// ─── Budget ───────────────────────────────────────────────────────────────────

function setBudget() {
  const val = parseFloat(inputBudget.value);
  if (isNaN(val) || val < 0) {
    showToast('Please enter a valid budget amount.', 'error');
    return;
  }
  budget = val;
  saveBudget();
  inputBudget.value = '';
  updateAll();
  showToast(`Budget set to ${formatCurrency(budget)}`, 'success');
}

// ─── Expenses CRUD ────────────────────────────────────────────────────────────

function addExpense(e) {
  e.preventDefault();
  formError.textContent = '';

  const desc   = inputDesc.value.trim();
  const amount = parseFloat(inputAmount.value);
  const cat    = inputCategory.value;
  const date   = inputDate.value;

  if (!desc) {
    formError.textContent = 'Description is required.';
    inputDesc.focus();
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    formError.textContent = 'Please enter a valid amount greater than 0.';
    inputAmount.focus();
    return;
  }
  if (!date) {
    formError.textContent = 'Please select a date.';
    inputDate.focus();
    return;
  }

  const expense = {
    id: generateId(),
    desc,
    amount,
    category: cat,
    date,
  };

  expenses.unshift(expense);
  saveExpenses();
  formExpense.reset();
  setDefaultDate();
  updateAll();
  showToast('Expense added!', 'success');
}

function deleteExpense(id) {
  expenses = expenses.filter(e => e.id !== id);
  saveExpenses();
  updateAll();
  showToast('Expense deleted.', 'info');
}

function confirmDelete(id) {
  const expense = expenses.find(e => e.id === id);
  if (!expense) return;
  pendingDeleteId = id;
  document.getElementById('modal-message').textContent =
    `Delete "${expense.desc}" (${formatCurrency(expense.amount)})?`;
  modalOverlay.classList.remove('hidden');
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function closeModal() {
  modalOverlay.classList.add('hidden');
  pendingDeleteId = null;
}

// ─── Summary & Progress ───────────────────────────────────────────────────────

function updateSummary() {
  const spent     = totalSpent();
  const remaining = budget - spent;
  const pct       = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  sumBudget.textContent    = formatCurrency(budget);
  sumSpent.textContent     = formatCurrency(spent);
  sumRemaining.textContent = formatCurrency(remaining);
  sumCount.textContent     = expenses.length;

  // Color remaining
  sumRemaining.style.color = remaining < 0
    ? 'var(--color-danger)'
    : remaining === 0
      ? 'var(--color-warning)'
      : 'var(--color-success)';

  // Progress bar
  labelSpent.textContent  = `Terpakai: ${formatCurrency(spent)}`;
  labelBudget.textContent = `Anggaran: ${formatCurrency(budget)}`;
  progressBar.style.width = pct + '%';

  progressBar.className = 'progress-bar-fill';
  if (pct >= 100) {
    progressBar.classList.add('danger');
  } else if (pct >= 80) {
    progressBar.classList.add('warning');
  }

  if (budget > 0) {
    if (spent > budget) {
      const over = spent - budget;
      progressStatus.textContent = `⚠️ Melebihi anggaran sebesar ${formatCurrency(over)}`;
      progressStatus.className   = 'progress-status over';
    } else if (pct >= 80) {
      progressStatus.textContent = `Sudah menggunakan ${pct.toFixed(0)}% dari anggaran.`;
      progressStatus.className   = 'progress-status';
    } else {
      progressStatus.textContent = `${formatCurrency(budget - spent)} tersisa (${(100 - pct).toFixed(0)}% lagi)`;
      progressStatus.className   = 'progress-status';
    }
  } else {
    progressStatus.textContent = 'Atur anggaran untuk mulai memantau pengeluaran.';
    progressStatus.className   = 'progress-status';
  }
}

// ─── Expense List Rendering ──────────────────────────────────────────────────

function getFilteredSorted() {
  const catFilter = filterCategory.value;
  const sortVal   = sortExpenses.value;

  let list = catFilter === 'all'
    ? [...expenses]
    : expenses.filter(e => e.category === catFilter);

  switch (sortVal) {
    case 'date-desc':
      list.sort((a, b) => b.date.localeCompare(a.date));
      break;
    case 'date-asc':
      list.sort((a, b) => a.date.localeCompare(b.date));
      break;
    case 'amount-desc':
      list.sort((a, b) => b.amount - a.amount);
      break;
    case 'amount-asc':
      list.sort((a, b) => a.amount - b.amount);
      break;
  }

  return list;
}

function renderExpenseList() {
  const list = getFilteredSorted();

  if (list.length === 0) {
    expenseList.innerHTML = `<p class="empty-state">${
      expenses.length === 0
        ? 'No expenses yet. Add one above!'
        : 'No expenses match the current filter.'
    }</p>`;
    return;
  }

  expenseList.innerHTML = list.map(expense => {
    const icon = CATEGORY_ICONS[expense.category] || '📦';
    const date = new Date(expense.date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
    return `
      <div class="expense-item" data-id="${expense.id}">
        <div class="expense-cat-icon cat-${expense.category}" aria-hidden="true">${icon}</div>
        <div class="expense-info">
          <p class="expense-desc" title="${escapeHtml(expense.desc)}">${escapeHtml(expense.desc)}</p>
          <p class="expense-meta">${expense.category} · ${date}</p>
        </div>
        <span class="expense-amount">${formatCurrency(expense.amount)}</span>
        <button
          class="btn-icon expense-delete"
          aria-label="Delete expense ${escapeHtml(expense.desc)}"
          data-id="${expense.id}"
          title="Delete"
        >🗑️</button>
      </div>
    `;
  }).join('');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function drawDonut() {
  const ctx = canvasDonut.getContext('2d');
  const W   = canvasDonut.width;
  const H   = canvasDonut.height;
  ctx.clearRect(0, 0, W, H);

  // Aggregate by category
  const totals = {};
  expenses.forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + e.amount;
  });
  const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  const grand   = entries.reduce((s, [, v]) => s + v, 0);

  if (entries.length === 0) {
    chartEmpty.style.display = 'block';
    canvasDonut.style.display = 'none';
    chartLegend.innerHTML = '';
    return;
  }
  chartEmpty.style.display  = 'none';
  canvasDonut.style.display = 'block';

  const cx      = W / 2;
  const cy      = H / 2;
  const outerR  = Math.min(W, H) / 2 - 8;
  const innerR  = outerR * 0.55;
  let   angle   = -Math.PI / 2;

  entries.forEach(([cat, val], i) => {
    const slice = (val / grand) * Math.PI * 2;
    const color = CHART_COLORS[i % CHART_COLORS.length];

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outerR, angle, angle + slice);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Thin gap
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, angle, angle + slice);
    ctx.arc(cx, cy, outerR - 1, angle + slice, angle, true);
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();

    angle += slice;
  });

  // Inner circle (donut hole)
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();

  // Center text
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = '#1e2330';
  ctx.font         = 'bold 14px Segoe UI, system-ui, sans-serif';
  ctx.fillText(formatCurrency(grand), cx, cy);

  // Legend
  chartLegend.innerHTML = entries.map(([cat, val], i) => {
    const pct   = grand > 0 ? ((val / grand) * 100).toFixed(0) : 0;
    const color = CHART_COLORS[i % CHART_COLORS.length];
    const icon  = CATEGORY_ICONS[cat] || '📦';
    return `
      <div class="legend-item">
        <span class="legend-dot" style="background:${color}"></span>
        <span>${icon} ${cat}</span>
        <span class="legend-pct">${pct}%</span>
      </div>
    `;
  }).join('');
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function drawBar() {
  // Collect last 14 days with data
  const dailyMap = {};
  expenses.forEach(e => {
    dailyMap[e.date] = (dailyMap[e.date] || 0) + e.amount;
  });

  const sortedDates = Object.keys(dailyMap).sort().slice(-14);

  if (sortedDates.length === 0) {
    barEmpty.style.display   = 'block';
    canvasBar.style.display  = 'none';
    return;
  }
  barEmpty.style.display  = 'none';
  canvasBar.style.display = 'block';

  const container = canvasBar.parentElement;
  const W = container.clientWidth || 400;
  const H = 220;

  canvasBar.width  = W;
  canvasBar.height = H;

  const ctx     = canvasBar.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  const padL  = 56;
  const padR  = 16;
  const padT  = 16;
  const padB  = 42;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const values  = sortedDates.map(d => dailyMap[d]);
  const maxVal  = Math.max(...values);
  const barW    = Math.max(8, Math.floor((chartW / sortedDates.length) * 0.6));
  const gap     = chartW / sortedDates.length;

  // Grid lines
  const gridLines = 4;
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth   = 1;
  for (let i = 0; i <= gridLines; i++) {
    const y = padT + chartH - (i / gridLines) * chartH;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + chartW, y);
    ctx.stroke();

    // Y-axis label
    const labelVal = (maxVal / gridLines) * i;
    ctx.fillStyle    = '#9ca3af';
    ctx.font         = '11px Segoe UI, system-ui, sans-serif';
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      labelVal >= 1000 ? 'Rp ' + (labelVal / 1000).toFixed(1) + 'k' : 'Rp ' + labelVal.toFixed(0),
      padL - 6,
      y
    );
  }

  // Bars
  sortedDates.forEach((date, i) => {
    const val    = dailyMap[date];
    const barH   = maxVal > 0 ? (val / maxVal) * chartH : 0;
    const x      = padL + i * gap + (gap - barW) / 2;
    const y      = padT + chartH - barH;

    // Bar with rounded top
    ctx.fillStyle = '#4f6ef7';
    roundRect(ctx, x, y, barW, barH, 4);
    ctx.fill();

    // X-axis label
    const d   = new Date(date + 'T00:00:00');
    const lbl = (d.getMonth() + 1) + '/' + d.getDate();
    ctx.fillStyle    = '#6b7280';
    ctx.font         = '10px Segoe UI, system-ui, sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(lbl, x + barW / 2, padT + chartH + 6);

    // Value label on bar
    if (barH > 18) {
      ctx.fillStyle    = '#fff';
      ctx.font         = 'bold 10px Segoe UI, system-ui, sans-serif';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('Rp ' + Number(val).toLocaleString('id-ID'), x + barW / 2, y + barH - 4);
    }
  });
}

/** Draw a rectangle with only the top corners rounded */
function roundRect(ctx, x, y, w, h, r) {
  if (h <= 0) return;
  r = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── Master Update ────────────────────────────────────────────────────────────

function updateAll() {
  updateSummary();
  renderExpenseList();
  drawDonut();
  drawBar();
}

// ─── Default Date ─────────────────────────────────────────────────────────────

function setDefaultDate() {
  // Set date input to today in YYYY-MM-DD
  const today = new Date();
  const yyyy  = today.getFullYear();
  const mm    = String(today.getMonth() + 1).padStart(2, '0');
  const dd    = String(today.getDate()).padStart(2, '0');
  inputDate.value = `${yyyy}-${mm}-${dd}`;
}

// ─── Reset ────────────────────────────────────────────────────────────────────

function resetAll() {
  expenses = [];
  budget   = 0;
  saveExpenses();
  saveBudget();
  updateAll();
  closeModal();
  showToast('All data cleared.', 'info');
}

// ─── Event Listeners ──────────────────────────────────────────────────────────

btnSetBudget.addEventListener('click', setBudget);

inputBudget.addEventListener('keydown', e => {
  if (e.key === 'Enter') setBudget();
});

formExpense.addEventListener('submit', addExpense);

filterCategory.addEventListener('change', renderExpenseList);
sortExpenses.addEventListener('change', renderExpenseList);

// Delegate delete clicks
expenseList.addEventListener('click', e => {
  const btn = e.target.closest('.expense-delete');
  if (btn) confirmDelete(btn.dataset.id);
});

// Modal buttons
modalCancel.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});
modalConfirm.addEventListener('click', () => {
  if (pendingDeleteId) {
    deleteExpense(pendingDeleteId);
  }
  closeModal();
});

// Reset — reuse modal for confirmation
btnReset.addEventListener('click', () => {
  pendingDeleteId = null;
  document.getElementById('modal-title').textContent   = 'Reset All Data';
  document.getElementById('modal-message').textContent = 'This will delete all expenses and reset your budget. This cannot be undone.';
  modalConfirm.textContent = 'Reset';

  // Override confirm handler temporarily
  modalConfirm.onclick = () => {
    resetAll();
    modalConfirm.textContent = 'Delete';
    document.getElementById('modal-title').textContent = 'Confirm Delete';
    modalConfirm.onclick = null;
  };

  modalOverlay.classList.remove('hidden');
});

// Resize charts on window resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    drawDonut();
    drawBar();
  }, 120);
});

// ─── Init ─────────────────────────────────────────────────────────────────────

function init() {
  loadData();
  setDefaultDate();
  updateAll();
}

init();
