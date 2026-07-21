// ======================================================
// SALES MTD DASHBOARD
// Created by ChatGPT & Rifqi
// ======================================================

// =====================================
// CONFIG
// =====================================

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycby6mW_B_zy5DwVHprwS2QLkARmn7mRTgwJPJlo6a6VQ_c9_rQhB1XcjDne_AsP42ge2dg/exec";

let stores = [];

// =====================================
// START
// =====================================

document.addEventListener("DOMContentLoaded", () => {

    updateClock();

    setInterval(updateClock,1000);

    loadData();

});

// =====================================
// LOAD GOOGLE APPS SCRIPT
// =====================================

async function loadData(){

    try{

        const response = await fetch(WEB_APP_URL);

        stores = await response.json();
        document.getElementById("loadingScreen").style.display="none";

       console.log(stores[0]);

        updateKPI();

        createStoreCard();

        updateRanking();

        updateTargetTable();

        updateEstimateTable();

        updateSSSG();

    }

    catch(err){

        console.error(err);

        alert("Gagal mengambil data dari Google Apps Script");

    }

}

// =====================================
// CLOCK
// =====================================

function updateClock(){

    const now = new Date();

    document.getElementById("todayDate").innerHTML =
        now.toLocaleDateString("id-ID",{

            weekday:"long",

            day:"numeric",

            month:"long",

            year:"numeric"

        });

    document.getElementById("todayTime").innerHTML =
        now.toLocaleTimeString("id-ID");

}

// =====================================
// HELPER
// =====================================

function formatCurrency(number){

    if(number == null || number === "" || isNaN(number)){

        return "Rp 0";

    }

    return "Rp " + Math.round(Number(number)).toLocaleString("id-ID");

}

function getStatus(value){

    if(value>=100) return "🟢 On Track";

    if(value>=80) return "🔵 Good";

    if(value>=60) return "🟡 Watch";

    return "🔴 Critical";

}

function getProgressColor(value){

    if(value>=100) return "#22c55e";

    if(value>=80) return "#3b82f6";

    if(value>=60) return "#f59e0b";

    return "#ef4444";

}
function getRemarkClass(remark){

    if(!remark) return "remark-watch";

    remark = remark.toLowerCase();

    if(
        remark.includes("achieved") ||
        remark.includes("good") ||
        remark.includes("on track")
    ){

        return "remark-good";

    }

    if(
        remark.includes("watch")
    ){

        return "remark-watch";

    }

    return "remark-danger";

}
// =====================================
// KPI
// =====================================

function updateKPI(){

    if(stores.length===0) return;

    const totalSales = stores.reduce((sum,item)=>sum+item.mtd,0);

    const avgAchievement =
        stores.reduce((sum,item)=>sum+item.achievement,0)/stores.length;

    const avgDay =
        stores.reduce((sum,item)=>sum+item.avg,0);

    const needDay =
        stores.reduce((sum,item)=>sum+item.need,0);

    document.getElementById("mtdSales").innerHTML =
        formatCurrency(totalSales);

    document.getElementById("achievement").innerHTML =
        avgAchievement.toFixed(2)+"%";

    document.getElementById("avgDay").innerHTML =
        formatCurrency(avgDay);

    document.getElementById("mustHit").innerHTML =
        formatCurrency(needDay);

}


// =====================================
// STORE CARD
// =====================================

function createStoreCard(){

    const container =
        document.getElementById("storeContainer");

    container.innerHTML="";

    stores
    .sort((a,b)=>b.achievement-a.achievement)
    .forEach(item=>{

        const color =
            getProgressColor(item.achievement);

        container.innerHTML+=`

        <div class="store-card">

            <div class="store-title">

                <h3>${item.store}</h3>

                <span class="badge">

                    ${getStatus(item.achievement)}

                </span>

            </div>

            <div class="store-sales">

                ${formatCurrency(item.mtd)}

            </div>

            <div class="progress">

                <div
                    class="progress-bar"
                    style="
                        width:${Math.min(item.achievement,100)}%;
                        background:${color};
                    ">
                </div>

            </div>

            <b>

                ${item.achievement.toFixed(2)}%

            </b>

            <div class="info-grid">

                <div class="info-box">

                    <small>Need / Day</small>

                    <b>

                        ${formatCurrency(item.need)}

                    </b>

                </div>

                <div class="info-box">

                    <small>AVG / Day</small>

                    <b>

                        ${formatCurrency(item.avg)}

                    </b>

                </div>

                <div class="info-box">

                    <small>Estimate</small>

                    <b>

                        ${formatCurrency(item.estimate)}

                    </b>

                </div>

                <div class="info-box">

                    <small>ACV</small>

                    <b>

                        ${item.acv.toFixed(0)}%

                    </b>

                </div>

                <div class="info-box">

                    <small>Incentive</small>

                    <b>

                        ${item.level}

                    </b>

                </div>

                <div class="info-box">

                    <small>Remarks</small>

                    <b>

                        ${item.remarks}

                    </b>

                </div>

            </div>

        </div>

        `;

    });

}
// =====================================
// TODAY'S RANKING
// =====================================

function updateRanking(){

    const top = [...stores]
        .sort((a,b)=>b.achievement-a.achievement)
        .slice(0,5);

    const low = [...stores]
        .sort((a,b)=>a.achievement-b.achievement)
        .slice(0,5);

    const medal = ["🥇","🥈","🥉","4️⃣","5️⃣"];

    document.getElementById("topRanking").innerHTML =
        top.map((item,index)=>`

        <div class="rank-item">

            <div class="rank-store">

                <span>${medal[index]}</span>

                <span>${item.store}</span>

            </div>

            <div class="rank-value">

                ${item.achievement.toFixed(0)}%

            </div>

        </div>

        `).join("");

    document.getElementById("lowRanking").innerHTML =
        low.map((item,index)=>`

        <div class="rank-item">

            <div class="rank-store">

                <span>⚠️</span>

                <span>${item.store}</span>

            </div>

            <div class="rank-value" style="color:#dc2626">

                ${item.achievement.toFixed(0)}%

            </div>

        </div>

        `).join("");

}

// =====================================
// SALES TARGET TABLE
// =====================================

function updateTargetTable(){

    const tbody =
        document.getElementById("targetTable");

    tbody.innerHTML="";

    stores
    .sort((a,b)=>b.achievement-a.achievement)
    .forEach(item=>{

        tbody.innerHTML+=`

        <tr>

            <td><b>${item.store}</b></td>

            <td>${formatCurrency(item.mtd)}</td>

             <td class="lv1-cell">

    <b>${formatCurrency(item.target1)}</b>

</td>

<td class="lv2-cell">

    <b>${formatCurrency(item.target2)}</b>

</td>

<td class="lv3-cell">

    <b>${formatCurrency(item.target3)}</b>

</td>

<td class="lv4-cell">

    <b>${formatCurrency(item.target4)}</b>

</td>

            <td>

                <span class="achievement-badge"
style="background:${getProgressColor(item.achievement)}">

${getAchievementIcon(item.achievement)}
${item.achievement.toFixed(0)}%

</span>

            </td>

            <td>${formatCurrency(item.avg)}</td>

            <td>${formatNeed(item.need)}</td>

            <td>

                <span class="remark-badge ${getRemarkClass(item.remarks)}">

                    ${item.remarks}

                </span>

            </td>

        </tr>

        `;

    });

}


// =====================================
// ESTIMATE TABLE
// =====================================

function updateEstimateTable(){

    const tbody =
        document.getElementById("estimateTable");

    tbody.innerHTML="";

    stores
    .sort((a,b)=>b.estimate-a.estimate)
    .forEach(item=>{

        tbody.innerHTML+=`

        <tr>

            <td>${item.store}</td>

            <td>${formatCurrency(item.avg)}</td>

            <td>${formatCurrency(item.estSales)}</td>

            <td>${formatCurrency(item.estimate)}</td>

            <td>${item.acv.toFixed(0)}%</td>

            <td>${item.level}</td>

        </tr>

        `;

    });

}
// =====================================
// SSSG TABLE
// =====================================

function updateSSSG(){

    const tbody =
        document.getElementById("sssgTable");

    tbody.innerHTML = "";

    stores
    .sort((a,b)=>b.sssg-a.sssg)
    .forEach(item=>{

        const growthColor =
            item.sssg >= 0 ? "#16a34a" : "#dc2626";

        const diffColor =
            item.difference >= 0 ? "#16a34a" : "#dc2626";

        tbody.innerHTML += `

        <tr>

            <td>${item.store}</td>

            <td>${formatCurrency(item.mtd2026)}</td>

            <td>${formatCurrency(item.mtd2025)}</td>

            <td style="color:${diffColor};font-weight:600;">

                ${formatCurrency(item.difference || 0)}

            </td>

            <td style="color:${growthColor};font-weight:700;">

                ${Number(item.sssg || 0).toFixed(2)}%

            </td>

        </tr>

        `;

    });

}


// =====================================
// REFRESH DATA
// =====================================

setInterval(loadData,300000);


// =====================================
// FINISH
// =====================================

console.log("Sales MTD Dashboard Loaded");
function getAchievementIcon(value){

    if(value>=100) return "▲";

    if(value>=80) return "●";

    return "▼";

}
function formatNeed(number){

    if(number>=0){

        return `<span style="color:#16a34a;font-weight:700;">
        +${formatCurrency(number)}
        </span>`;

    }

    return `<span style="color:#dc2626;font-weight:700;">
        -${formatCurrency(Math.abs(number))}
        </span>`;

}