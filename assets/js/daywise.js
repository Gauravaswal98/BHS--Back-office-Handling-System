/* --------------------------------------------
   Advisor chart
-------------------------------------------- */
const dw_advisorSelect = document.getElementById("dw_advisorSelect");
const dw_yearSelect = document.getElementById("dw_yearSelect");
const dw_monthSelect = document.getElementById("dw_monthSelect");
const dw_slotSelect = document.getElementById("dw_slotSelect");
const dw_advisorTitle = document.getElementById("dw_advisorTitle");
const dw_noData = document.getElementById("dw_noData");
const dw_chartEl = document.getElementById("dw_chart");

let dw_chart;

/* --------------------------------------------
   HELPERS
-------------------------------------------- */
function convertToReadable(d) {
    const [dd, mm, yyyy] = d.split("-");
    const m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return `${parseInt(dd)} ${m[parseInt(mm)-1]} ${yyyy}`;
}

function getMonthDays(year, month) {
    return new Date(year, month, 0).getDate();
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* --------------------------------------------
   DATE RANGE GENERATOR
-------------------------------------------- */
function generateDateRange(start, end) {
    const dates = [];
    let current = new Date(start);

    while (current <= end) {
        const dd = String(current.getDate()).padStart(2, "0");
        const mm = String(current.getMonth() + 1).padStart(2, "0");
        const yyyy = current.getFullYear();
        dates.push(`${dd}-${mm}-${yyyy}`);
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

/* --------------------------------------------
   ADVISOR DATA GENERATOR
-------------------------------------------- */
function generateAdvisorData() {
    const dates = generateDateRange(
        new Date("2025-11-01"),
        new Date("2026-02-28")
    );

    return dates.map(d => ({
        date: d,
        pending: random(2, 6),
        inprogress: random(2, 6),
        complete: random(8, 18)
    }));
}

/* --------------------------------------------
   FINAL DATA
-------------------------------------------- */
const dayWiseData = {
    "Advisor 1": generateAdvisorData(),
    "Advisor 2": generateAdvisorData(),
    "Advisor 3": generateAdvisorData()
};

/* --------------------------------------------
   POPULATE ADVISORS
-------------------------------------------- */
Object.keys(dayWiseData).forEach(a => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a;
    dw_advisorSelect.appendChild(opt);
});

/* --------------------------------------------
   POPULATE YEARS
-------------------------------------------- */
function populateYears() {
    dw_yearSelect.innerHTML = '<option disabled selected>Year</option>';
    for (let y = 1900; y <= 2100; y++) {
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;
        dw_yearSelect.appendChild(opt);
    }
}

/* --------------------------------------------
   POPULATE MONTHS
-------------------------------------------- */
function populateMonths() {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    dw_monthSelect.innerHTML = '<option disabled selected>Month</option>';

    months.forEach((m, i) => {
        const opt = document.createElement("option");
        opt.value = String(i + 1).padStart(2, "0");
        opt.textContent = m;
        dw_monthSelect.appendChild(opt);
    });
}

/* --------------------------------------------
   MONTH → DAY SLOTS
-------------------------------------------- */
dw_monthSelect.addEventListener("change", function () {

    dw_slotSelect.innerHTML = '<option disabled selected>Day Slot</option>';

    const year = dw_yearSelect.value;
    const month = this.value;
    if (!year) return;

    const totalDays = getMonthDays(year, month);

    for (let start = 1; start <= totalDays; start += 6) {
        const end = Math.min(start + 5, totalDays);
        const opt = document.createElement("option");
        opt.value = `${start}-${end}`;
        opt.textContent = `${start}–${end}`;
        dw_slotSelect.appendChild(opt);
    }
});

/* --------------------------------------------
   SLOT → LOAD CHART
-------------------------------------------- */
dw_slotSelect.addEventListener("change", function () {

    const advisor = dw_advisorSelect.value;
    const year = dw_yearSelect.value;
    const month = dw_monthSelect.value;

    if (!advisor || !year || !month) return;

    const [s, e] = this.value.split("-").map(Number);

    const filtered = dayWiseData[advisor].filter(item => {
        const [dd, mm, yyyy] = item.date.split("-");
        const day = parseInt(dd);
        return yyyy == year && mm == month && day >= s && day <= e;
    });

    renderDWChart(advisor, filtered);
});

/* --------------------------------------------
   RENDER APEX CHART
-------------------------------------------- */
function renderDWChart(advisor, data) {

    dw_advisorTitle.textContent = advisor;

    if (!data || data.length === 0) {
        if (dw_chart) dw_chart.destroy();
        dw_chartEl.style.display = "none";
        dw_noData.style.display = "block";
        return;
    }

    dw_noData.style.display = "none";
    dw_chartEl.style.display = "block";

    // 🔢 TOTALS CALCULATION (per bar)
    const totals = data.map(d => d.complete + d.inprogress + d.pending);

    const options = {
        chart: {
            type: "bar",
            height: 420,
            stacked: true,
            toolbar: { show: false }
        },

        markers: { show: false },

        colors: ["#ff6600", "#f3c81d", "#d20000"],

        series: [
            { name: "Complete", data: data.map(x => x.complete) },
            { name: "In-Progress", data: data.map(x => x.inprogress) },
            { name: "Pending", data: data.map(x => x.pending) }
        ],

        xaxis: {
            categories: data.map(x => convertToReadable(x.date)),
            labels: { style: { colors: "#cbd5e1" } }
        },

        yaxis: {
            labels: { style: { colors: "#cbd5e1" } }
        },

        plotOptions: {
            bar: {
                columnWidth: "15%",
                borderRadius: 6
            }
        },

        /* 🔹 ANDAR KE LABELS */
        dataLabels: {
            enabled: true,
            style: {
                colors: ["#ffffff"],
                fontSize: "13px",
                fontWeight: 600
            },
            background: {
                enabled: false
            }
        },

        /* ⭐ REAL WORKING TOTAL (TOP) */
        annotations: {
    points: totals.map((total, index) => ({
        x: data.map(x => convertToReadable(x.date))[index],
        y: total,
        marker: {
            size: 0
        },
        label: {
            text: String(total),
            offsetY:1,
            borderColor: "transparent",   // ✅ border remove
            style: {
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "bold",
                background: "transparent", // ✅ background remove
                padding: {
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            }
        }
    }))
}
,

        fill: {
            type: "gradient",
            gradient: {
                shade: "dark",
                type: "vertical",
                shadeIntensity: 0.6,
                gradientToColors: ["#df691a", "#dab628", "#c13030"],
                opacityFrom: 0.95,
                opacityTo: 1,
                stops: [0, 100]
            }
        },

        legend: {
            position: "top",
            labels: { colors: "#ffffff" }
        },

        tooltip: { theme: "dark" },

        grid: {
  show: true,
  borderColor: "#1e293b",
  position: "back"   // ✅ grid hamesha content ke piche
}
    };

    if (dw_chart) dw_chart.destroy();
    dw_chart = new ApexCharts(dw_chartEl, options);
    dw_chart.render();
}


/* --------------------------------------------
   DEFAULT LOAD
-------------------------------------------- */
function loadDefaultAdvisorView() {

    const today = new Date();
    const year = String(today.getFullYear());
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = today.getDate();

    dw_advisorSelect.value = "Advisor 1";
    dw_yearSelect.value = year;
    dw_monthSelect.value = month;

    dw_slotSelect.innerHTML = '<option disabled selected>Day Slot</option>';

    const totalDays = getMonthDays(year, month);
    let selectedSlot = "";

    for (let start = 1; start <= totalDays; start += 6) {
        const end = Math.min(start + 5, totalDays);
        const opt = document.createElement("option");
        opt.value = `${start}-${end}`;
        opt.textContent = `${start}–${end}`;
        dw_slotSelect.appendChild(opt);

        if (day >= start && day <= end) {
            selectedSlot = `${start}-${end}`;
        }
    }

    dw_slotSelect.value = selectedSlot;

    const [s, e] = selectedSlot.split("-").map(Number);

    const filtered = dayWiseData["Advisor 1"].filter(item => {
        const [dd, mm, yyyy] = item.date.split("-");
        const d = parseInt(dd);
        return yyyy == year && mm == month && d >= s && d <= e;
    });

    renderDWChart("Advisor 1", filtered);
}

/* --------------------------------------------
   INIT
-------------------------------------------- */
populateYears();
populateMonths();
loadDefaultAdvisorView();
