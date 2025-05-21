// Quote goals by rep
const quoteGoals = {
  "Adrian Alviar": 100,
  "Annie Dwyer": 140,
  "Blaine Munro": 90,
  "Edwin Campos": 130,
  "Gavin Hayes": 80,
  "Heather Scherer": 160,
  "Jeff Stanek": 95,
  "Karin Castner": 85,
  "Kelly Hasman": 180,
  "Logan Arnwine": 100,
  "Mandy Shults": 90,
  "Mariah Guadian": 110,
  "Paige Hansel": 100
};

async function loadCSV(url) {
  const res = await fetch(url);
  const text = await res.text();
  const rows = text.trim().split("\n").map(row => row.split(","));
  const headers = rows[0];
  const data = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = isNaN(row[i]) || row[i] === "" ? row[i] : +row[i];
    });
    return obj;
  });
  return data;
}

async function drawBarChart() {
  const data = await loadCSV("data/april_may_summary.csv");

  const labels = data.map(d => d.Name);
  const aprilQuotes = data.map(d => d["Sensei Quotes_April"] || 0);
  const mayQuotes = data.map(d => d["Sensei Quotes_May"] || 0);

  const traceApril = {
    x: labels,
    y: aprilQuotes,
    name: 'April Quotes',
    type: 'bar',
    marker: { color: 'cornflowerblue' }
  };

  const traceMay = {
    x: labels,
    y: mayQuotes,
    name: 'May Quotes',
    type: 'bar',
    marker: { color: 'mediumseagreen' }
  };

  const layout = {
    barmode: 'group',
    title: 'April vs May Quotes by Rep',
    xaxis: { title: 'Rep' },
    yaxis: { title: 'Total Quotes', rangemode: 'tozero' },
    margin: { t: 50, b: 100 },
    plot_bgcolor: '#fff',
    paper_bgcolor: '#fff',
    legend: { orientation: 'h', y: -0.2 }
  };

  Plotly.newPlot('barChart', [traceApril, traceMay], layout, { responsive: true });
}

async function drawLineChart(rep, metric = "Quotes") {
  const data = await loadCSV("data/may_daily.csv");
  const filtered = data.filter(d => d.Name === rep);
  const dates = filtered.map(d => d.Date);
  const values = filtered.map(d => d[metric]);

  const goal = metric === "Quotes" ? (quoteGoals[rep] || 150) : null;
  const goalLine = goal ? {
    x: dates,
    y: Array(dates.length).fill(goal),
    type: "scatter",
    mode: "lines",
    name: `Goal (${goal})`,
    line: { dash: "dash", color: "red", width: 2 }
  } : null;

  const trace = {
    x: dates,
    y: values,
    mode: "lines+markers",
    type: "scatter",
    name: `${rep}'s ${metric}`,
    marker: { color: "teal" },
    line: { shape: "spline" },
    hovertemplate: `%{x}<br>${metric}: %{y}${goal ? `<br>Goal: ${goal}` : ''}<extra></extra>`
  };

  const layout = {
    title: `${rep} – Daily ${metric} in May`,
    xaxis: { title: "Date" },
    yaxis: { title: metric, rangemode: "tozero" },
    margin: { t: 50, b: 50 },
    plot_bgcolor: "#fff",
    paper_bgcolor: "#fff"
  };

  const traces = goalLine ? [trace, goalLine] : [trace];
  Plotly.newPlot("lineChart", traces, layout, { responsive: true });

  // Progress bar
  if (metric === "Quotes" && goal) {
    const total = values.reduce((sum, val) => sum + val, 0);
    const percent = Math.min(Math.round((total / goal) * 100), 100);

    document.getElementById("progressContainer").innerHTML = `
      <label class="form-label">${rep}'s Progress to ${goal} Quotes</label>
      <div class="progress">
        <div class="progress-bar bg-success" role="progressbar" style="width: ${percent}%">
          ${percent}%
        </div>
      </div>
    `;
  } else {
    document.getElementById("progressContainer").innerHTML = "";
  }
}

async function init() {
  await drawBarChart();

  const dailyData = await loadCSV("data/may_daily.csv");
  const reps = [...new Set(dailyData.map(d => d.Name))].sort();
  const repSelect = document.getElementById("repSelect");
  const metricSelect = document.getElementById("metricSelect");

  reps.forEach(rep => {
    const opt = document.createElement("option");
    opt.value = opt.textContent = rep;
    repSelect.appendChild(opt);
  });

  drawLineChart(reps[0], metricSelect.value);

  repSelect.addEventListener("change", () => {
    drawLineChart(repSelect.value, metricSelect.value);
  });

  metricSelect.addEventListener("change", () => {
    drawLineChart(repSelect.value, metricSelect.value);
  });
}

window.onload = init;
