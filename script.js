document.addEventListener("DOMContentLoaded", () => {
  const slices = [
    {label: "Blue", size: 350, color: "blue"},
    {label: "Yellow", size: 250, color: "yellow"},
    {label: "Green", size: 250, color: "green"},
    {label: "Orange", size: 150, color: "orange"},
  ];

  const canvas = document.getElementById("pie-chart");
  const ctx = canvas.getContext("2d");
  const legend = document.getElementById("pie-chart-legend");
  const tooltip = document.getElementById("tooltip");

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) - 10;

  let hoveredSlice = null;

  function drawPieChart() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const total = slices.reduce((acc, slice) => acc + slice.size, 0);
    let startAngle = 0;

    slices.forEach(slice => {
      const angle = (slice.size / total) * 2 * Math.PI;
      const midAngle = startAngle + angle / 2;


      const offset = (slice === hoveredSlice) ? 15 : 0;
      const offsetX = Math.cos(midAngle) * offset;
      const offsetY = Math.sin(midAngle) * offset;

      ctx.beginPath();
      ctx.moveTo(centerX + offsetX, centerY + offsetY);
      ctx.arc(centerX + offsetX, centerY + offsetY, radius, startAngle, startAngle + angle);
      ctx.closePath();

      ctx.fillStyle = slice.color;
      ctx.fill();

      slice.startAngle = startAngle;
      slice.endAngle = startAngle + angle;

      startAngle += angle;
    });

    updateLegend();
  }

  function updateLegend() {
    const total = slices.reduce((acc, slice) => acc + slice.size, 0);

    legend.innerHTML = slices.map(slice => {
      const percent = total ? ((slice.size / total) * 100).toFixed(2) : 0;
      return `
        <li class="legend-item">
          <div class="legend-color" style="background-color:${slice.color}"></div>
          <div>${slice.label}: $${slice.size} (${percent}%)</div>
        </li>
      `;
    }).join('');
  }

  function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  }

  function isPointInSlice(x, y, slice) {
    const dx = x - centerX;
    const dy = y - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius) return false;

    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += 2 * Math.PI;

    return angle >= slice.startAngle && angle <= slice.endAngle;
  }

  canvas.addEventListener("mousemove", evt => {
    const pos = getMousePos(evt);
    const newHovered = slices.find(slice => isPointInSlice(pos.x, pos.y, slice));

    if (newHovered !== hoveredSlice) {
      hoveredSlice = newHovered;
      drawPieChart();
    }

    if (hoveredSlice) {
      tooltip.style.display = "block";
      tooltip.textContent = `${hoveredSlice.label}: $${hoveredSlice.size}`;
      tooltip.style.left = (evt.pageX + 10) + "px";
      tooltip.style.top = (evt.pageY + 10) + "px";
    } else {
      tooltip.style.display = "none";
    }
  });

  canvas.addEventListener("mouseout", () => {
    hoveredSlice = null;
    drawPieChart();
    tooltip.style.display = "none";
  });

  drawPieChart();
});
