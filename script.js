const form = document.getElementById('transactionForm');
const list = document.getElementById('list');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expenses');
const balanceEl = document.getElementById('balance');
const monthFilter = document.getElementById('monthFilter');
const emptyState = document.getElementById('emptyState');
const themeToggle = document.getElementById('themeToggle');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let selectedMonth = new Date().getMonth();
let chart;

// Months dropdown
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

months.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = m;
    if (i === selectedMonth) opt.selected = true;
    monthFilter.appendChild(opt);
});

// Theme
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
}

themeToggle.onclick = () => {
    document.body.classList.toggle('dark');
    localStorage.setItem(
        'theme',
        document.body.classList.contains('dark') ? 'dark' : 'light'
    );
};

// Add transaction
form.onsubmit = e => {
    e.preventDefault();

    transactions.push({
        id: Date.now(),
        title: title.value,
        amount: +amount.value,
        category: category.value,
        type: type.value,
        date: new Date()
    });

    save();
    form.reset();
};

monthFilter.onchange = e => {
    selectedMonth = +e.target.value;
    render();
};

function save() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    render();
}

function render() {
    list.innerHTML = '';

    const filtered = transactions.filter(
        t => new Date(t.date).getMonth() === selectedMonth
    );

    let income = 0;
    let expenses = 0;

    filtered.forEach(t => {
        const li = document.createElement('li');
        li.innerHTML = `
      <span>${t.title}</span>
      <span class="amount ${t.type}">
        ${t.type === 'income' ? '+' : '-'}$${t.amount}
      </span>
      <button onclick="deleteTx(${t.id})">🗑️</button>
    `;
        list.appendChild(li);

        t.type === 'income'
            ? income += t.amount
            : expenses += t.amount;
    });

    emptyState.classList.toggle('hidden', filtered.length !== 0);

    incomeEl.textContent = `$${income}`;
    expenseEl.textContent = `$${expenses}`;
    balanceEl.textContent = `$${income - expenses}`;

    renderChart(filtered);
}

function deleteTx(id) {
    transactions = transactions.filter(t => t.id !== id);
    save();
}

// Chart
function renderChart(data) {
    const expensesByCategory = {};

    data
        .filter(t => t.type === 'expense')
        .forEach(t => {
            expensesByCategory[t.category] =
                (expensesByCategory[t.category] || 0) + t.amount;
        });

    if (chart) chart.destroy();

    chart = new Chart(document.getElementById('chart'), {
        type: 'pie',
        data: {
            labels: Object.keys(expensesByCategory),
            datasets: [{
                data: Object.values(expensesByCategory),
                backgroundColor: ['#f87171', '#60a5fa', '#fbbf24', '#34d399', '#a78bfa']
            }]
        }
    });
}

render();
