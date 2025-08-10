document.addEventListener("DOMContentLoaded", () => {
  const balance = document.getElementById('balance');
  const moneyPlus = document.getElementById('moneyPlus');
  const moneyMinus = document.getElementById('moneyMinus');
  const list = document.getElementById('list');
  const form = document.getElementById('form');
  const text = document.getElementById('text');
  const amount = document.getElementById('amount');
  const myChartCanvas = document.querySelector('.my-chart'); 
  const detailsUl = document.querySelector('.details ul'); 
  const tooltip = document.getElementById('tooltip');

  let transactions = [];
  let myDoughnutChart = null; 


  function setCookie(name, value, days) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    let expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
  }

  function getCookie(name) {
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    let prefix = name + "=";
    for (let c of ca) {
      while (c.charAt(0) === ' ') c = c.substring(1);
      if (c.indexOf(prefix) === 0) {
        return c.substring(prefix.length);
      }
    }
    return "";
  }


  function updateDOM() {
    list.innerHTML = '';
    if (transactions.length === 0) {
      list.innerHTML = '<li>No Transaction</li>';
    } else {
      transactions.forEach(addTransactionToList);
    }
    updateValues();
    drawDoughnutChart();

    setCookie("transactions", JSON.stringify(transactions), 3650);
  }

  function addTransactionToList(transaction) {
    const sign = transaction.amount < 0 ? '-' : '+';
    const item = document.createElement('li');

    item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
    item.innerHTML = `
      ${transaction.text} <span>${sign}$${Math.abs(transaction.amount).toFixed(2)}</span>
      <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
    `;

    list.appendChild(item);
  }

  window.removeTransaction = function(id) {
    transactions = transactions.filter((transaction) => transaction.id !== id);
    updateDOM();
  };

  function updateValues() {
    const amounts = transactions.map((transaction) => transaction.amount);
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = amounts.filter((item) => item > 0).reduce((acc, item) => (acc += item), 0).toFixed(2);
    const expense = (amounts.filter((item) => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(2);

    balance.innerText = `$${total}`;
    moneyPlus.innerText = `$${income}`;
    moneyMinus.innerText = `$${expense}`;
  }

  function drawDoughnutChart() {
    if (myDoughnutChart) {
      myDoughnutChart.destroy();
    }

    const expenseCategories = transactions
      .filter((t) => t.amount < 0)
      .reduce((acc, t) => {
        const category = t.text;
        const amount = Math.abs(t.amount);
        if (acc[category]) {
          acc[category] += amount;
        } else {
          acc[category] = amount;
        }
        return acc;
      }, {});

    const labels = Object.keys(expenseCategories);
    const data = Object.values(expenseCategories);
    const colors = [
      '#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6', '#34495e', '#1abc9c', '#e67e22'
    ];

    const ctx = myChartCanvas.getContext('2d');

    if (data.length === 0) {
      myDoughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['No Expenses'],
          datasets: [{
            data: [1],
            backgroundColor: ['#bdc3c7'],
            hoverBackgroundColor: ['#bdc3c7']
          }]
        },
        options: {
          cutout: '70%',
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          }
        }
      });
     
      detailsUl.innerHTML = '<li><span class="legend-color" style="background-color:#bdc3c7;"></span> No Expenses</li>';
    } else {
      myDoughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              backgroundColor: colors.slice(0, labels.length),
            },
          ],
        },
        options: {
          cutout: '70%',
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: false,
              external: (context) => {
                let tooltipEl = tooltip;
                let dataPoint = context.tooltip.dataPoints[0];
                if (!dataPoint) {
                  tooltipEl.style.display = 'none';
                  return;
                }
          tooltipEl.innerHTML = `<strong>${dataPoint.label}</strong>: ${dataPoint.formattedValue}`;
          tooltipEl.style.display = 'block';
         tooltipEl.style.left = context.event.x + 10 + 'px';
         tooltipEl.style.top = context.event.y + 10 + 'px';
       },
     },
   },
 },
  });
      updateChartLegend(labels, colors, data);
    }
  }

function updateChartLegend(labels, colors, data) {
  detailsUl.innerHTML = '';
  const total = data.reduce((sum, val) => sum + val, 0);

 labels.forEach((label, index) => {
    const li = document.createElement('li');
    const percent = total > 0 ? ((data[index] / total) * 100).toFixed(1) : 0;
      li.innerHTML = `
        <span class="legend-color" style="background-color:${colors[index]};"></span>
        <span class="legend-label">${label}: $${data[index].toFixed(2)} (${percent}%)</span>
      `;
      detailsUl.appendChild(li);
    });
  }

  form.addEventListener('submit', addTransaction);

  function addTransaction(e) {
    e.preventDefault();

    if (text.value.trim() === '' || amount.value.trim() === '') {
      alert('Please add a description and amount');
      return;
    }

    const transaction = {
      id: generateID(),
      text: text.value,
      amount: +amount.value,
    };

    transactions.push(transaction);
    updateDOM();

    text.value = '';
    amount.value = '';
  }

  function generateID() {
    return Math.floor(Math.random() * 100000000);
  }

 
  let saved = getCookie("transactions");
  if (saved) {
    transactions = JSON.parse(saved);
  }

  updateDOM();
});
