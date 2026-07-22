// =====================================================
// BM RIFQI DR
// SALES MONTH TO DATE
// Version 4.0
// PART A
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

        console.log("Loading MTD Dashboard...");

        const response = await fetch(WEB_APP_URL);

        if(!response.ok){

            throw new Error("Tidak dapat mengambil data.");

        }

        const json = await response.json();

        stores = Array.isArray(json) ? json : [];

        console.log("Total Store :",stores.length);

        // Render Dashboard
        renderStoreGrid();
        renderRankings();
        renderTargetTable();
        renderEstimateTable();
        renderSSSGTable();

    }

    catch(err){

        console.error(err);

        alert("Gagal memuat data MTD.");

    }

}

// =====================================================
// DATE
// =====================================================

function updateDateTime(){

    const now = new Date();

    const date =
    now.toLocaleDateString("id-ID",{

        weekday:"long",
        day:"2-digit",
        month:"long",
        year:"numeric"

    });

    const time =
    now.toLocaleTimeString("id-ID",{

        hour:"2-digit",
        minute:"2-digit",
        second:"2-digit"

    });

    const d=document.getElementById("todayDate");

    const t=document.getElementById("todayTime");

    if(d) d.innerHTML=date;

    if(t) t.innerHTML=time;

}

// =====================================================
// FORMATTER
// =====================================================

function formatRp(value){

    return "Rp " +

    Number(value || 0).toLocaleString("id-ID");

}

function formatPct(value){

    return Number(value || 0).toFixed(1)+"%";

}

function getBadge(value){

    if(value>=100){

        return{

            text:"Excellent",
            color:"#22c55e"

        };

    }

    if(value>=90){

        return{

            text:"On Track",
            color:"#f59e0b"

        };

    }

    return{

        text:"Need Action",
        color:"#ef4444"

    };

}

// =====================================================
// SAFE ELEMENT
// =====================================================

function setText(id,value){

    const el=document.getElementById(id);

    if(el){

        el.textContent=value;

    }

}
// =====================================================
// KPI CARD
// =====================================================


// =====================================================
// STORE PERFORMANCE
// =====================================================
function renderStoreGrid(){

    const container = document.getElementById("storeContainer");

    if(!container) return;

    container.innerHTML = "";

    const sorted = [...stores].sort((a,b)=>b.achievement-a.achievement);

    sorted.forEach(item=>{
        const badge = getBadge(item.achievement);

        const ach = getAchievementBadge(item.achievement);
        

        container.innerHTML += `

<div class="store-card"
     style="--cardColor:${ach.color};">

    <div class="store-header">

        <h3>${item.store}</h3>

        <span class="badge"
              style="
                background:${ach.color};
                color:#fff;
              ">
            ${ach.text}
        </span>

    </div>

    <div class="store-sales">

        ${formatRp(item.mtd)}

    </div>

    <div class="progress">

        <div class="progress-bar"

             style="
                width:${Math.min(item.achievement,100)}%;
                background:${ach.color};
             ">

        </div>

    </div>

    <div class="achievement-text">

    <span class="achievement-badge"

    style="background:${ach.color};">

        ${ach.text}

    </span>

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
            <b>${formatPct(item.acv)}</b>
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
// RANKING
// =====================================================

function renderRankings(){

    const topDiv =
    document.getElementById("topRanking");

    const lowDiv =
    document.getElementById("lowRanking");

    if(!topDiv || !lowDiv) return;

    topDiv.innerHTML="";
    lowDiv.innerHTML="";

    const sorted =
    [...stores].sort((a,b)=>b.achievement-a.achievement);

    const medals = [

        "🥇",
        "🥈",
        "🥉",
        "🏅",
        "🏅"

    ];

    // ============================
    // TOP 5
    // ============================

    sorted.slice(0,5).forEach((item,index)=>{

        topDiv.innerHTML += `

        <div class="rank-item">

            <div class="rank-left">

                <span class="medal">

                    ${medals[index]}

                </span>

                <div>

                    <b>${item.store}</b>

                    <small>

                        ${formatRp(item.mtd)}

                    </small>

                </div>

            </div>

            <div
            class="rank-value"

            style="color:#22c55e;">

                ${formatPct(item.achievement)}

            </div>

        </div>

        `;

    });

    // ============================
    // BOTTOM 5
    // ============================

    [...sorted]
    .reverse()
    .slice(0,5)
    .forEach(item=>{

        lowDiv.innerHTML += `

        <div class="rank-item">

            <div class="rank-left">

                <span class="medal">

                    ⚠️

                </span>

                <div>

                    <b>${item.store}</b>

                    <small>

                        ${formatRp(item.minus)}

                    </small>

                </div>

            </div>

            <div
            class="rank-value"

            style="color:#ef4444;">

                ${formatPct(item.achievement)}

            </div>

        </div>

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

    const sorted =
    [...stores].sort((a,b)=>b.achievement-a.achievement);

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

            <td>${item.remarks || "-"}</td>

        </tr>

        `;

    });

}



// =====================================================
// END OF MONTH ESTIMATE
// =====================================================

function renderEstimateTable(){

    const tbody =
    document.getElementById("estimateTable");

    if(!tbody) return;

    tbody.innerHTML="";

    const sorted =
    [...stores].sort((a,b)=>b.estimate-a.estimate);

    sorted.forEach(item=>{

        tbody.innerHTML += `

        <tr>

            <td><b>${item.store}</b></td>

            <td>${formatRp(item.avg)}</td>

            <td>${formatRp(item.estSales)}</td>

            <td>${formatRp(item.estimate)}</td>

            <td>${formatPct(item.acv)}</td>

 <td>

    <span class="${getLevelClass(item.level)}">

        ${item.level}

    </span>

</td>
        </tr>

        `;

    });

}
// =====================================================
// SSSG TABLE
// =====================================================

function renderSSSGTable(){

    const tbody =
    document.getElementById("sssgTable");

    if(!tbody) return;

    tbody.innerHTML="";

    stores.forEach(item=>{
        

        const color =
        item.sssg >= 0
        ? "#22c55e"
        : "#ef4444";

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
function getAchievementBadge(value){

    if(value >= 100){

        return {
            color:"#16a34a",
            text:formatPct(value)
        };

    }

    if(value >= 90){

        return {
            color:"#eab308",
            text:formatPct(value)
        };

    }

    if(value >= 70){

        return {
            color:"#f97316",
            text:formatPct(value)
        };

    }

    return{

        color:"#dc2626",
        text:formatPct(value)

    };

}
function getLevelClass(level){

    level = String(level).toLowerCase();

    if(level.includes("level 1")) return "level1";

    if(level.includes("level 2")) return "level2";

    if(level.includes("level 3")) return "level3";

    if(level.includes("level 4")) return "level4";

    if(level.includes("hadeuh")) return "levelHadeuh";

    return "levelDefault";

}