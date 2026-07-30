console.log("keepstock.js loaded");

/* ==========================================
   CONFIG
========================================== */

const API_BASE =
"https://script.google.com/macros/s/AKfycbyvhWky7msJ3FqhrZ4F_fvK9OSnF08ToWL9jzCAbmTYGA8ZXCToAUc_Wl42yOAGno0iLA/exec";

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