console.log("manpower.js loaded");

/* ==========================================
   CONFIG
========================================== */
/* ==========================================
   GLOBAL
========================================== */

let manpowerData = [];
let manpowerHeader = [];

const activeFilter = {};

const API_BASE =
"https://script.google.com/macros/s/AKfycbyvhWky7msJ3FqhrZ4F_fvK9OSnF08ToWL9jzCAbmTYGA8ZXCToAUc_Wl42yOAGno0iLA/exec";

/* ==========================================
   ELEMENT
========================================== */

const content =
document.getElementById("manpowerContent");

const loading =
document.getElementById("loadingOverlay");

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

async function loadManpower(){

    try{

        showLoading();

        const response = await fetch(

            API_BASE + "?action=manpower"

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

        manpowerData = data.rows;
manpowerHeader = data.header;

renderManpower({
    header: manpowerHeader,
    rows: manpowerData
});

    }

    catch(error){

        console.error(error);

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
   KPI
========================================== */

/* ==========================================
   KPI
========================================== */

function calculateKPI(rows){

    let totalHC = rows.length;

    let permanent = 0;

    let oneYearRemaining = 0;

    let newEmployee = 0;

    rows.forEach(row=>{

        // Working Periode (kolom H)
        const working = row[7];

        // Contract Remaining (kolom I)
        const remaining = row[8];

        // Permanent
        if(row[6] === "Permanent"){

            permanent++;

        }

        /* ==========================
           New Employee
           (< 1 tahun bekerja)
        ========================== */

        const workYear = parseInt(working);

        if(!isNaN(workYear) && workYear < 1){

            newEmployee++;

        }

        /* ==========================
           Remaining Contract
           (<= 1 tahun)
        ========================== */

        if(remaining !== "Permanent"){

            const remainYear = parseInt(remaining);

            if(!isNaN(remainYear) && remainYear <= 1){

                oneYearRemaining++;

            }

        }

    });

    document.getElementById("totalHC").innerHTML =
        totalHC;

    document.getElementById("permanentHC").innerHTML =
        permanent;

    document.getElementById("contractHC").innerHTML =
        oneYearRemaining;

    document.getElementById("expiredHC").innerHTML =
        newEmployee;

}
/* ==========================================
   RENDER TABLE
========================================== */

function renderManpower(data){

    calculateKPI(data.rows);

    let html = `
    <div class="table-box">

        <table class="stock-table">

            <thead>

                <tr>
    `;

    data.header.forEach((col,index)=>{

    html += `
    <th>

        <div class="header-filter">

            <span>${col}</span>

            <select
                class="column-filter"
                data-column="${index}">

                <option value="">All</option>

            </select>

        </div>

    </th>
    `;

});

    html += `
                </tr>

            </thead>

            <tbody>
    `;

    data.rows.forEach((row,index)=>{

        html += `<tr class="${index%2==0?"even":"odd"}">`;

        row.forEach((col,colIndex)=>{

            let value = col;

            /* =========================
               JOIN DATE
            ========================= */

            if(colIndex===5 && col){

                const d = new Date(col);

                if(!isNaN(d)){

                    value = d.toLocaleDateString("id-ID",{

                        day:"2-digit",
                        month:"short",
                        year:"numeric"

                    });

                }

            }

            /* =========================
               END CONTRACT
            ========================= */

            if(colIndex===6 && col!=="Permanent"){

                const d = new Date(col);

                if(!isNaN(d)){

                    value = d.toLocaleDateString("id-ID",{

                        day:"2-digit",
                        month:"short",
                        year:"numeric"

                    });

                }

            }

            /* =========================
               CONTRACT REMAINING
            ========================= */

            if(colIndex===8){

                if(col==="Permanent"){

                    value =
                    `<span class="badge-permanent">
                        Permanent
                    </span>`;

                }

                else{

                    const year =
                        parseInt(col);

                    if(!isNaN(year)){

                        if(year>=3){

                            value =
                            `<span class="badge-green">
                                ${col}
                            </span>`;

                        }

                        else if(year>=2){

                            value =
                            `<span class="badge-yellow">
                                ${col}
                            </span>`;

                        }

                        else if(year>=1){

                            value =
                            `<span class="badge-orange">
                                ${col}
                            </span>`;

                        }

                        else{

                            value =
                            `<span class="badge-red">
                                ${col}
                            </span>`;

                        }

                    }

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
    buildFilters();

    initSearch();

}
function initSearch(){

    const input =
    document.getElementById("searchEmployee");

    if(!input) return;

    input.onkeyup = function(){

        const keyword =
        this.value.toLowerCase().trim();

        const rows =
        document.querySelectorAll(".stock-table tbody tr");

        rows.forEach(row=>{

            let visible = true;

            // Search nama
            const employee =
            row.cells[0].innerText.toLowerCase();

            if(!employee.includes(keyword)){

                visible = false;

            }

            // Filter kolom
            Object.keys(activeFilter).forEach(col=>{

                const filter =
                activeFilter[col];

                if(filter==="") return;

                const value =
                row.cells[col].innerText.trim();

                if(value !== filter){

                    visible = false;

                }

            });

            row.style.display =
            visible ? "" : "none";

        });

    };

}
/* ==========================================
   BUILD FILTER
========================================== */

function buildFilters(){

    document
    .querySelectorAll(".column-filter")
    .forEach(select=>{

        const col =
        Number(select.dataset.column);

        const values =
        [...new Set(

            manpowerData.map(r=>r[col])

        )].sort();

        values.forEach(v=>{

            const opt =
            document.createElement("option");

            opt.value = v;
            opt.textContent = v;

            select.appendChild(opt);

        });

        select.onchange = function(){

            activeFilter[col] =
            this.value;

            applyFilters();

        };

    });

}
/* ==========================================
   APPLY FILTER
========================================== */

function applyFilters(){

    const rows =
    document.querySelectorAll(".stock-table tbody tr");

    rows.forEach(row=>{

        let visible = true;

        Object.keys(activeFilter).forEach(col=>{

            const filter =
            activeFilter[col];

            if(filter==="") return;

            const value =
            row.cells[col].innerText.trim();

            if(value !== filter){

                visible = false;

            }

        });

        row.style.display =
            visible ? "" : "none";

    });

}

/* ==========================================
   START
========================================== */

loadManpower();
/* ==========================================
   SEARCH EMPLOYEE
========================================== */

document.addEventListener("input",function(e){

    if(e.target.id!=="searchEmployee") return;

    const keyword =
        e.target.value.toLowerCase();

    document
    .querySelectorAll(".stock-table tbody tr")
    .forEach(row=>{

        const text =
            row.innerText.toLowerCase();

        row.style.display =
            text.includes(keyword)
            ? ""
            : "none";

    });

});