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

const searchInput =
document.getElementById("searchTraining");

const btnToday =
document.getElementById("btnToday");

const btnAll =
document.getElementById("btnAll");

const superiorKPI =
document.getElementById("superiorKPI");

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

    loading.style.display="flex";

}

function hideLoading(){

    loading.style.display="none";

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

        const res =
        await fetch(
            API_BASE + "?action=training"
        );

        const data =
        await res.json();

        if(!data.success){

            content.innerHTML=

            `<div class="empty-box">

                ${data.message}

            </div>`;

            return;

        }

        trainingHeader =
        data.header;

        trainingRows =
        data.rows;

        renderPage();

    }

    catch(err){

        console.error(err);

        content.innerHTML=

        `<div class="empty-box">

            Failed Load Data

        </div>`;

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
    new Date().toLocaleDateString("en-CA");

    return trainingRows.filter(r=>{

        const d =
        new Date(r[3]);

        if(isNaN(d)) return false;

        return (
            d.toLocaleDateString("en-CA")
            === today
        );

    });

}

/* ==========================================
   FILTER DATA
========================================== */

function getRows(){

    let rows =
    currentMode==="today"
    ? getTodayRows()
    : [...trainingRows];

    const keyword =
    searchInput.value
    .toLowerCase()
    .trim();

    if(keyword==="") return rows;

    return rows.filter(r=>{

        return(

            String(r[1]).toLowerCase().includes(keyword) ||

            String(r[2]).toLowerCase().includes(keyword) ||

            String(r[5]).toLowerCase().includes(keyword) ||

            String(r[9]).toLowerCase().includes(keyword)

        );

    });

}

/* ==========================================
   TAB
========================================== */

btnToday.onclick=()=>{

    currentMode="today";

    btnToday.classList.add("active");
    btnAll.classList.remove("active");

    renderPage();

}

btnAll.onclick=()=>{

    currentMode="all";

    btnAll.classList.add("active");
    btnToday.classList.remove("active");

    renderPage();

}

searchInput.onkeyup=()=>{

    renderPage();

}

/* ==========================================
   KPI SUPERIOR
========================================== */

function renderKPI(rows){

    const group={};

    rows.forEach(r=>{

        const sp =
        r[9] || "No Superior";

        if(!group[sp]){

            group[sp]={

                hadir:0,

                total:0

            };

        }

        group[sp].total++;

        if(
            String(r[7])
            .toLowerCase()
            .includes("hadir")
        ){

            group[sp].hadir++;

        }

    });

    let html="";

    Object.keys(group).forEach(sp=>{

        const total =
        group[sp].total;

        const hadir =
        group[sp].hadir;

        const percent =
        Math.round(hadir/total*100);

        let color="danger";

        if(percent>=80){

            color="success";

        }else if(percent>=50){

            color="warning";

        }

        html+=`

        <div class="card">

            <small>${sp}</small>

            <h2 class="${color}">

                ${percent}%

            </h2>

            <span>

                ${hadir}/${total} Hadir

            </span>

        </div>

        `;

    });

    superiorKPI.innerHTML=html;

}

/* ==========================================
   MAIN RENDER
========================================== */

function renderPage(){

    const rows =
    getRows();

    renderKPI(rows);

    renderSuperior(rows);

}
/* ==========================================
   GROUP BY SUPERIOR
========================================== */

function groupSuperior(rows){

    const groups={};

    rows.forEach(r=>{

        const sp =
        r[9] || "No Superior";

        if(!groups[sp]){

            groups[sp]=[];

        }

        groups[sp].push(r);

    });

    return groups;

}

/* ==========================================
   RENDER SUPERIOR
========================================== */

function renderSuperior(rows){

    const groups =
    groupSuperior(rows);

    let html="";

    Object.keys(groups).forEach((sp,index)=>{

        const opened =
        index<2;

        html+=`

        <div class="superior-group">

            <div
                class="superior-header"
                onclick="toggleSuperior(this)">

                <div class="superior-title">

                    <i class="fa-solid fa-chevron-${opened?"down":"right"} arrow"></i>

                    <h3>${sp}</h3>

                </div>

                <div class="superior-action">

                    <span class="superior-count">

                        ${groups[sp].length} Participant

                    </span>

                    <button

                        class="btn-download"

                        onclick="downloadSuperior(event,this)">

                        <i class="fa-solid fa-image"></i>

                        JPG

                    </button>

                </div>

            </div>

            <div class="superior-body ${opened?"open":""}">

                <div class="table-box">

                    <table class="training-table">

                        <thead>

                            <tr>

                                <th>Peserta</th>
                                <th>Store</th>
                                <th>Tanggal</th>
                                <th>Jam</th>
                                <th>Training</th>
                                <th>Status</th>
                                <th>Whatsapp</th>

                            </tr>

                        </thead>

                        <tbody>
        `;

        groups[sp].forEach(r=>{

            html+=`

            <tr>

                <td>

                    <b>${r[1]}</b><br>

                    <small>${r[0]}</small>

                </td>

                <td>${r[2]}</td>

                <td>${formatDate(r[3])}</td>

                <td>${r[4]}</td>

                <td>${r[5]}</td>

                <td>

                    <select
                        class="status-select"
                        data-nik="${r[0]}">

                        <option
                            value="Waiting"
                            ${String(r[7]).toLowerCase().includes("waiting")?"selected":""}>

                            Waiting

                        </option>

                        <option
                            value="Hadir"
                            ${String(r[7]).toLowerCase().includes("hadir")?"selected":""}>

                            Hadir

                        </option>

                    </select>

                </td>

                <td>

                    <button

                        class="btn-wa"

                        onclick="window.open('${r[12]}','_blank')">

                        <i class="fa-brands fa-whatsapp"></i>

                        Kirim Pesan

                    </button>

                </td>

            </tr>

            `;

        });

        html+=`

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

        `;

    });

    content.innerHTML=html;

    bindStatus();

}
/* ==========================================
   ACCORDION
========================================== */

function toggleSuperior(header){

    const body =
    header.nextElementSibling;

    const arrow =
    header.querySelector(".arrow");

    body.classList.toggle("open");

    arrow.classList.toggle("fa-chevron-down");
    arrow.classList.toggle("fa-chevron-right");

}

/* ==========================================
   DOWNLOAD JPG
========================================== */

function downloadSuperior(e,btn){

    e.stopPropagation();

    const group =
    btn.closest(".superior-group");

    const title =
    group.querySelector("h3").innerText;

    html2canvas(group,{

        scale:2,

        backgroundColor:"#ffffff",

        useCORS:true

    }).then(canvas=>{

        const a =
        document.createElement("a");

        a.download =
        title + " Training.jpg";

        a.href =
        canvas.toDataURL("image/jpeg",1);

        a.click();

    });

}

/* ==========================================
   UPDATE STATUS
========================================== */

function bindStatus(){

    document
    .querySelectorAll(".status-select")
    .forEach(item=>{

        item.onchange=async function(){

            try{

                showLoading();

                const res =
                await fetch(API_BASE,{

                    method:"POST",

                    headers:{

                        "Content-Type":"application/x-www-form-urlencoded"

                    },

                    body:new URLSearchParams({

                        action:"updateTraining",

                        nik:this.dataset.nik,

                        status:this.value

                    })

                });

                const data =
                await res.json();

                if(!data.success){

                    alert(data.message);

                }

            }

            catch(err){

                console.error(err);

                alert("Update Failed");

            }

            finally{

                hideLoading();

            }

        }

    });

}

/* ==========================================
   FORMAT DATE
========================================== */

function formatDate(date){

    const d =
    new Date(date);

    if(isNaN(d)) return date;

    return d.toLocaleDateString("id-ID",{

        day:"2-digit",

        month:"short",

        year:"numeric"

    });

}

/* ==========================================
   START
========================================== */

document.addEventListener("DOMContentLoaded",()=>{

    loadTraining();

});