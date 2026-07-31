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

            // Last Update
            if(index===1 && col){

                const d = new Date(col);

                if(!isNaN(d)){

                    value = d.toLocaleDateString(
                        "id-ID",
                        {
                            day:"2-digit",
                            month:"short",
                            year:"numeric"
                        }
                    );

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