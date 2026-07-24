// =======================================
// API
// =======================================

const API_URL =
"https://script.google.com/macros/s/AKfycbwORZ8BP7ORnc-lsp1tSM01ZDPQ1v1aAvcq3H0zpc_VYKyBVPdyu0lzRfBUKD4C3L54/exec?action=stresult";

let stockData = [];
// ==========================================
// TAB MENU
// ==========================================

const tabButtons = document.querySelectorAll(".tab-btn");

const tableContent = document.getElementById("tabContent");

tabButtons.forEach(btn=>{

    btn.addEventListener("click",()=>{

        document.querySelector(".tab-btn.active")
        .classList.remove("active");

        btn.classList.add("active");

        loadTable(btn.dataset.tab);

    });

});


// ==========================================
// LOAD TABLE
// ==========================================

function loadTable(tab){

    switch(tab){

        case "general":
            renderGeneral();
            break;

        case "missing":
            renderMissing();
            break;

        case "loss":
            renderLoss();
            break;

        case "accuracy":
            renderAccuracy();
            break;

        case "incentive":
            renderIncentive();
            break;

        case "audit":
            renderAudit();
            break;

        case "organization":
            renderOrganization();
            break;

    }

}


// ==========================================
// GENERAL
// ==========================================

function renderGeneral(){

tableContent.innerHTML=`

<table class="stock-table">

<thead>

<tr>

<th>No</th>
<th>Store Code</th>
<th>Store Name</th>
<th>SO Date</th>
<th>LY ST Date</th>
<th>TY ST Date</th>
<th>ST Month</th>
<th>Period Sales</th>
<th>Total Sales</th>
<th>Average Monthly Sales</th>

</tr>

</thead>

<tbody>

${stockData.map((item,index)=>`

<tr>

<td>${index+1}</td>

<td>${item["Store Code"]}</td>

<td>${item["Store Name"]}</td>

<td>${formatDate(item["SO Date"])}</td>

<td>${formatDate(item["LY ST Date"])}</td>

<td>${formatDate(item["TY ST Date"])}</td>

<td>${formatMonthYear(item["ST Month"])}</td>

<td>${item["Period of Sales"]}</td>

<td>${formatCurrency(item["Total Sales"] * 1000000)}</td>

<td>${formatCurrency(item["Avrg Monthly Sales"])}</td>

</tr>

`).join("")}

</tbody>

</table>

`;

}

// ==========================================
// MISSING
// ==========================================

function renderMissing(){

tableContent.innerHTML=`

<table class="stock-table">

<thead>

<tr>

<th>Store</th>

<th>DMO</th>

<th>DMC</th>

<th>DMP</th>

<th>MS</th>

<th>EX</th>

<th>MS</th>

<th>EX</th>

</tr>

</thead>

<tbody id="tableBody">

</tbody>

</table>

`;

}


// ==========================================
// NET LOSS
// ==========================================

function renderLoss(){

tableContent.innerHTML=`

<table class="stock-table">

<thead>

<tr>

<th>Store</th>

<th>Net Loss</th>

<th>% Net Loss</th>

<th>Target Missing</th>

<th>% Missing</th>

</tr>

</thead>

<tbody id="tableBody">

</tbody>

</table>

`;

}


// ==========================================
// ACCURACY
// ==========================================

function renderAccuracy(){

tableContent.innerHTML=`

<table class="stock-table">

<thead>

<tr>

<th>Store</th>

<th>Target Accuracy</th>

<th>Missing SKU</th>

<th>Extra SKU</th>

<th>Total SKU</th>

<th>Accuracy</th>

</tr>

</thead>

<tbody id="tableBody">

</tbody>

</table>

`;

}


// ==========================================
// INCENTIVE
// ==========================================

function renderIncentive(){

tableContent.innerHTML=`

<table class="stock-table">

<thead>

<tr>

<th>Store</th>

<th>Meet 1st Criteria</th>

<th>Audit Required</th>

<th>Final Incentive</th>

<th>Incentive Amount</th>

</tr>

</thead>

<tbody id="tableBody">

</tbody>

</table>

`;

}


// ==========================================
// AUDIT
// ==========================================

function renderAudit(){

tableContent.innerHTML=`

<table class="stock-table">

<thead>

<tr>

<th>Store</th>

<th>Audit</th>

</tr>

</thead>

<tbody id="tableBody">

</tbody>

</table>

`;

}


// ==========================================
// ORGANIZATION
// ==========================================

function renderOrganization(){

tableContent.innerHTML=`

<table class="stock-table">

<thead>

<tr>

<th>Store</th>

<th>Island</th>

<th>RM</th>

<th>AM</th>

<th>DM</th>

<th>BM</th>

</tr>

</thead>

<tbody id="tableBody">

</tbody>

</table>

`;

}
// =======================================
// LOAD DATA
// =======================================

async function loadData(){

    try{

        const res = await fetch(API_URL);

        console.log("Status :", res.status);

        console.log("OK :", res.ok);

        stockData = await res.json();

        console.log(stockData);

        console.log(stockData.length);

        updateSummaryCards();

        renderGeneral();

    }

    catch(err){

        console.error("FETCH ERROR :", err);

    }

}

loadData();
function updateSummaryCards(){

    // ==========================
    // TOTAL STORE
    // ==========================

    document.getElementById("totalStore").innerText =
    stockData.length;


    // ==========================
    // AVG NET LOSS
    // ==========================

    let totalLoss = 0;

    stockData.forEach(item=>{

        totalLoss += Number(item["% Net Loss"]) || 0;

    });

    let avgLoss = totalLoss / stockData.length;

    document.getElementById("avgLoss").innerText =
    (avgLoss*100).toFixed(2)+"%";


    // ==========================
    // AVG ST ACCURACY
    // ==========================

    let totalAcc = 0;

    stockData.forEach(item=>{

        totalAcc += Number(item["% ST Accuracy"]) || 0;

    });

    let avgAcc = totalAcc / stockData.length;

    document.getElementById("avgAccuracy").innerText =
    (avgAcc*100).toFixed(2)+"%";


    // ==========================
    // TOTAL INCENTIVE
    // ==========================

    let incentive = 0;

    stockData.forEach(item=>{

        incentive += Number(item["Incentive Amt"]) || 0;

    });

    document.getElementById("totalIncentive").innerText =
    formatCurrency(incentive);

}
function formatCurrency(value){

    if(value==null || value=="") return "-";

    return new Intl.NumberFormat("id-ID",{
        style:"currency",
        currency:"IDR",
        maximumFractionDigits:0
    }).format(Number(value));

}
function formatMonthYear(date){

    if(!date) return "-";

    const d = new Date(date);

    const bulan = [
        "Januari","Februari","Maret","April","Mei","Juni",
        "Juli","Agustus","September","Oktober","November","Desember"
    ];

    return `${bulan[d.getMonth()]} ${d.getFullYear()}`;

}
function formatDate(date){

    if(!date) return "-";

    const d = new Date(date);

    return d.toLocaleDateString("id-ID",{

        day:"2-digit",

        month:"long",

        year:"numeric"

    });

}