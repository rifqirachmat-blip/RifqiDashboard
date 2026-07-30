/* ==========================================
   CONFIG
========================================== */

const API_BASE =
"https://script.google.com/macros/s/AKfycbxkRUqtmj7SqIMEZkwdJ6xha31uZ-a429dm4Pp7D0ETEsbD8vpfKKji-Ays4wsctnh9/exec";

let storeList = [];

const searchInput = document.getElementById("searchLoss");
const suggestionBox = document.getElementById("lossSuggestion");
const content = document.getElementById("lossContent");
const loading = document.getElementById("loadingLoss");


/* ==========================================
   LOADING
========================================== */

function showLoading(){

    loading.style.display = "block";

}

function hideLoading(){

    loading.style.display = "none";

}


/* ==========================================
   LOAD STORE LIST
========================================== */

async function loadStoreList(){

    try{

        showLoading();

        const res = await fetch(API_BASE + "?action=stores");

        const json = await res.json();

        storeList = json.stores || [];

        console.log(storeList);

    }

    catch(err){

        console.error(err);

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

    const keyword = this.value.trim().toLowerCase();

    suggestionBox.innerHTML = "";

    if(keyword===""){

        suggestionBox.style.display="none";

        return;

    }

    const result = storeList.filter(store=>

        store.toLowerCase().includes(keyword)

    );

    result.slice(0,8).forEach(store=>{

        const div=document.createElement("div");

        div.className="suggestion-item";

        div.innerHTML=store;

        div.onclick=function(){

            searchInput.value=store;

            suggestionBox.style.display="none";

            loadDataLoss(store);

        };

        suggestionBox.appendChild(div);

    });

    suggestionBox.style.display=result.length?"block":"none";

});


document.addEventListener("click",function(e){

    if(!suggestionBox.contains(e.target) && e.target!==searchInput){

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
            "?action=datalossdetail&store=" +
            encodeURIComponent(store)

        );

        const json = await res.json();

        if(!json.success){

    content.innerHTML = json.message;
    return;

}

renderDataLoss(json);

    }

    catch(err){

        console.error(err);

    }

    finally{

        hideLoading();

    }

}


/* ==========================================
   RENDER
========================================== */

function renderDataLoss(data){

    let html="";

    /* ===========================
       TABLE
    =========================== */

    html+=`
    <div class="table-box">

        <table class="stock-table">
    `;

    data.table.forEach((row,index)=>{

        if(index===0){

            html+="<thead><tr>";

            row.forEach(col=>{

                html+=`<th>${col}</th>`;

            });

            html+="</tr></thead><tbody>";

        }

        else{

            const total=row[0]==="Total";

            html+=`
            <tr ${total?'class="total-row"':""}>
            `;

            row.forEach(col=>{

                html+=`<td>${col}</td>`;

            });

            html+="</tr>";

        }

    });

    html+=`
        </tbody>
        </table>

    </div>
    `;


    html+="<br><br>";


    /* ===========================
       SUMMARY
    =========================== */

    html+=`
    <div class="table-box">

        <table class="stock-table">
    `;

    data.summary.forEach((row,index)=>{

        if(index===1){

            html+="<thead><tr>";

            row.forEach(col=>{

                html+=`<th>${col}</th>`;

            });

            html+="</tr></thead><tbody>";

        }

        else{

            html+="<tr>";

            row.forEach(col=>{

                html+=`<td>${col}</td>`;

            });

            html+="</tr>";

        }

    });

    html+=`
        </tbody>
        </table>

    </div>
    `;

    content.innerHTML=html;

}
function renderDataLoss(data){

    let html = `
    <div class="table-box">
        <table class="stock-table">
    `;

    // Header
    html += "<thead><tr>";

    data.table[0].forEach(col=>{

        html += `<th>${col}</th>`;

    });

    html += "</tr></thead>";

    // Body
    html += "<tbody>";

    for(let i=1;i<data.table.length;i++){

        html += "<tr>";

        data.table[i].forEach(col=>{

            html += `<td>${col}</td>`;

        });

        html += "</tr>";

    }

    html += "</tbody></table></div>";

    content.innerHTML = html;

}