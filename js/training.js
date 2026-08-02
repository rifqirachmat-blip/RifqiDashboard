console.log("training.js loaded");

/* ==========================================
   CONFIG
========================================== */

const API_BASE =
"https://script.google.com/macros/s/AKfycbzXFHd09dlhGgmWJkaRKn-tup6LMSdeMR0Mxzw2TL_4c_UdAxqHA7K46pFrw7hNU1J9/exec";

/* ==========================================
   ELEMENT
========================================== */

const content =
document.getElementById("trainingContent");

const loading =
document.getElementById("loadingOverlay");

/* ==========================================
   GLOBAL
========================================== */

let trainingHeader = [];
let trainingRows = [];

let currentMode = "today";

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

async function loadTraining(){

    try{

        showLoading();

        const response =
        await fetch(API_BASE + "?action=training");

        const data =
        await response.json();

        console.log(data);

        if(!data.success){

            content.innerHTML = `
            <div class="empty-box">

                ${data.message}

            </div>
            `;

            return;

        }

        trainingHeader = data.header;

        trainingRows = data.rows;

        updateKPI();

        renderTraining();

    }

    catch(err){

        console.error(err);

        content.innerHTML = `
        <div class="empty-box">

            Failed Load Data

        </div>
        `;

    }

    finally{

        hideLoading();

    }

}

/* ==========================================
   TODAY FILTER
========================================== */

function getTodayRows(){

    const today =
    new Date();

    const todayStr =
    today.toLocaleDateString("en-CA");

    return trainingRows.filter(row=>{

        const d =
        new Date(row[3]);

        if(isNaN(d)) return false;

        return d.toLocaleDateString("en-CA")
        === todayStr;

    });

}

/* ==========================================
   KPI
========================================== */

function updateKPI(){

    const rows =
    getTodayRows();

    document.getElementById("todayTraining").innerHTML =
    rows.length;

    let confirmed = 0;
    let waiting = 0;

    rows.forEach(r=>{

        const status =
        String(r[7]).toLowerCase();

        if(status.includes("hadir")){

            confirmed++;

        }else{

            waiting++;

        }

    });

    document.getElementById("confirmedTraining").innerHTML =
    confirmed;

    document.getElementById("waitingTraining").innerHTML =
    waiting;

}

/* ==========================================
   TAB
========================================== */

document
.getElementById("btnToday")
.onclick=function(){

    currentMode="today";

    this.classList.add("active");

    document
    .getElementById("btnAll")
    .classList.remove("active");

    renderTraining();

}

document
.getElementById("btnAll")
.onclick=function(){

    currentMode="all";

    this.classList.add("active");

    document
    .getElementById("btnToday")
    .classList.remove("active");

    renderTraining();

}

/* ==========================================
   SEARCH
========================================== */

document
.getElementById("searchTraining")
.addEventListener("keyup",()=>{

    renderTraining();

});
/* ==========================================
   RENDER
========================================== */

function renderTraining(){

    const keyword =
    document
    .getElementById("searchTraining")
    .value
    .toLowerCase()
    .trim();

    let rows =
    currentMode==="today"
    ? getTodayRows()
    : [...trainingRows];

    if(keyword){

        rows =
        rows.filter(r=>{

            return (

                String(r[1]).toLowerCase().includes(keyword) ||
                String(r[2]).toLowerCase().includes(keyword) ||
                String(r[5]).toLowerCase().includes(keyword) ||
                String(r[9]).toLowerCase().includes(keyword)

            );

        });

    }

    if(rows.length===0){

        content.innerHTML=`

        <div class="empty-box">

            No Training Schedule

        </div>

        `;

        return;

    }

    /* ==========================
       GROUP SUPERIOR
    ========================== */

    const groups={};

    rows.forEach(r=>{

        const spv =
        r[9] || "-";

        if(!groups[spv]){

            groups[spv]=[];

        }

        groups[spv].push(r);

    });

    let html="";

    Object.keys(groups)
    .sort()
    .forEach(superior=>{

        html+=`

        <div class="superior-group">

            <div class="superior-header">

                <h3>${superior}</h3>

                <span class="superior-count">

                    ${groups[superior].length} Employee

                </span>

            </div>

        `;

        groups[superior]
        .forEach(r=>{

            html+=buildTrainingCard(r);

        });

        html+=`</div>`;

    });

    content.innerHTML=html;

    bindStatusDropdown();

}
/* ==========================================
   BUILD TRAINING CARD
========================================== */

function buildTrainingCard(r){

    const nik = r[0];
    const peserta = r[1];
    const store = r[2];
    const tanggal = r[3];
    const jam = r[4];
    const judul = r[5];
    const link = r[6];
    const status = r[7];
    const wa = r[12];

    let tanggalText = "";

    if(tanggal){

        const d = new Date(tanggal);

        if(!isNaN(d)){

            tanggalText =
            d.toLocaleDateString("id-ID",{

                weekday:"short",
                day:"2-digit",
                month:"short",
                year:"numeric"

            });

        }

    }

    let badge = "";

    if(String(status).toLowerCase().includes("hadir")){

        badge = `
        <span class="badge-success">

            Hadir

        </span>
        `;

    }else{

        badge = `
        <span class="badge-wait">

            Waiting

        </span>
        `;

    }

    return `

    <div class="training-card">

        <div class="participant">

            <h4>${peserta}</h4>

            <small>${nik}</small>

            <small>${store}</small>

        </div>

        <div class="training-info">

            <strong>${tanggalText}</strong>

            <br>

            ${jam}

        </div>

        <div class="training-title">

            ${judul}

        </div>

        <div>

            ${badge}

            <br><br>

            <select
                class="status-select"
                data-nik="${nik}">

                <option
                    value="Waiting"
                    ${status=="Waiting"?"selected":""}>

                    Waiting

                </option>

                <option
                    value="Hadir"
                    ${status=="Hadir"?"selected":""}>

                    Hadir

                </option>

            </select>

        </div>

        <div>

            <button
                class="btn-wa"
                onclick="window.open('${wa}','_blank')">

                <i class="fa-brands fa-whatsapp"></i>

                Kirim Pesan

            </button>

        </div>

    </div>

    `;

}
/* ==========================================
   UPDATE STATUS
========================================== */

function bindStatusDropdown(){

    document
    .querySelectorAll(".status-select")
    .forEach(item=>{

        item.onchange = async function(){

            const nik =
            this.dataset.nik;

            const status =
            this.value;

            try{

                showLoading();

                const response =
                await fetch(API_BASE,{

                    method:"POST",

                    headers:{
                        "Content-Type":
                        "application/x-www-form-urlencoded"
                    },

                    body:new URLSearchParams({

                        action:"updateTraining",

                        nik:nik,

                        status:status

                    })

                });

                const result =
                await response.json();

                if(!result.success){

                    alert(result.message);

                    loadTraining();

                    return;

                }

                /* update local data */

                trainingRows.forEach(r=>{

                    if(r[0]==nik){

                        r[7]=status;

                    }

                });

                updateKPI();

                renderTraining();

            }

            catch(err){

                console.error(err);

                alert("Failed update status");

                loadTraining();

            }

            finally{

                hideLoading();

            }

        };

    });

}

/* ==========================================
   START
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

    loadTraining();

});