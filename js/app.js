// =====================================================
// BM RIFQI DR DASHBOARD
// Version 2.0 - Part 1
// =====================================================

// =========================================
// CONFIG
// =========================================

const API_URL = "https://script.google.com/macros/s/AKfycbxfXMWU7XGfaOebsqjq8H_XWD7Kzdtlcz_mIuqspC8Ysr1ZLj5j3Nn3HInboBPVtZBibA/exec";
// =========================================
// GLOBAL VARIABLE
// =========================================

let salesData = [];
let filteredData = [];
let compareData = [];
let sortColumn = "sales";
let sortDirection = "desc";
// =========================================
// CHART VARIABLE
// =========================================

let salesChart = null;
let compareChart = null;
// =========================================
// INITIALIZE
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    updateDateTime();

    loadData();

    setInterval(updateDateTime,1000);

});

// =========================================
// LOAD DATA
// =========================================

async function loadData() {

    try {

        const response = await fetch(API_URL);

        salesData = await response.json();

        populateFilters();
        
        addFilterEvents();
console.log("Filtered:", filteredData.length);
console.log("Compare:", compareData.length);
        applyFilters();
        updateKPI();
        updateGrowth();
        updateSalesChart();
        updateDetailTable();

    } catch (error) {

        console.error(error);

        alert("Gagal mengambil data dari Google Apps Script");

    }

}

// =========================================
// DATE & TIME
// =========================================

function updateDateTime(){

    const now = new Date();

    document.getElementById("todayDate").innerHTML =
    now.toLocaleDateString("id-ID",{

        weekday:"long",
        day:"2-digit",
        month:"long",
        year:"numeric"

    });

    document.getElementById("todayTime").innerHTML =
    now.toLocaleTimeString("id-ID",{

        hour:"2-digit",
        minute:"2-digit",
        second:"2-digit"

    });

}

// =========================================
// POPULATE FILTER
// =========================================

function populateFilters() {

    createDropdown("fy");
    createDropdown("month");
    createDropdown("dm");
    createDropdown("bm");
    createDropdown("abm");
    createDropdown("store");

}
function createDropdown(id){

    const select = document.getElementById(id);

    select.innerHTML = "";

    // Default
    const first = document.createElement("option");
    first.value = "";
    first.textContent = "All";
    select.appendChild(first);

    let field = "";

    switch(id){

        case "fy":
            field = "fy";
            break;

        case "month":
            field = "month";
            break;

        case "dm":
            field = "dm";
            break;

        case "bm":
            field = "bm";
            break;

        case "abm":
            field = "abm";
            break;

        case "store":
            field = "storeName";
            break;

    }

    const values = [...new Set(salesData.map(item => item[field]))];

    // Khusus Month urut Nov → Oct
    if(id === "month"){

        values.sort((a,b)=>{

            const A = salesData.find(x=>x.month===a).monthOrder;
            const B = salesData.find(x=>x.month===b).monthOrder;

            return A-B;

        });

    }else{

        values.sort();

    }

    values.forEach(value=>{

        const option = document.createElement("option");

        option.value = value;
        option.textContent = value;

        select.appendChild(option);

    });

}
// =========================================
// FILTER ENGINE
// =========================================

function applyFilters() {

    const fy = document.getElementById("fy").value;
    const month = document.getElementById("month").value;
    const dm = document.getElementById("dm").value;
    const bm = document.getElementById("bm").value;
    const abm = document.getElementById("abm").value;
    const store = document.getElementById("store").value;

    // ===============================
    // CURRENT FY
    // ===============================

    filteredData = salesData.filter(item => {

        return (
            (!fy || item.fy === fy) &&
            (!month || item.month === month) &&
            (!dm || item.dm === dm) &&
            (!bm || item.bm === bm) &&
            (!abm || item.abm === abm) &&
            (!store || item.storeName === store)
        );

    });

    // ===============================
    // PREVIOUS FY
    // ===============================

    let compareFY = "";

 if (fy === "FY2026") {

    compareFY = "FY2025";

}else{

    compareFY = "";

}

    compareData = salesData.filter(item => {

        return (
            item.fy === compareFY &&
            (!month || item.month === month) &&
            (!dm || item.dm === dm) &&
            (!bm || item.bm === bm) &&
            (!abm || item.abm === abm) &&
            (!store || item.storeName === store)
        );

    });

if(compareData.length > 0){
    console.log(compareData[0]);
}

    updateKPI();
    updateGrowth();
    updateSalesChart();
    updateDetailTable();

}
// =========================================
// CASCADING FILTER
// =========================================

// =========================================
// UPDATE DASHBOARD
// =========================================

// =========================================
// KPI
// =========================================

function updateKPI() {

    const totalSales = filteredData.reduce((sum, item) => sum + Number(item.sales), 0);

    const totalTrx = filteredData.reduce((sum, item) => sum + Number(item.trx), 0);

    const totalATV = totalTrx === 0 ? 0 : totalSales / totalTrx;

    document.getElementById("salesCard").textContent =
        "Rp " + totalSales.toLocaleString("id-ID");

    document.getElementById("trxCard").textContent =
        totalTrx.toLocaleString("id-ID");

    document.getElementById("atvCard").textContent =
        "Rp " + Math.round(totalATV).toLocaleString("id-ID");

}
// =========================================
// GROWTH
// =========================================

function updateGrowth() {

    const currentSales = filteredData.reduce((sum, item) => {

        return sum + Number(item.sales);

    }, 0);

    const previousSales = compareData.reduce((sum, item) => {

        return sum + Number(item.sales);

    }, 0);

    const growthCard = document.getElementById("growthCard");

    if (previousSales === 0) {

        growthCard.textContent = "-";

        growthCard.style.color = "#555";

        return;

    }

    const growth =
        ((currentSales - previousSales) / previousSales) * 100;

    growthCard.textContent = growth.toFixed(2) + "%";

    if (growth >= 0) {

        growthCard.style.color = "#16a34a";

    } else {

        growthCard.style.color = "#dc2626";

    }

}

function getSeries(fy){

    const months = [
        "Nov","Dec","Jan","Feb","Mar","Apr",
        "May","Jun","Jul","Aug","Sep","Oct"
    ];

    const dm = document.getElementById("dm").value;
    const bm = document.getElementById("bm").value;
    const abm = document.getElementById("abm").value;
    const store = document.getElementById("store").value;

    return months.map(month=>{

        const total = salesData
        .filter(item=>

            item.fy===fy &&

            item.month===month &&

            (!dm || item.dm===dm) &&

            (!bm || item.bm===bm) &&

            (!abm || item.abm===abm) &&

            (!store || item.storeName===store)

        )

        .reduce((sum,item)=>sum+Number(item.sales),0);

        return total;

    });

}
// =========================================
// FORMAT
// =========================================

function formatRupiah(number){

    return "Rp " + Number(number).toLocaleString("id-ID");

}

function formatNumber(number){

    return Number(number).toLocaleString("id-ID");

}
// =========================================
// SALES TREND CHART
// =========================================

function updateSalesChart(){

    const canvas = document.getElementById("salesChart");

    if(!canvas) return;

    if(salesChart){

        salesChart.destroy();

    }

const fy = document.getElementById("fy").value || "FY2026";

    const compareFY =
fy === "FY2026"
? "FY2025"
: "FY2024";

    salesChart = new Chart(canvas,{

        type:"line",

        data:{

            labels:[
                "Nov","Dec","Jan","Feb","Mar","Apr",
                "May","Jun","Jul","Aug","Sep","Oct"
            ],

            datasets:[

                {

                    label:fy,

                    data:getSeries(fy),

                    borderColor:"#1976d2",

                    backgroundColor:"rgba(25,118,210,.15)",

                    borderWidth:3,

                    tension:.35,

                    fill:false

                },

                {

                    label:compareFY,

                    data:getSeries(compareFY),

                    borderColor:"#f4b400",

                    backgroundColor:"rgba(244,180,0,.15)",

                    borderWidth:3,

                    tension:.35,

                    fill:false

                }

            ]

        },

        options:{

            responsive:true,

            maintainAspectRatio:false,
            layout:{
    padding:8
},

            interaction:{
                mode:"index",
                intersect:false
            },

            plugins:{

                legend:{
                    position:"top"
                }

            },

 scales:{

    x:{
        ticks:{
            font:{
                size:10
            }
        }
    },

    y:{
        ticks:{

            font:{
                size:10
            },

            callback:function(value){

                return (value/1000000).toFixed(0) + "M";

            }

        }
    }

}

        }

    });

}

function addFilterEvents(){

    document.getElementById("fy").addEventListener("change", applyFilters);

    document.getElementById("month").addEventListener("change", applyFilters);

    document.getElementById("dm").addEventListener("change", applyFilters);

    document.getElementById("bm").addEventListener("change", applyFilters);

    document.getElementById("abm").addEventListener("change", applyFilters);

    document.getElementById("store").addEventListener("change", applyFilters);

}
// =========================================
// DETAIL TABLE
// =========================================

function updateDetailTable() {

    const tbody = document.getElementById("detailTable");

    tbody.innerHTML = "";

    const stores = [...new Set(filteredData.map(item => item.storeName))];

    stores.forEach(store => {

        const current = filteredData.filter(item => item.storeName === store);
        console.log("STORE :", store);
console.log(compareData);

        const compare = compareData.filter(item => item.storeName === store);

        const sales = current.reduce((sum, item) => sum + Number(item.sales), 0);

        const trx = current.reduce((sum, item) => sum + Number(item.trx), 0);

        const previousSales = compare.reduce((sum, item) => sum + Number(item.sales), 0);
        console.log(store, sales, previousSales);

        const atv = trx > 0 ? sales / trx : 0;

        const growth = previousSales > 0
            ? ((sales - previousSales) / previousSales) * 100
            : 0;

        const dm = current.length ? current[0].dm : "";
        const bm = current.length ? current[0].bm : "";
        const abm = current.length ? current[0].abm : "";

        tbody.innerHTML += `
            <tr>
                <td>${store}</td>
                <td>${dm}</td>
                <td>${bm}</td>
                <td>${abm}</td>
                <td>Rp${sales.toLocaleString("id-ID")}</td>
                <td>${trx.toLocaleString()}</td>
                <td>Rp${Math.round(atv).toLocaleString("id-ID")}</td>
                <td style="font-weight:bold;color:${growth >= 0 ? "#16a34a" : "#dc2626"}">
                    ${growth.toFixed(2)}%
                </td>
            </tr>
        `;
    });

}
