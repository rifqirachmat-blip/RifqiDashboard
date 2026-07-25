// =======================================
// API
// =======================================

const API_BASE =
"https://script.google.com/macros/s/AKfycbwORZ8BP7ORnc-lsp1tSM01ZDPQ1v1aAvcq3H0zpc_VYKyBVPdyu0lzRfBUKD4C3L54/exec";

let stockData = [];
let filteredData = [];
let scheduleData = [];
// ==========================================
// TAB MENU
// ==========================================

const tabButtons = document.querySelectorAll(".tab-btn");

const tableContent = document.getElementById("tabContent");
let activeTab = "general";

tabButtons.forEach(btn=>{

    btn.addEventListener("click",()=>{

        document.querySelector(".tab-btn.active")
        .classList.remove("active");

        btn.classList.add("active");

        activeTab = btn.dataset.tab;

        loadTable(activeTab);

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

${filteredData.map((item,index)=>`

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

    tableContent.innerHTML = `

    <table class="stock-table">

        <thead>

            <tr>

                <th>No</th>
                <th>Store Code</th>
                <th>Store Name</th>

                <th>DMO</th>
                <th>DMC</th>
                <th>DMP</th>

                <th>MS Before</th>
                <th>EX Before</th>

                <th>MS After</th>
                <th>EX After</th>

            </tr>

        </thead>

        <tbody>

        ${filteredData.map((item,index)=>`

        <tr>

            <td>${index+1}</td>

            <td>${item["Store Code"]}</td>

            <td>${item["Store Name"]}</td>

<td style="color:#dc2626;font-weight:700;">
    -${formatCurrency((Number(item["DMO B4"])||0)*1000000)}
</td>

<td style="color:#dc2626;font-weight:700;">
    -${formatCurrency((Number(item["DMC B4"])||0)*1000000)}
</td>

<td style="color:#dc2626;font-weight:700;">
    -${formatCurrency((Number(item["DMP B4"])||0)*1000000)}
</td>

            <td style="
                font-weight:700;
                color:${Number(item["MS B4"])>0 ? "#dc2626" : "#16a34a"};
            ">
                -${formatCurrency((Number(item["MS B4"])||0)*1000000)}
            </td>

            <td style="
                font-weight:700;
                color:${Number(item["EX B4"])>0 ? "#2563eb" : "#16a34a"};
            ">
                ${formatCurrency((Number(item["EX B4"])||0)*1000000)}
            </td>

            <td style="
                font-weight:700;
                color:${Number(item["MS During"])>0 ? "#dc2626" : "#16a34a"};
            ">
                -${formatCurrency((Number(item["MS During"])||0)*1000000)}
            </td>

            <td style="
                font-weight:700;
                color:${Number(item["EX During"])>0 ? "#2563eb" : "#16a34a"};
            ">
                ${formatCurrency((Number(item["EX During"])||0)*1000000)}
            </td>

        </tr>

        `).join("")}

        </tbody>

    </table>

    `;

}

// ==========================================
// NET LOSS
// ==========================================

function renderLoss(){

    tableContent.innerHTML = `

    <table class="stock-table">

        <thead>

            <tr>

                <th>No</th>
                <th>Store Code</th>
                <th>Store Name</th>

                <th>Net Loss</th>
                <th>% Net Loss</th>

                <th>Target % Missing</th>
                <th>% Missing</th>

                <th>Status</th>

            </tr>

        </thead>

        <tbody>

        ${filteredData.map((item,index)=>{

            const netLoss = Number(item["Net Loss Amt"]) || 0;

            const pctLoss = Number(item["% Net Loss"]) || 0;

            const target = Number(item["Target % Missing"]) || 0;

            const pctMissing = Number(item["% Missing"]) || 0;

            const meet = pctMissing <= target;

            return `

            <tr>

                <td>${index+1}</td>

                <td>${item["Store Code"]}</td>

                <td>${item["Store Name"]}</td>

                <td style="color:#dc2626;font-weight:700;">
                    -${formatCurrency(netLoss*1000000)}
                </td>

                <td style="color:#dc2626;font-weight:700;">
                    ${(pctLoss*100).toFixed(2)}%
                </td>

                <td>
                    ${(target*100).toFixed(2)}%
                </td>

                <td style="
                    color:${meet ? "#16a34a" : "#dc2626"};
                    font-weight:700;
                ">
                    ${(pctMissing*100).toFixed(2)}%
                </td>

                <td>

                    <span style="
                        padding:6px 12px;
                        border-radius:20px;
                        font-size:12px;
                        font-weight:700;
                        background:${meet ? "#dcfce7" : "#fee2e2"};
                        color:${meet ? "#166534" : "#991b1b"};
                    ">

                        ${meet ? "MEET" : "OVER"}

                    </span>

                </td>

            </tr>

            `;

        }).join("")}

        </tbody>

    </table>

    `;

}


// ==========================================
// ACCURACY
// ==========================================

function renderAccuracy(){

    tableContent.innerHTML = `

    <table class="stock-table">

        <thead>

            <tr>

                <th>No</th>
                <th>Store Code</th>
                <th>Store Name</th>

                <th>Target Accuracy</th>
                <th>Missing SKU</th>
                <th>Extra SKU</th>
                <th>Total SKU</th>

                <th>ST Accuracy</th>

            </tr>

        </thead>

        <tbody>

        ${filteredData.map((item,index)=>{

            const target = Number(item["Target % ST Accuracy"]) || 0;

            const accuracy = Number(item["% ST Accuracy"]) || 0;

            const missing = Number(item["Total SKU with Missing >1"]) || 0;

            const extra = Number(item["Total SKU with Extra >1"]) || 0;

            const totalSku = Number(item["Total SKU"]) || 0;

            const color = accuracy >= target
    ? "#22c55e"
    : "#ef4444";

            return`

            <tr>

                <td>${index+1}</td>

                <td>${item["Store Code"]}</td>

                <td>${item["Store Name"]}</td>

                <td>${(target*100).toFixed(2)}%</td>

                <td style="color:#dc2626;font-weight:700;">
                    ${missing}
                </td>

                <td style="color:#2563eb;font-weight:700;">
                    ${extra}
                </td>

                <td>${totalSku}</td>

                <td>

                    <div style="display:flex;align-items:center;gap:12px;">

                        <div style="
                            width:130px;
                            height:10px;
                            background:#ececec;
                            border-radius:30px;
                            overflow:hidden;
                        ">

                            <div style="
                                width:${accuracy*100}%;
                                background:${color};
                                height:100%;
                            ">

                            </div>

                        </div>

                        <b style="color:${color};">

                            ${(accuracy*100).toFixed(2)}%

                        </b>

                    </div>

                </td>

            </tr>

            `;

        }).join("")}

        </tbody>

    </table>

    `;

}


// ==========================================
// INCENTIVE
// ==========================================

function renderIncentive(){

    tableContent.innerHTML = `

    <table class="stock-table">

        <thead>

            <tr>

                <th>No</th>
                <th>Store Code</th>
                <th>Store Name</th>

                <th>1st Criteria</th>
                <th>Audit Required</th>
                <th>Final ST Incentive</th>
                <th>Incentive Amount</th>

            </tr>

        </thead>

        <tbody>

        ${filteredData.map((item,index)=>{

            const meet = item["Meet 1st Criteria?"];

            const audit = item["Require for Audit to Final ST Incentive?"];

            const incentive = Number(item["Incentive Amount"]) || 0;

            const finalIncentive = Number(item["Final % ST Incentive"]) || 0;

            return `

            <tr>

                <td>${index+1}</td>

                <td>${item["Store Code"]}</td>

                <td>${item["Store Name"]}</td>

                <td>

                    <span style="
                        padding:6px 12px;
                        border-radius:20px;
                        font-size:12px;
                        font-weight:700;
                        background:${meet=="Yes" ? "#dcfce7" : "#fee2e2"};
                        color:${meet=="Yes" ? "#166534" : "#991b1b"};
                    ">

                        ${meet=="Yes" ? "PASS" : "FAIL"}

                    </span>

                </td>

                <td>

                    <span style="
                        padding:6px 12px;
                        border-radius:20px;
                        font-size:12px;
                        font-weight:700;
                        background:${audit=="Yes" ? "#fef3c7" : "#dcfce7"};
                        color:${audit=="Yes" ? "#92400e" : "#166534"};
                    ">

                        ${audit=="Yes" ? "YES" : "NO"}

                    </span>

                </td>

                <td>

                    ${(finalIncentive*100).toFixed(0)}%

                </td>

                <td style="font-weight:700;">

                    ${formatCurrency(incentive)}

                </td>

            </tr>

            `;

        }).join("")}

        </tbody>

    </table>

    `;

}


// ==========================================
// AUDIT
// ==========================================

function renderAudit(){

    tableContent.innerHTML = `

    <table class="stock-table">

        <thead>

            <tr>

                <th>No</th>
                <th>Store Code</th>
                <th>Store Name</th>

                <th>%100 SKU Check</th>

            </tr>

        </thead>

        <tbody>

        ${filteredData.map((item,index)=>{

            const audit = (Number(item["%100 SKU Check"]) || 0) * 100;

            const color = audit >= 80
                ? "#22c55e"
                : "#ef4444";

            return `

            <tr>

                <td>${index+1}</td>

                <td>${item["Store Code"]}</td>

                <td>${item["Store Name"]}</td>

                <td>

                    <div style="display:flex;align-items:center;gap:12px;">

                        <div style="
                            width:130px;
                            height:10px;
                            background:#ececec;
                            border-radius:30px;
                            overflow:hidden;
                        ">

                            <div style="
                                width:${audit}%;
                                background:${color};
                                height:100%;
                            ">

                            </div>

                        </div>

                        <b style="color:${color};">

                            ${audit.toFixed(2)}%

                        </b>

                    </div>

                </td>

            </tr>

            `;

        }).join("")}

        </tbody>

    </table>

    `;

}


// ==========================================
// =======================================
// LOAD DATA
// =======================================

async function loadData(){

    try{

        const res = await fetch(API_BASE + "?action=stresult");

        stockData = await res.json();

        // Tambahkan ini
        filteredData = [...stockData];

        updateSummaryCards();

        renderGeneral();

    }

    catch(err){

        console.error(err);

        alert("Gagal mengambil data ST Result.");

    }

}
async function loadSchedule(){

    try{

        const res = await fetch(API_BASE + "?action=schedule");

        scheduleData = await res.json();

        renderSchedule();

    }

    catch(err){

        console.error(err);

        alert("Gagal mengambil data ST Schedule.");

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

stockData.forEach(item => {

    const value = parseFloat(item["Incentive Amount"]);

    if (!isNaN(value)) {

        incentive += Math.floor(value);

    }

});

document.getElementById("totalIncentive").innerText =
formatCurrency(incentive);

}
function formatCurrency(value){

    if(value == null || value === "") return "-";

    return new Intl.NumberFormat("id-ID",{
        style:"currency",
        currency:"IDR",
        minimumFractionDigits:0,
        maximumFractionDigits:0
    }).format(Math.trunc(Number(value)));

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
function formatMonthYear(date){

    if(!date) return "-";

    const d = new Date(date);

    const bulan = [
        "Januari","Februari","Maret","April","Mei","Juni",
        "Juli","Agustus","September","Oktober","November","Desember"
    ];

    return `${bulan[d.getMonth()]} ${d.getFullYear()}`;

}
function renderSchedule(){
    const today = new Date();
today.setHours(0,0,0,0);

const sortedSchedule = [...scheduleData].sort((a,b)=>{

    const dateA = new Date(a["2026 ST Schedule"]);
    const dateB = new Date(b["2026 ST Schedule"]);

    dateA.setHours(0,0,0,0);
    dateB.setHours(0,0,0,0);

    const diffA = Math.ceil((dateA - today)/(1000*60*60*24));
    const diffB = Math.ceil((dateB - today)/(1000*60*60*24));

    // Jadwal yang belum lewat di atas, yang sudah selesai di bawah
    if(diffA < 0 && diffB >= 0) return 1;
    if(diffA >= 0 && diffB < 0) return -1;

    return diffA - diffB;

});

    tableContent.innerHTML = `

    <table class="stock-table">

        <thead>

            <tr>

                <th>No</th>
                <th>Old Store</th>
                <th>New Store</th>
                <th>Store Name</th>
                <th>Type</th>
                <th>ABM</th>
                <th>2025 ST Schedule</th>
                <th>2026 ST Schedule</th>
                <th>Period</th>
                <th>SO Date</th>
                <th>Remarks</th>

            </tr>

        </thead>

        <tbody>

        ${sortedSchedule.map((item,index)=>{

            let typeColor="#64748b";

            switch(item["Type"]){

                case "NS":
                    typeColor="#3b82f6";
                    break;

                case "RS":
                    typeColor="#22c55e";
                    break;

                case "Relocation":
                    typeColor="#f59e0b";
                    break;

                case "Closure":
                    typeColor="#ef4444";
                    break;

            }
            const today = new Date();

today.setHours(0,0,0,0);

const scheduleDate = new Date(item["2026 ST Schedule"]);

scheduleDate.setHours(0,0,0,0);

const diffTime = scheduleDate - today;

const diffDays = Math.ceil(diffTime / (1000*60*60*24));

let remarks = "";

if(diffDays < 0){

    remarks = `
        <span class="badge-complete">
            ✔ Complete
        </span>
    `;

}
else if(diffDays === 0){

    remarks = `
        <span class="badge-today">
            Today
        </span>
    `;

}
else{

    remarks = `
        <span class="badge-pending">
            ${diffDays} Days Left
        </span>
    `;

}

            return `

            <tr>

                <td>${index+1}</td>

                <td>${item["Old Store Code"]||"-"}</td>

                <td>${item["New Store Code"]||"-"}</td>

                <td>${item["Store Name"]||"-"}</td>

                <td>

                    <span style="
                        background:${typeColor};
                        color:#fff;
                        padding:5px 10px;
                        border-radius:20px;
                        font-size:12px;
                        font-weight:600;
                    ">

                        ${item["Type"]||"-"}

                    </span>

                </td>

                <td>${item["ABM"]||"-"}</td>

                <td>${formatDate(item["2025 ST Schedule"])}</td>

                <td>${formatDate(item["2026 ST Schedule"])}</td>

                <td>${item["Period"]||"-"}</td>

                <td>${formatDate(item["SO Date"])}</td>
                <td>${remarks}</td>

            </tr>

            `;

        }).join("")}

        </tbody>

    </table>

    `;

}function formatDate(date){

    if(!date) return "-";

    const d = new Date(date);

    if(isNaN(d)) return date;

    return d.toLocaleDateString("id-ID",{

        day:"2-digit",

        month:"short",

        year:"numeric"

    });

}
// ==========================================
// MAIN MENU
// ==========================================

const mainButtons = document.querySelectorAll(".main-tab-btn");

mainButtons.forEach(btn=>{

    btn.addEventListener("click",()=>{

        document.querySelector(".main-tab-btn.active")
        .classList.remove("active");

        btn.classList.add("active");

        const menu = btn.dataset.main;

        switch(menu){

            case "result":

                document.querySelector(".sub-tabs").style.display="block";

                renderGeneral();

                break;

            case "lossdetail":

                document.querySelector(".sub-tabs").style.display="none";

                tableContent.innerHTML=`
                    <h2 style="padding:30px;text-align:center;">
                        🚧 Stock Loss Detail (Coming Soon)
                    </h2>
                `;

                break;

            case "schedule":

                document.querySelector(".sub-tabs").style.display="none";

                loadSchedule();

                break;

        }

    });

});
// ==========================================
// MAIN TAB MENU
// ==========================================

const mainTabButtons = document.querySelectorAll(".main-tab-btn");

mainTabButtons.forEach(btn=>{

    btn.addEventListener("click",()=>{

        document.querySelector(".main-tab-btn.active")
        .classList.remove("active");

        btn.classList.add("active");

        const menu = btn.dataset.main;

        if(menu=="result"){

            document.getElementById("stResultTabs").style.display="block";

            renderGeneral();

        }

        else if(menu=="lossdetail"){

            document.getElementById("stResultTabs").style.display="none";

            renderStockLoss();

        }

        else if(menu=="schedule"){

            document.getElementById("stResultTabs").style.display="none";

            loadSchedule();

        }

    });

});
function renderStockLoss(){

    tableContent.innerHTML=`

        <div style="
            padding:80px;
            text-align:center;
            font-size:22px;
            font-weight:600;
            color:#888;
        ">

            🚧 Stock Loss Detail
            <br><br>

            Coming Soon

        </div>

    `;

}
// ==========================================
// TODAY DATE & TIME
// ==========================================

function updateToday(){

    const now = new Date();

    const dateOptions = {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
    };

    const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    };

    document.getElementById("todayDate").innerHTML =
        now.toLocaleDateString("id-ID", dateOptions);

    document.getElementById("todayTime").innerHTML =
        now.toLocaleTimeString("id-ID", timeOptions);

}

updateToday();

setInterval(updateToday,1000);

const searchInput = document.getElementById("searchStore");

searchInput.addEventListener("input", function () {

    const keyword = this.value.toLowerCase().trim();

    filteredData = stockData.filter(item => {

        const code = (item["Store Code"] || "").toLowerCase();
        const name = (item["Store Name"] || "").toLowerCase();

        return code.includes(keyword) || name.includes(keyword);

    });

    switch(activeTab){

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

        case "schedule":
            renderSchedule();
            break;

    }

});