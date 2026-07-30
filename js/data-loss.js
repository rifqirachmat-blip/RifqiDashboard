/* ==========================================
   DATA LOSS
========================================== */

console.log("data-loss.js loaded");

/* ==========================================
   CONFIG
========================================== */

const API_BASE =
"https://script.google.com/macros/s/AKfycbxkRUqtmj7SqIMEZkwdJ6xha31uZ-a429dm4Pp7D0ETEsbD8vpfKKji-Ays4wsctnh9/exec";

/* ==========================================
   GLOBAL
========================================== */

let storeList = [];

const searchInput =
document.getElementById("searchLoss");

const suggestionBox =
document.getElementById("lossSuggestion");

const content =
document.getElementById("lossContent");

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
   LOAD STORE
========================================== */

async function loadStoreList(){

    try{

        showLoading();

        const res =
            await fetch(
                API_BASE + "?action=stores"
            );

        const json =
            await res.json();

        if(!json.success){

            throw new Error(json.message);

        }

        storeList =
            json.stores;

        console.log(storeList);

    }

    catch(err){

        console.error(err);

        alert("Gagal mengambil daftar store.");

    }

    finally{

        hideLoading();

    }

}

loadStoreList();
/* ==========================================
   SEARCH STORE
========================================== */

searchInput.addEventListener("input", function(){

    const keyword =
        this.value
            .trim()
            .toLowerCase();

    suggestionBox.innerHTML = "";

    if(keyword===""){

        suggestionBox.style.display="none";

        return;

    }

    const result =
        storeList.filter(store=>

            store
                .toLowerCase()
                .includes(keyword)

        );

    result.forEach(store=>{

        const div =
            document.createElement("div");

        div.className =
            "suggestion-item";

        div.innerHTML =
            store;

        div.onclick = function(){

            searchInput.value =
                store;

            suggestionBox.style.display =
                "none";

            loadDataLoss(store);

        };

        suggestionBox.appendChild(div);

    });

    suggestionBox.style.display =
        result.length
            ? "block"
            : "none";

});

/* ==========================================
   HIDE SUGGESTION
========================================== */

document.addEventListener("click",function(e){

    if(

        !searchInput.contains(e.target) &&
        !suggestionBox.contains(e.target)

    ){

        suggestionBox.style.display="none";

    }

});
/* ==========================================
   LOAD DATA LOSS
========================================== */

async function loadDataLoss(store){

    try{

        showLoading();

        const res = await fetch(

            API_BASE +
            "?action=dataloss&store=" +
            encodeURIComponent(store)

        );

        const json = await res.json();

        console.log(json);

        if(!json.success){

            content.innerHTML = `
                <div class="table-box">
                    <div style="padding:40px;text-align:center;color:red;">
                        ${json.message}
                    </div>
                </div>
            `;

            return;

        }

        renderDataLoss(json);

    }

    catch(err){

        console.error(err);

        content.innerHTML = `
            <div class="table-box">
                <div style="padding:40px;text-align:center;color:red;">
                    Gagal mengambil data.
                </div>
            </div>
        `;

    }

    finally{

        hideLoading();

    }

}
/* ==========================================
   FORMAT NUMBER
========================================== */

function formatMoney(value){

    const num = Number(value);

    if(isNaN(num)) return value;

    return "Rp " + (num * 1000000).toLocaleString("id-ID");

}
function formatMoneyMixed(value){

    if(value === null || value === "") return "";

    value = String(value).trim();

    // contoh: 10.749142 (0.18%)
    const m = value.match(/^([\d.]+)\s*\((.*?)\)$/);

    if(m){

        const nominal = Number(m[1]) * 1000000;

        return "Rp " +
            nominal.toLocaleString("id-ID") +
            " (" + m[2] + ")";

    }

    // angka biasa
    if(!isNaN(Number(value))){

        return formatMoney(value);

    }

    return value;

}

/* ==========================================
   FORMAT VALUE
   contoh:
   0.4 (0.10%)
   578.19 (0.11%)
========================================== */

function formatMixedValue(value){

    if(value===null || value==="") return "";

    value = String(value);

    if(!value.includes("("))
        return formatMoney(value);

    const match = value.match(/^([\d.-]+)\s*\((.+)\)$/);

    if(!match) return value;

    return `${formatMoney(match[1])} (${match[2]})`;

}

/* ==========================================
   SUMMARY FORMAT
========================================== */

function formatSummaryValue(value,index){

    if(value==="" || value==null) return "";

    const text = String(value);

    // kolom persen
    if(text.includes("%"))
        return text;

    // kolom net loss / missing
    if(text.includes("("))
        return formatMixedValue(text);

    // angka biasa
    if(!isNaN(Number(text)))
        return formatMoney(text);

    return text;

}
/* ==========================================
   RENDER DATA LOSS
========================================== */

function renderDataLoss(data){

    let html = "";

    /* =====================================
       TABLE
    ===================================== */

    html += `
    <div class="table-box">

        <table class="stock-table">
    `;

    data.table.forEach((row,index)=>{

        // HEADER
        if(index===0){

            html += "<thead><tr>";

            row.forEach(col=>{

                html += `<th>${col}</th>`;

            });

            html += "</tr></thead><tbody>";

            return;

        }

        // Skip row kosong (bulan yg belum ada data)
        const hasValue =
            row.slice(1).some(v=>String(v).trim()!="");

        if(!hasValue && row[0]!="Total"){

            return;

        }

        const isTotal =
            row[0]==="Total";

        html += `<tr ${isTotal ? 'class="total-row"' : ""}>`;

        row.forEach((col,colIndex)=>{

            let value = col;

            if(colIndex>0){

                value = formatMixedValue(col);

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

    /* =====================================
       SUMMARY
    ===================================== */

    html += `<br><br>`;

    html += `

    <div class="table-box">

    <table class="stock-table">

    <thead>

<tr>

    <th rowspan="2">Store Name</th>

    <th rowspan="2">LY ST Date</th>

    <th rowspan="2">TY ST Date</th>

    <th rowspan="2">Period of Sales</th>

    <th rowspan="2">Actual Sales - PPN 10%</th>

    <th rowspan="2">Avrg Monthly Sales</th>
        <th colspan="5" style="text-align:center">
            Before ST
        </th>

        <th rowspan="2">Net Loss</th>

        <th rowspan="2">Target % Missing</th>

        <th rowspan="2">% Missing</th>

        <th rowspan="2">Incentive Amt</th>

    </tr>

    <tr>

        <th>DMO</th>
        <th>DMC</th>
        <th>DMP</th>
        <th>MS</th>
        <th>EX</th>

    </tr>

    </thead>

    <tbody>
    `;

    data.summary.forEach((row,index)=>{

        // Skip header bawaan spreadsheet
        if(index<2) return;

        html += "<tr>";

        row.forEach((col,colIndex)=>{

            let value = col;

            // 6 kolom pertama jangan diformat
if(colIndex <= 5){

    // Avg Monthly Sales (index 5)
    if(colIndex === 5 && !isNaN(Number(col))){

        value = formatMoney(col);

    }

    html += `<td>${value}</td>`;

    return;

}

            

            // Kolom nominal setelah Avg Monthly Sales
if(colIndex >= 6){

    value = formatMoneyMixed(col);

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
   DATE
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