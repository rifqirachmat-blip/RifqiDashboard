console.log("keepstock.js loaded");

/* ==========================================
   CONFIG
========================================== */

const API_BASE =
"https://script.google.com/macros/s/AKfycbwM5keESxhCGfnZjlvUlwm9gPHqvWqu3qgSzmK7xIHNSJxWz-KkE3kFQ6TKhGKKDLm2/exec";

/* ==========================================
   ELEMENT
========================================== */

const content =
document.getElementById("keepstockContent");

const loading =
document.getElementById("loadingOverlay");

/* ==========================================
   GLOBAL
========================================== */

let keepstockData = [];
let keepstockHeader = [];

/* ==========================================
   LOADING
========================================== */

function showLoading(){

    loading.style.display = "flex";

}

function hideLoading(){

    loading.style.display = "none";

}

/* ==========================================
   CLOCK
========================================== */

function updateClock(){

    const now = new Date();

    document.getElementById("todayDate").innerHTML =
    now.toLocaleDateString("id-ID",{

        weekday:"long",
        day:"2-digit",
        month:"long",
        year:"numeric"

    });

    document.getElementById("todayTime").innerHTML =
    now.toLocaleTimeString("id-ID");

}

updateClock();

setInterval(updateClock,1000);
/* ==========================================
   LOAD DATA
========================================== */

async function loadKeepstock(){

    try{

        showLoading();

        const response = await fetch(

            API_BASE + "?action=keepstock"

        );

        const data = await response.json();

        console.log(data);

        if(!data.success){

            content.innerHTML = `

            <div class="table-box">

                <div style="padding:60px;text-align:center;color:red;">

                    ${data.message}

                </div>

            </div>

            `;

            return;

        }

        keepstockHeader = data.header;

        keepstockData = data.rows;

        renderKeepstock();

    }

    catch(err){

        console.error(err);

        content.innerHTML = `

        <div class="table-box">

            <div style="padding:60px;text-align:center;color:red;">

                Failed Load Data

            </div>

        </div>

        `;

    }

    finally{

        hideLoading();

    }

}
/* ==========================================
   RENDER
========================================== */

function renderKeepstock(){

    /* ==========================
       KPI
    ========================== */

    document.getElementById("totalStore").innerHTML =
        keepstockData.length;

    let totalKeep = 0;
    let totalMinus = 0;
    let totalWrongSku = 0;

    keepstockData.forEach(row=>{

        totalKeep += Number(row[2]) || 0;
        totalMinus += Number(row[3]) || 0;
        totalWrongSku += Number(row[4]) || 0;

    });

    document.getElementById("totalKeep").innerHTML =
        totalKeep.toLocaleString("id-ID");

    document.getElementById("totalMinus").innerHTML =
        totalMinus.toLocaleString("id-ID");

    document.getElementById("totalWrongSku").innerHTML =
        totalWrongSku.toLocaleString("id-ID");

    /* ==========================
       TABLE
    ========================== */

    let html = `
    <div class="table-box">

        <table class="stock-table">

            <thead>

                <tr>
    `;

    keepstockHeader.forEach(col=>{

        html += `<th>${col}</th>`;

    });

    html += `
                </tr>

            </thead>

            <tbody>
    `;

    keepstockData.forEach(row=>{

        html += "<tr>";

        row.forEach((col,index)=>{

            let value = col;

            /* ==========================
   LAST UPDATE
========================== */

if(index===1){

    const updateDate = new Date(col);

    if(!isNaN(updateDate)){

        const today = new Date();

        today.setHours(0,0,0,0);
        updateDate.setHours(0,0,0,0);

        const diff =
            Math.floor(
                (today-updateDate)/
                (1000*60*60*24)
            );

        let color = "#16a34a";

        if(diff>=3 && diff<=7){

            color = "#eab308";

        }

        if(diff>7){

            color = "#dc2626";

        }

        value = `

        <div class="last-update">

            <div class="update-date">

                ${updateDate.toLocaleDateString("id-ID",{

                    day:"2-digit",
                    month:"long",
                    year:"numeric"

                })}

            </div>

            <div class="update-day"

                 style="color:${color}">

                ${diff} hari yang lalu

            </div>

        </div>

        `;

    }

}

            /* ==========================
   QTY MINUS
========================== */

if(index===3){

    const num = Number(col) || 0;

    value =
    num===0
    ? `<span class="badge-ok">
            <i class="fa-solid fa-check"></i>
       </span>`
    : `<span class="badge-danger">
            ${num}
       </span>`;

}

/* ==========================
   WRONG SKU
========================== */

if(index===4){

    const num = Number(col) || 0;

    value =
    num===0
    ? `<span class="badge-ok">
            <i class="fa-solid fa-check"></i>
       </span>`
    : `<span class="badge-danger">
            ${num}
       </span>`;

}

/* ==========================
   WRONG RACK
========================== */

if(index===5){

    const num = Number(col) || 0;

    value =
    num===0
    ? `<span class="badge-ok">
            <i class="fa-solid fa-check"></i>
       </span>`
    : `<span class="badge-danger">
            ${num}
       </span>`;

}
// Remarks
if(index===8){

    const remark =
    String(col).toLowerCase();

    if(remark.includes("meet")){

        value =
        `<span class="badge-meet">
            Meet Criteria
        </span>`;

    }else{

        value =
        `<span class="badge-nope">
            Nope
        </span>`;

    }

}
html += `<td>${value}</td>`;

        });

        html += "</tr>";

    });

    html += `
            </tbody>

        </table>

    </div>
    `;

    content.innerHTML = html;

}
/* ==========================================
   SEARCH
========================================== */

function initSearch(){

    const input =
    document.getElementById("searchKeepstock");

    if(!input) return;

    input.onkeyup = function(){

        const keyword =
        this.value.toLowerCase().trim();

        const rows =
        document.querySelectorAll(".stock-table tbody tr");

        rows.forEach(row=>{

            const store =
            row.cells[0].innerText.toLowerCase();

            row.style.display =
            store.includes(keyword)
            ? ""
            : "none";

        });

    };

}

/* ==========================================
   START
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

    loadKeepstock();

});

/* ==========================================
   AFTER RENDER
========================================== */

const oldRender = renderKeepstock;

renderKeepstock = function(){

    oldRender();

    initSearch();

};
/* ==========================================
   COPY REPORT WHATSAPP
========================================== */

async function copyKeepstockReport(){

    if(!keepstockData || keepstockData.length === 0){

        alert("Belum ada data Keepstock.");

        return;

    }


    let report = "";

    report += "Report Keepstock\n";
    report += "BM Rifqi DR\n\n";


    keepstockData.forEach((row, index)=>{

        const store =
            String(row[0] || "-").trim();

        const lastUpdate =
            row[1]
            ? new Date(row[1])
            : null;

        const keepstock =
            Number(row[2]) || 0;

        const qtyMinus =
            Number(row[3]) || 0;

        const wrongSku =
            Number(row[4]) || 0;

        const wrongRack =
            Number(row[5]) || 0;



        /* ==========================================
           FORMAT LAST UPDATE
        ========================================== */

        let lastUpdateText = "-";

        if(
            lastUpdate &&
            !isNaN(lastUpdate.getTime())
        ){

            lastUpdateText =
                lastUpdate.toLocaleDateString(
                    "id-ID",
                    {
                        day:"2-digit",
                        month:"long",
                        year:"numeric"
                    }
                );

        }


        /* ==========================================
           STORE
        ========================================== */

        report += `${store}\n`;


        /* ==========================================
           1. ZERO KEEPSTOCK
        ========================================== */

        if(keepstock > 0){

            report +=
                `1. Zero Keepstock : No Submit (ada KS ${keepstock.toLocaleString("id-ID")} Box)\n`;

        }
        else{

            report +=
                `1. Zero Keepstock : Clear\n`;

        }


        /* ==========================================
           2. NO SUBMISSION
        ========================================== */

        /*
           Untuk sementara kita mengikuti
           kondisi Keepstock.

           Kalau Keepstock = 0 dianggap
           sudah clear.
        */

        if(keepstock === 0){

            report +=
                `2. No submission : Clear, sudah submit\n`;

        }
        else{

            report +=
                `2. No submission : Clear, sudah submit\n`;

        }


        /* ==========================================
           3. WRONG SKU
        ========================================== */

        if(wrongSku === 0){

            report +=
                `3. Wrong SKU : Clear, sudah di cek tidak ada\n`;

        }
        else{

            report +=
                `3. Wrong SKU : Ada ${wrongSku} SKU\n`;

        }


        /* ==========================================
           4. WRONG INPUT QTY
        ========================================== */

        if(qtyMinus === 0){

            report +=
                `4. Wrong Input Qty : Clear, tidak ada minus, tidak ada typo\n`;

        }
        else{

            report +=
                `4. Wrong Input Qty : Ada ${qtyMinus} item minus\n`;

        }


        /* ==========================================
           5. NO UPDATE > 14 DAYS
        ========================================== */

        let diffDays = 0;

        if(
            lastUpdate &&
            !isNaN(lastUpdate.getTime())
        ){

            const today =
                new Date();

            today.setHours(
                0,0,0,0
            );

            const update =
                new Date(lastUpdate);

            update.setHours(
                0,0,0,0
            );

            diffDays =
                Math.floor(
                    (
                        today - update
                    ) /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    )
                );

        }


        if(diffDays > 14){

            report +=
                `5. No Update > 14 Days : Need Attention, last update = ${lastUpdateText}\n`;

        }
        else{

            report +=
                `5. No Update > 14 Days : Clear, last update = ${lastUpdateText}\n`;

        }


        /* ==========================================
           REMARKS
        ========================================== */


        report += "\n";

    });

    /* ==========================================
       COPY
    ========================================== */

    try{

        await navigator.clipboard.writeText(
            report
        );

        alert(
            "Report Keepstock berhasil di-copy. Tinggal paste ke WhatsApp 👍"
        );

    }
    catch(error){

        console.error(error);

        /*
           Fallback untuk browser yang
           tidak mengizinkan clipboard API.
        */

        const textarea =
            document.createElement("textarea");

        textarea.value =
            report;

        textarea.style.position =
            "fixed";

        textarea.style.left =
            "-9999px";

        document.body.appendChild(
            textarea
        );

        textarea.select();

        document.execCommand(
            "copy"
        );

        document.body.removeChild(
            textarea
        );

        alert(
            "Report Keepstock berhasil di-copy 👍"
        );

    }

}