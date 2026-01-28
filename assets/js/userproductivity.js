const data = {
    "Team Leader 1": {
        "Advisor 1": { pending:8, complete:30, inprogress:6, date:"2026-01-01" },
        "Advisor 2": { pending:8, complete:27, inprogress:5, date:"2026-01-02" },
        "Advisor 3": { pending:5, complete:25, inprogress:4, date:"2026-01-03" },
        "Advisor 4": { pending:7, complete:30, inprogress:6, date:"2026-01-04" },
        "Advisor 5": { pending:11, complete:27, inprogress:5, date:"2026-01-05" },
        "Advisor 6": { pending:9, complete:31, inprogress:7, date:"2026-01-06" }
    },
    "Team Leader 2": {
        "Advisor 7": { pending:15, complete:35, inprogress:8, date:"2026-02-01" },
        "Advisor 8": { pending:10, complete:28, inprogress:6, date:"2026-02-02" },
        "Advisor 9": { pending:17, complete:30, inprogress:7, date:"2026-02-03" },
        "Advisor 10": { pending:12, complete:40, inprogress:9, date:"2026-02-04" },
        "Advisor 11": { pending:10, complete:25, inprogress:5, date:"2026-02-05" },
        "Advisor 12": { pending:14, complete:30, inprogress:6, date:"2026-02-06" }
    }
};

/* --------------------------------------------
   ELEMENTS
-------------------------------------------- */
const teamLeaderSelect = document.getElementById("teamLeaderSelect");
const advisorSelect = document.getElementById("advisorSelect");
const fromDate = document.getElementById("fromDate");
const toDate = document.getElementById("toDate");
const managerTitle = document.getElementById("managerTitle");
const noData = document.getElementById("noData");

let chart;
let lastRendered = {};

/* --------------------------------------------
   POPULATE TEAM LEADER
-------------------------------------------- */
Object.keys(data).forEach(tl => {
    teamLeaderSelect.innerHTML += `<option value="${tl}">${tl}</option>`;
});

/* --------------------------------------------
   POPULATE ADVISORS (ALL NAMES)
-------------------------------------------- */
function populateAdvisors(tl) {
    advisorSelect.innerHTML = `<option value="all">All Advisors</option>`;
    Object.keys(data[tl]).forEach(a => {
        advisorSelect.innerHTML += `<option value="${a}">${a}</option>`;
    });
    advisorSelect.value = "all"; // ✅ default
}

/* --------------------------------------------
   DATE RANGE FILTER
-------------------------------------------- */
function filterByDate(advisors) {
    if (!fromDate.value || !toDate.value) return advisors;

    const from = new Date(fromDate.value);
    const to = new Date(toDate.value);

    const filtered = {};
    Object.entries(advisors).forEach(([name, obj]) => {
        const d = new Date(obj.date);
        if (d >= from && d <= to) filtered[name] = obj;
    });

    return filtered;
}

/* --------------------------------------------
   RENDER CHART
-------------------------------------------- */
function renderChart(advisors) {

    let names = Object.keys(advisors);

    // ✅ All Advisors → first 6
    if (advisorSelect.value === "all") {
        names = names.slice(0, 6);
    }

    if (names.length === 0) {
        noData.style.display = "block";
        document.getElementById("chart").style.display = "none";
        return;
    }

    noData.style.display = "none";
    document.getElementById("chart").style.display = "block";

    lastRendered = {};
    names.forEach(n => lastRendered[n] = advisors[n]);

    const complete = names.map(a => advisors[a].complete);
    const inprogress = names.map(a => advisors[a].inprogress);
    const pending = names.map(a => advisors[a].pending);
    const total = names.map((_, i) => complete[i] + inprogress[i] + pending[i]);

    const options = {
        chart: {
            type: "bar",
            height: 400,
            stacked: true,
            foreColor: "#fff",
            toolbar: { show: false }
        },

        plotOptions: {
            bar: {
                columnWidth: "15%",
                borderRadius: 6,
                dataLabels: {
                    total: {
                        enabled: true,     // ✅ total on top
                        formatter: (_, opts) => total[opts.dataPointIndex],
                        style: { color:"#fff", fontWeight:"bold" }
                    }
                }
            }
        },

        series: [
            { name:"Complete", data: complete },
            { name:"In-Progress", data: inprogress },
            { name:"Pending", data: pending }
        ],

        colors: ["#ff6600","#f3c81dff","#d20000ff"],

        xaxis: { categories: names },

        legend: {
            position: "top",
            labels: { colors:"#fff" }
        },

        tooltip: { theme:"dark" },
        grid: {
  show: true,
  borderColor: "#1e293b",
  position: "back"   // ✅ grid hamesha content ke piche
},
fill: {
            type: "gradient",
            gradient: {
                shade: "dark",
                type: "vertical",
                shadeIntensity: 0.6,
                gradientToColors: [
                    "#df691aff",
                    "#dab628ff",
                    "#c13030ff"
                ],
                inverseColors: false,
                opacityFrom: 0.95,
                opacityTo: 1,
                stops: [0, 100]
            }
        }
    };

    if (chart) chart.destroy();
    chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
}

/* --------------------------------------------
   APPLY FILTERS
-------------------------------------------- */
function applyFilters() {
    const tl = teamLeaderSelect.value;
    if (!tl) return;

    managerTitle.textContent = tl;

    let advisors = filterByDate(data[tl]);

    if (advisorSelect.value !== "all") {
        advisors = {
            [advisorSelect.value]: advisors[advisorSelect.value]
        };
    }

    renderChart(advisors);
}

/* --------------------------------------------
   DOWNLOAD CSV
-------------------------------------------- */
document.getElementById("downloadBtn").addEventListener("click", () => {
    let csv = "Advisor,Complete,InProgress,Pending\n";
    Object.entries(lastRendered).forEach(([a,v])=>{
        csv += `${a},${v.complete},${v.inprogress},${v.pending}\n`;
    });

    const blob = new Blob([csv], { type:"text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "User_Productivity_Report.csv";
    a.click();
});

/* --------------------------------------------
   EVENTS
-------------------------------------------- */
teamLeaderSelect.addEventListener("change", () => {
    populateAdvisors(teamLeaderSelect.value);
    applyFilters();
});

advisorSelect.addEventListener("change", applyFilters);
fromDate.addEventListener("change", applyFilters);
toDate.addEventListener("change", applyFilters);

/* --------------------------------------------
   INITIAL LOAD
-------------------------------------------- */
teamLeaderSelect.selectedIndex = 0;
populateAdvisors(teamLeaderSelect.value);
applyFilters();