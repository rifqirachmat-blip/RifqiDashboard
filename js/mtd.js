// =====================================================
// BM RIFQI DR
// SALES MONTH TO DATE
// Version 3.0
// PART 1
// =====================================================

// =====================================================
// CONFIG
// =====================================================

const WEB_APP_URL =
"https://script.google.com/macros/s/AKfycby6mW_B_zy5DwVHprwS2QLkARmn7mRTgwJPJlo6a6VQ_c9_rQhB1XcjDne_AsP42ge2dg/exec";

let stores = [];

// =====================================================
// START
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    updateDateTime();

    loadMTDData();

    setInterval(updateDateTime,1000);

});

// =====================================================
// LOAD DATA
// =====================================================

async function loadMTDData(){

    try{

        console.log("Loading MTD...");

        const response = await fetch(WEB_APP_URL);

        if(!response.ok){

            throw new Error("Fetch Error");

        }

        stores = await response.json();

        console.log(stores);

        renderKPICards();

        renderStoreGrid();

        renderRankings();

        renderTargetTable();

        renderEstimateTable();

        renderSSSGTable();

    }

    catch(err){

        console.error(err);

        alert("Gagal mengambil data Apps Script.");

    }

}

// =====================================================
// DATE
// =====================================================

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

// =====================================================
// FORMAT
// =====================================================

function formatRp(number){

    return "Rp " +

    Number(number || 0).toLocaleString("id-ID");

}

function formatPercent(number){

    return Number(number || 0).toFixed(1) + "%";

}

function badgeText(value){

    if(value>=100) return "Excellent";

    if(value>=90) return "On Track";

    return "Need Action";

}

function badgeColor(value){

    if(value>=100) return "#22c55e";

    if(value>=90) return "#f59e0b";

    return "#ef4444";

}

// =====================================================
// KPI CARD
// =====================================================

function renderKPICards(){

    if(stores.length===0) return;

    const totalSales =
    stores.reduce((a,b)=>a+Number(b.mtd),0);

    const totalTarget =
    stores.reduce((a,b)=>a+Number(b.target),0);

    const totalAvg =
    stores.reduce((a,b)=>a+Number(b.avg),0);

    const totalNeed =
    stores.reduce((a,b)=>a+Number(b.need),0);

    const achievement =
    totalTarget==0
    ?0
    :(totalSales/totalTarget)*100;

    document.getElementById("mtdSales").innerHTML =
    formatRp(totalSales);

    document.getElementById("achievement").innerHTML =
    formatPercent(achievement);

    document.getElementById("avgDay").innerHTML =
    formatRp(totalAvg);

    document.getElementById("mustHit").innerHTML =
    formatRp(totalNeed);

}

// =====================================================
// STORE CARD
// =====================================================

function renderStoreGrid(){

    const container =
    document.getElementById("storeContainer");

    container.innerHTML="";

    const sorted =
    [...stores].sort((a,b)=>b.achievement-a.achievement);

    sorted.forEach(item=>{

        container.innerHTML += `

<div class="store-card">

<div class="store-title">

<h3>${item.store}</h3>

<span class="badge">

${badgeText(item.achievement)}

</span>

</div>

<div class="store-sales">

${formatRp(item.mtd)}

</div>

<div class="progress">

<div class="progress-bar"

style="width:${Math.min(item.achievement,100)}%;
background:${badgeColor(item.achievement)};">

</div>

</div>

<div class="achievement-text">

${formatPercent(item.achievement)}

</div>

<div class="info-grid">

<div class="info-box">

<small>Need / Day</small>

<b>${formatRp(item.need)}</b>

</div>

<div class="info-box">

<small>AVG / Day</small>

<b>${formatRp(item.avg)}</b>

</div>

<div class="info-box">

<small>Estimate</small>

<b>${formatRp(item.estimate)}</b>

</div>

<div class="info-box">

<small>ACV</small>

<b>${formatPercent(item.acv)}</b>

</div>

<div class="info-box">

<small>Incentive</small>

<b>${item.level}</b>

</div>

<div class="info-box">

<small>Remarks</small>

<b>${item.remarks}</b>

</div>

</div>

</div>

`;

    });

}
// =====================================================
// 4. SALES TARGET TABLE
// =====================================================
function renderTargetTable(){

    const tbody = document.getElementById("targetTable");

    if(!tbody) return;

    tbody.innerHTML = "";

    const sorted = [...stores].sort((a,b)=>b.achievement-a.achievement);

    sorted.forEach(item=>{

        tbody.innerHTML += `

        <tr>

            <td><b>${item.store}</b></td>

            <td>${formatRp(item.mtd)}</td>

            <td>${formatRp(item.target1)}</td>

            <td>${formatRp(item.target2)}</td>

            <td>${formatRp(item.target3)}</td>

            <td>${formatRp(item.target4)}</td>

            <td>

                <span class="badge">

                    ${formatPct(item.achievement)}

                </span>

            </td>

            <td>${formatRp(item.avg)}</td>

            <td>${formatRp(item.need)}</td>

            <td>${item.remarks}</td>

        </tr>

        `;

    });

}


// =====================================================
// 5. ESTIMATE TABLE
// =====================================================
function renderEstimateTable(){

    const tbody = document.getElementById("estimateTable");

    if(!tbody) return;

    tbody.innerHTML = "";

    const sorted = [...stores].sort((a,b)=>b.estimate-a.estimate);

    sorted.forEach(item=>{

        tbody.innerHTML += `

        <tr>

            <td><b>${item.store}</b></td>

            <td>${formatRp(item.avg)}</td>

            <td>${formatRp(item.estSales)}</td>

            <td>${formatRp(item.estimate)}</td>

            <td>${formatPct(item.acv)}</td>

            <td>${item.level}</td>

        </tr>

        `;

    });

}


// =====================================================
// 6. SSSG TABLE
// =====================================================
function renderSSSGTable(){

    const tbody = document.getElementById("sssgTable");

    if(!tbody) return;

    tbody.innerHTML = "";

    stores.forEach(item=>{

        const color =
        item.sssg >= 0
        ? "#16a34a"
        : "#dc2626";

        tbody.innerHTML += `

        <tr>

            <td><b>${item.store}</b></td>

            <td>${formatRp(item.mtd2026)}</td>

            <td>${formatRp(item.mtd2025)}</td>

            <td>${formatRp(item.difference)}</td>

            <td style="font-weight:700;color:${color};">

                ${formatPct(item.sssg)}

            </td>

        </tr>

        `;

    });

}


// =====================================================
// HELPER
// =====================================================
function setElementText(id,text){

    const el = document.getElementById(id);

    if(el){

        el.textContent = text;

    }

}
// =====================================================
// 6. SSSG TABLE
// =====================================================

function renderSSSGTable(){

    const tbody = document.getElementById("sssgTable");

    if(!tbody) return;

    tbody.innerHTML="";

    stores.forEach(item=>{

        const growthColor =
            item.sssg >= 0
            ? "#22c55e"
            : "#ef4444";

        tbody.innerHTML += `

        <tr>

            <td>${item.store}</td>

            <td>${formatRp(item.mtd2026)}</td>

            <td>${formatRp(item.mtd2025)}</td>

            <td>${formatRp(item.difference)}</td>

            <td style="
                color:${growthColor};
                font-weight:700;
            ">
                ${formatPct(item.sssg)}
            </td>

        </tr>

        `;

    });

}


// =====================================================
// SALES TARGET TABLE
// =====================================================

function renderTargetTable(){

    const tbody = document.getElementById("targetTable");

    if(!tbody) return;

    tbody.innerHTML="";

    const sorted=[...stores].sort((a,b)=>b.achievement-a.achievement);

    sorted.forEach(item=>{

        tbody.innerHTML += `

        <tr>

            <td>${item.store}</td>

            <td>${formatRp(item.mtd)}</td>

            <td>${formatRp(item.target1)}</td>

            <td>${formatRp(item.target2)}</td>

            <td>${formatRp(item.target3)}</td>

            <td>${formatRp(item.target4)}</td>

            <td>

                <span class="badge">

                    ${formatPct(item.achievement)}

                </span>

            </td>

            <td>${formatRp(item.avg)}</td>

            <td>${formatRp(item.need)}</td>

            <td>${item.remarks}</td>

        </tr>

        `;

    });

}


// =====================================================
// ESTIMATE TABLE
// =====================================================

function renderEstimateTable(){

    const tbody=document.getElementById("estimateTable");

    if(!tbody) return;

    tbody.innerHTML="";

    const sorted=[...stores].sort((a,b)=>b.estimate-a.estimate);

    sorted.forEach(item=>{

        tbody.innerHTML += `

        <tr>

            <td>${item.store}</td>

            <td>${formatRp(item.avg)}</td>

            <td>${formatRp(item.estSales)}</td>

            <td>${formatRp(item.estimate)}</td>

            <td>${formatPct(item.acv)}</td>

            <td>${item.level}</td>

        </tr>

        `;

    });

}


// =====================================================
// HELPER
// =====================================================

function setElementText(id,value){

    const el=document.getElementById(id);

    if(el){

        el.textContent=value;

    }

}