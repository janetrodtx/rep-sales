
async function loadCSV(url) {
    const res = await fetch(url);
    const text = await res.text();
    const rows = text.trim().split("\n").map(row => row.split(","));
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
        const obj = {};
        headers.forEach((h, i) => obj[h] = isNaN(row[i]) ? row[i] : +row[i]);
        return obj;
    });
    return data;
}

async function drawBarChart() {
    const data = await loadCSV("data/april_may_summary.csv");
    const labels = data.map(d => d.Name);
    const aprilQuotes = data.map(d => d["Sensei Quotes_April"] || 0);
    const mayQuotes = data.map(d => d["Sensei Quotes_May"] || 0);

    new Chart(document.getElementById("barChart").getContext("2d"), {
        type: "bar",
        data: {
            labels,
            datasets: [
                { label: "April Quotes", data: aprilQuotes, backgroundColor: "rgba(100,149,237,0.7)" },
                { label: "May Quotes", data: mayQuotes, backgroundColor: "rgba(60,179,113,0.7)" }
            ]
        },
        options: { responsive: true, plugins: { legend: { position: "top" } } }
    });
}

async function drawLineChart(rep) {
    const data = await loadCSV("data/may_daily.csv");
    const filtered = data.filter(d => d.Name === rep);
    const dates = filtered.map(d => d.Date);
    const quotes = filtered.map(d => d.Quotes);

    new Chart(document.getElementById("lineChart").getContext("2d"), {
        type: "line",
        data: {
            labels: dates,
            datasets: [{ label: `${rep}'s Daily Quotes`, data: quotes, borderColor: "teal", fill: false }]
        },
        options: { responsive: true }
    });
}

async function init() {
    await drawBarChart();
    const data = await loadCSV("data/may_daily.csv");
    const reps = [...new Set(data.map(d => d.Name))];
    const repSelect = document.getElementById("repSelect");
    reps.forEach(rep => {
        const opt = document.createElement("option");
        opt.value = opt.textContent = rep;
        repSelect.appendChild(opt);
    });
    repSelect.addEventListener("change", () => drawLineChart(repSelect.value));
    drawLineChart(reps[0]);
}

window.onload = init;
