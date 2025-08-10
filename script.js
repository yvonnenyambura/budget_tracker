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
function addListHeader() {
  const header = document.createElement('div');
  header.classList.add('list-header');
  header.innerHTML = `
    <div class="category-header">Category</div>
    <div class="amount-header">Amount</div>
    <div class="delete-header">Delete</div>
  `;
  list.parentNode.insertBefore(header, list);
}

addListHeader();


  let transactions = [];
  let myDoughnutChart = null; 

  const iconMap = {
  "rent": "fa-house",
  "groceries": "fa-basket-shopping",
  "shopping": "fa-bag-shopping",
  "salary": "fa-money-bill-wave",
  "transport": "fa-bus",
  "entertainment": "fa-film",
  "utilities": "fa-lightbulb",
};


const iconColorMap = {
  "rent": "#e74c3c",           
  "groceries": "#27ae60",      
  "shopping": "#f39c12",       
  "salary": "#2980b9",         
  "transport": "#8e44ad",      
  "entertainment": "#d35400",  
  "utilities": "#16a085",   
};




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

  const key = transaction.text.toLowerCase();
  const iconClass = iconMap[key] || 'fa-question-circle';
  const iconColor = iconColorMap[key] || '#000000';

  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

  item.innerHTML = `
    <div class="category" style="display:flex; align-items:center; flex:1;">
      <i class="fa-solid ${iconClass}" style="color: ${iconColor}; margin-right: 5px;"></i>
      ${transaction.text}
    </div>
    <div class="amount" style="flex:1; text-align:right;">
      ${sign}Ksh ${Math.abs(transaction.amount).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </div>
    <div class="delete" style="flex:0.5; text-align:center;">
      <button class="delete-btn" onclick="removeTransaction(${transaction.id})">
        <i class="fa-solid fa-trash" style="color: red;"></i>
      </button>
    </div>
  `;

  list.appendChild(item);
}

  window.removeTransaction = function(id) {
    transactions = transactions.filter((transaction) => transaction.id !== id);
    updateDOM();
  };

  function updateValues() {
    const amounts = transactions.map((transaction) => transaction.amount);
    const total = amounts.reduce((acc, item) => acc + item, 0);
    const income = amounts.filter((item) => item > 0).reduce((acc, item) => acc + item, 0);
    const expense = amounts.filter((item) => item < 0).reduce((acc, item) => acc + item, 0) * -1;

    balance.innerText = `Ksh ${total.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    moneyPlus.innerText = `Ksh ${income.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    moneyMinus.innerText = `Ksh ${expense.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
<span class="legend-label">${label}: Ksh ${data[index].toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${percent}%)</span>

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
      amount: parseFloat(amount.value),
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
