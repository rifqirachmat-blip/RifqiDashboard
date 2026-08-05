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
let uptStores = [];

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
        showLoading();

        console.log("Loading MTD Dashboard...");

        const response = await fetch(WEB_APP_URL);

        if(!response.ok){

            throw new Error("Tidak dapat mengambil data.");

        }

        const json = await response.json();

        stores = json.filter(x => x.type !== "UPT");

uptStores = json.filter(x => x.type === "UPT");

        console.log("Total Store :",stores.length);

        // Render Dashboard
        renderRankings();
        renderTargetTable();
        renderEstimateTable();
        renderSSSGTable();
        renderUPTTable();

    }

    catch(err){

        console.error(err);

        alert("Gagal memuat data MTD.");

    }
     finally{

        hideLoading();

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
// TODAY'S RANKING
// =====================================================

function renderRankings(){

    const topDiv =
        document.getElementById("topRanking");

    const lowDiv =
        document.getElementById("lowRanking");

    if(!topDiv || !lowDiv) return;


    topDiv.innerHTML = "";
    lowDiv.innerHTML = "";


    // ==========================================
    // COPY DATA
    // ==========================================

    const sorted =
        [...stores]
        .sort(
            (a,b) =>
                b.achievement - a.achievement
        );


    // ==========================================
    // JUMLAH RANKING
    //
    // OTOMATIS MENGIKUTI JUMLAH STORE
    // ==========================================

    const rankingCount =
        sorted.length;


    // ==========================================
    // MEDAL / RANK ICON
    // ==========================================

    function getRankIcon(index){

        if(index === 0){
            return "🥇";
        }

        if(index === 1){
            return "🥈";
        }

        if(index === 2){
            return "🥉";
        }

        return `
            <span
                style="
                    display:inline-flex;
                    align-items:center;
                    justify-content:center;

                    width:24px;
                    height:24px;

                    border-radius:50%;

                    background:#e5e7eb;

                    color:#475569;

                    font-size:11px;

                    font-weight:700;
                "
            >
                ${index + 1}
            </span>
        `;

    }


    // ==========================================
    // TOP ACHIEVEMENT
    // ==========================================

    sorted
    .slice(0, rankingCount)
    .forEach(
        (item,index)=>{

            topDiv.innerHTML += `

                <div class="rank-item">

                    <div class="rank-left">

                        <span class="medal">

                            ${getRankIcon(index)}

                        </span>


                        <div>

                            <b>
                                ${item.store}
                            </b>

                            <small>
                                ${formatRp(item.mtd)}
                            </small>

                        </div>

                    </div>


                    <div
                        class="rank-value"
                        style="color:#22c55e;"
                    >

                        ${formatPct(
                            item.achievement
                        )}

                    </div>

                </div>

            `;

        }
    );


    // ==========================================
    // NEED ATTENTION
    //
    // Urut dari achievement TERENDAH
    // ==========================================

    const lowest =
        [...stores]
        .sort(
            (a,b) =>
                a.achievement - b.achievement
        );


    lowest
    .slice(0, rankingCount)
    .forEach(
        item=>{

            lowDiv.innerHTML += `

                <div class="rank-item">

                    <div class="rank-left">

                        <span class="medal">

                            ⚠️

                        </span>


                        <div>

                            <b>
                                ${item.store}
                            </b>

                            <small>
                                ${formatRp(item.minus)}
                            </small>

                        </div>

                    </div>


                    <div
                        class="rank-value"
                        style="color:#ef4444;"
                    >

                        ${formatPct(
                            item.achievement
                        )}

                    </div>

                </div>

            `;

        }
    );

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

            <td>
    ${formatRp(item.target1)}
    <br>
    <small style="color:${item.mtd >= item.target1 ? '#16a34a' : '#dc2626'};font-weight:600;">
        (${formatRp(item.mtd - item.target1)})
    </small>
</td>

<td>
    ${formatRp(item.target2)}
    <br>
    <small style="color:${item.mtd >= item.target2 ? '#16a34a' : '#dc2626'};font-weight:600;">
        (${formatRp(item.mtd - item.target2)})
    </small>
</td>

<td>
    ${formatRp(item.target3)}
    <br>
    <small style="color:${item.mtd >= item.target3 ? '#16a34a' : '#dc2626'};font-weight:600;">
        (${formatRp(item.mtd - item.target3)})
    </small>
</td>

<td>
    ${formatRp(item.target4)}
    <br>
    <small style="color:${item.mtd >= item.target4 ? '#16a34a' : '#dc2626'};font-weight:600;">
        (${formatRp(item.mtd - item.target4)})
    </small>
</td>
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
function renderUPTTable(){

    const tbody = document.getElementById("uptTable");

    if(!tbody) return;

    tbody.innerHTML = uptStores.map(item=>{

        const achv = Number(item.achv) * 100;

        let color = "#ef4444";

        if(achv >= 100){

            color = "#16a34a";

        }else if(achv >= 90){

            color = "#f59e0b";

        }

        return `

        <tr>

            <td><b>${item.store}</b></td>

            <td>${Number(item.avgUPT).toFixed(2)}</td>

            <td style="color:${color};font-weight:700;">
                ${achv.toFixed(1)}%
            </td>

            <td>${Number(item.target1).toFixed(2)}</td>

            <td>${Number(item.target2).toFixed(2)}</td>

            <td>${Number(item.target3).toFixed(2)}</td>

            <td>${item.remarks}</td>

        </tr>

        `;

    }).join("");

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

function showLoading(){

    const loadingOverlay =
        document.getElementById("loadingOverlay");

    if(loadingOverlay){

        loadingOverlay.style.display = "flex";

    }

}

function hideLoading(){

    const loadingOverlay =
        document.getElementById("loadingOverlay");

    if(loadingOverlay){

        loadingOverlay.style.display = "none";

    }

}