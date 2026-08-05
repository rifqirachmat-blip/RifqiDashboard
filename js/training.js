console.log("training.js loaded");

/* ==========================================================
   CONFIG
========================================================== */

const API_BASE =
"https://script.google.com/macros/s/AKfycbzXFHd09dlhGgmWJkaRKn-tup6LMSdeMR0Mxzw2TL_4c_UdAxqHA7K46pFrw7hNU1J9/exec";


/* ==========================================================
   ELEMENT
========================================================== */

const content =
document.getElementById("trainingContent");

const loading =
document.getElementById("loadingOverlay");

const searchInput =
document.getElementById("searchTraining");

const btnToday =
document.getElementById("btnToday");

const btnFull =
document.getElementById("btnFull");

const superiorKPI =
document.getElementById("superiorKPI");

const todayDate =
document.getElementById("todayDate");

const todayTime =
document.getElementById("todayTime");


/* ==========================================================
   GLOBAL DATA
========================================================== */

let trainingHeader = [];

let trainingRows = [];

let currentMode = "today";


/* ==========================================================
   LOADING
========================================================== */

function showLoading(){

    if(loading){

        loading.style.display = "flex";

    }

}


function hideLoading(){

    if(loading){

        loading.style.display = "none";

    }

}


/* ==========================================================
   TOAST
========================================================== */

function showToast(message, type = "success"){

    let toast =
    document.getElementById("trainingToast");

    if(!toast){

        toast =
        document.createElement("div");

        toast.id = "trainingToast";

        toast.style.position = "fixed";
        toast.style.right = "25px";
        toast.style.bottom = "25px";
        toast.style.zIndex = "99999";
        toast.style.padding = "14px 20px";
        toast.style.borderRadius = "10px";
        toast.style.color = "#fff";
        toast.style.fontWeight = "600";
        toast.style.boxShadow =
        "0 8px 25px rgba(0,0,0,.18)";

        document.body.appendChild(toast);

    }

    toast.style.background =
    type === "error"
    ? "#dc2626"
    : "#16a34a";

    toast.innerHTML =
    type === "error"
    ? `<i class="fa-solid fa-circle-xmark"></i> ${message}`
    : `<i class="fa-solid fa-circle-check"></i> ${message}`;

    toast.style.opacity = "1";

    clearTimeout(toast._timer);

    toast._timer =
    setTimeout(()=>{

        toast.style.opacity = "0";

    },3000);

}


/* ==========================================================
   CLOCK
========================================================== */

function updateClock(){

    const now = new Date();

    if(todayDate){

        todayDate.innerHTML =
        now.toLocaleDateString(
            "id-ID",
            {
                weekday:"long",
                day:"2-digit",
                month:"long",
                year:"numeric"
            }
        );

    }

    if(todayTime){

        todayTime.innerHTML =
        now.toLocaleTimeString(
            "id-ID",
            {
                hour:"2-digit",
                minute:"2-digit",
                second:"2-digit"
            }
        );

    }

}


/* ==========================================================
   SAFE STRING
========================================================== */

function safeString(value){

    if(value === null ||
       value === undefined){

        return "";

    }

    return String(value).trim();

}


/* ==========================================================
   HTML ESCAPE
========================================================== */

function escapeHtml(value){

    return safeString(value)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}


/* ==========================================================
   STATUS CHECK
========================================================== */

function isHadir(status){

    return (
        safeString(status)
        .toLowerCase()
        === "hadir"
    );

}


function isTidakHadir(status){

    return (
        safeString(status)
        .toLowerCase()
        === "tidak hadir"
    );

}


/* ==========================================================
   DATE PARSER
========================================================== */

function parseTrainingDate(value){

    if(!value){

        return null;

    }

    const date =
    new Date(value);

    if(isNaN(date.getTime())){

        return null;

    }

    return date;

}


/* ==========================================================
   FORMAT DATE
========================================================== */

function formatDate(value){

    const date =
    parseTrainingDate(value);

    if(!date){

        return safeString(value) || "-";

    }

    return date.toLocaleDateString(
        "id-ID",
        {
            day:"2-digit",
            month:"short",
            year:"numeric"
        }
    );

}


/* ==========================================================
   IS TODAY
========================================================== */

function isToday(value){

    const date =
    parseTrainingDate(value);

    if(!date){

        return false;

    }

    const now =
    new Date();

    return (

        date.getFullYear()
        === now.getFullYear()

        &&

        date.getMonth()
        === now.getMonth()

        &&

        date.getDate()
        === now.getDate()

    );

}


/* ==========================================================
   LOAD TRAINING DATA
========================================================== */

async function loadTraining(){

    try{

        showLoading();

        const response =
        await fetch(
            API_BASE +
            "?action=training"
        );

        if(!response.ok){

            throw new Error(
                "HTTP " +
                response.status
            );

        }

        const data =
        await response.json();

        if(!data ||
           data.success !== true){

            throw new Error(
                data?.message ||
                "Data training gagal dimuat."
            );

        }

        trainingHeader =
        Array.isArray(data.header)
        ? data.header
        : [];

        trainingRows =
        Array.isArray(data.rows)
        ? data.rows
        : [];

        renderPage();

    }

    catch(error){

        console.error(
            "loadTraining error:",
            error
        );

        if(content){

            content.innerHTML = `

                <div class="empty-box">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <br>

                    Gagal memuat data training.

                    <br>

                    <small>
                        ${escapeHtml(error.message)}
                    </small>

                </div>

            `;

        }

        showToast(
            "Gagal memuat data training.",
            "error"
        );

    }

    finally{

        hideLoading();

    }

}


/* ==========================================================
   GET TODAY ROWS
========================================================== */

function getTodayRows(){

    return trainingRows.filter(row=>{

        return isToday(row[3]);

    });

}
/* ==========================================================
   FULL SCHEDULE
   Menampilkan seluruh data training dari Spreadsheet
========================================================== */

function getFullScheduleRows(){

    return [...trainingRows];

}


/* ==========================================================
   GET CURRENT ROWS
========================================================== */

function getRows(){

    let rows = [];


    /* ==========================================
       TODAY TRAINING
    ========================================== */

    if(currentMode === "today"){

        rows =
            getTodayRows();

    }


    /* ==========================================
       FULL SCHEDULE
    ========================================== */

    else if(currentMode === "full"){

        rows =
            getFullScheduleRows();

    }


    /* ==========================================
       DEFAULT
    ========================================== */

    else{

        rows =
            getTodayRows();

    }


    /* ==========================================
       SEARCH
    ========================================== */

    const keyword =
        safeString(
            searchInput?.value
        ).toLowerCase();


    if(keyword){

        rows =
            rows.filter(row => {

                return row.some(cell => {

                    return safeString(cell)
                        .toLowerCase()
                        .includes(keyword);

                });

            });

    }


    return rows;

}


/* ==========================================================
   TAB - TODAY
========================================================== */

if(btnToday){

    btnToday.addEventListener(
        "click",
        ()=>{

            currentMode = "today";

            btnToday.classList.add(
                "active"
            );

            if(btnFull){

                btnFull.classList.remove(
                    "active"
                );

            }

            renderPage();

        }
    );

}


/* ==========================================================
   TAB - FULL SCHEDULE
========================================================== */

if(btnFull){

    btnFull.addEventListener(
        "click",
        ()=>{

            currentMode = "all";

            btnFull.classList.add(
                "active"
            );

            if(btnToday){

                btnToday.classList.remove(
                    "active"
                );

            }

            renderPage();

        }
    );

}


/* ==========================================================
   SEARCH
========================================================== */

if(searchInput){

    searchInput.addEventListener(
        "input",
        ()=>{

            renderPage();

        }
    );

}
/* ==========================================================
   GROUP BY SUPERIOR
========================================================== */

function groupBySuperior(rows){

    const groups = {};

    rows.forEach(row=>{

        const superior =
        safeString(row[9]) || "No Superior";

        if(!groups[superior]){

            groups[superior] = [];

        }

        groups[superior].push(row);

    });

    return groups;

}


/* ==========================================================
   SORT GROUP ROWS
========================================================== */

function sortRows(rows){

    return [...rows].sort((a,b)=>{

        const dateA =
        parseTrainingDate(a[3]);

        const dateB =
        parseTrainingDate(b[3]);

        if(!dateA && !dateB){

            return 0;

        }

        if(!dateA){

            return 1;

        }

        if(!dateB){

            return -1;

        }

        return dateA - dateB;

    });

}


/* ==========================================================
   RENDER KPI SUPERIOR
========================================================== */

/* ==========================================================
   KPI — SOURCE OF TRUTH = SPREADSHEET
========================================================== */

function renderKPI(){

    if(!superiorKPI){
        return;
    }


    /*
     * Jangan menggunakan getRows().
     *
     * trainingRows = data mentah yang baru saja
     * diterima langsung dari Spreadsheet.
     */

    let sourceRows = [];


    if(currentMode === "today"){

        sourceRows =
            getTodayRows();

    }
    else{

        sourceRows =
            [...trainingRows];

    }


    /*
     * Group berdasarkan Superior
     */

    const groups = {};


    sourceRows.forEach(row=>{

        const superior =
            safeString(row[9]) ||
            "No Superior";


        if(!groups[superior]){

            groups[superior] = {

                total: 0,

                hadir: 0

            };

        }


        groups[superior].total++;


        /*
         * EXACT MATCH.
         *
         * "Hadir"       = dihitung
         * "Tidak Hadir" = TIDAK dihitung
         */

        if(
            safeString(row[7])
            .toLowerCase()
            === "hadir"
        ){

            groups[superior].hadir++;

        }

    });


    let html = "";


    Object.keys(groups)
    .forEach(superior=>{

        const total =
            groups[superior].total;


        const hadir =
            groups[superior].hadir;


        const percentage =
            total > 0
            ? Math.round(
                (hadir / total) * 100
            )
            : 0;


        let color =
            "danger";


        if(percentage >= 80){

            color =
                "success";

        }
        else if(percentage >= 50){

            color =
                "warning";

        }


        html += `

            <div class="card">

                <small>

                    ${escapeHtml(superior)}

                </small>


                <h2
                    class="${color}"
                >

                    ${percentage}%

                </h2>


                <span>

                    ${hadir}/${total} Hadir

                </span>

            </div>

        `;

    });


    superiorKPI.innerHTML =
        html;

}


/* ==========================================================
   STATUS BADGE
========================================================== */

function statusBadge(status){

    const normalized =
    safeString(status)
    .toLowerCase();

    if(normalized === "hadir"){

        return `

            <span class="status-badge hadir">

                <i
                    class="fa-solid fa-circle-check"
                ></i>

                Hadir

            </span>

        `;

    }

    if(normalized === "tidak hadir"){

        return `

            <span class="status-badge tidak-hadir">

                <i
                    class="fa-solid fa-circle-xmark"
                ></i>

                Tidak Hadir

            </span>

        `;

    }

    return `

        <span class="status-badge">

            ${escapeHtml(status || "-")}

        </span>

    `;

}


/* ==========================================================
   STATUS SELECT
========================================================== */

/* ==========================================================
   STATUS SELECT
   IDENTIFIER = NIK + TANGGAL + TRAINING
========================================================== */

function statusSelect(row){

    const status =
        safeString(row[7]);

    const hadir =
        isHadir(status);

    const tidakHadir =
        isTidakHadir(status);

    const nik =
        safeString(row[0]);

    const trainingDate =
        safeString(row[3]);

    const trainingTitle =
        safeString(row[5]);


    return `

        <select
            class="status-select"

            data-nik="${escapeHtml(nik)}"

            data-training-date="${escapeHtml(trainingDate)}"

            data-training-title="${escapeHtml(trainingTitle)}"

            ${hadir ? "disabled" : ""}
        >

            <option
                value="Tidak Hadir"
                ${tidakHadir ? "selected" : ""}
            >
                Tidak Hadir
            </option>

            <option
                value="Hadir"
                ${hadir ? "selected" : ""}
            >
                Hadir
            </option>

        </select>

    `;

}


/* ==========================================================
   RENDER SUPERIOR
========================================================== */

function renderSuperior(rows){

    if(!content){
        return;
    }


    const groups =
        groupBySuperior(rows);


    const superiorNames =
        Object.keys(groups);


    if(superiorNames.length === 0){

        content.innerHTML = `

            <div class="empty-box">

                <i class="fa-solid fa-calendar-xmark"></i>

                <p>
                    Tidak ada training
                    untuk periode ini.
                </p>

            </div>

        `;

        return;

    }


    let html = "";


    superiorNames.forEach(
        (superior, index) => {

            const participants =
                sortRows(
                    groups[superior]
                );


            const opened =
                index === 0;


            html += `

                <div
                    class="superior-group"
                    data-superior="${escapeHtml(superior)}"
                >

                    <!-- SUPERIOR HEADER -->

                    <div
                        class="superior-header"
                        onclick="toggleSuperior(this)"
                    >

                        <div class="superior-title">

                            <i
                                class="
                                    fa-solid
                                    fa-chevron-${opened
                                        ? "down"
                                        : "right"}
                                    superior-arrow
                                "
                            ></i>

                            <div>

                                <h3>
                                    ${escapeHtml(superior)}
                                </h3>

                                <span>
                                    ${participants.length}
                                    Participants
                                </span>

                            </div>

                        </div>


                        <div class="superior-actions">

                            <button
                                type="button"
                                class="btn-download"
                                onclick="
                                    downloadSuperior(
                                        event,
                                        this
                                    )
                                "
                            >

                                <i class="fa-solid fa-image"></i>

                                JPG

                            </button>

                        </div>

                    </div>


                    <!-- SUPERIOR BODY -->

<div
    class="
        superior-body
        ${opened ? "open" : ""}
    "
    style="
        width:100%;
        overflow:visible;
    "
>

    <div
        class="table-wrapper"
        style="
            width:100%;
            max-width:100%;
            overflow-x:auto;
            overflow-y:hidden;
            -webkit-overflow-scrolling:touch;
        "
    >

        <table
            class="training-table"
            style="
                width:max-content;
                min-width:1450px;
                max-width:none;
                table-layout:auto;
                border-collapse:collapse;
            "
        >

                                <thead>

                                    <tr>

                                        <th>
                                            Peserta
                                        </th>

                                        <th>
                                            Store
                                        </th>

                                        <th>
                                            Tanggal
                                        </th>

                                        <th>
                                            Jam
                                        </th>

                                        <th>
                                            Training
                                        </th>

                                        <th>
                                            Link
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Pesan
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

            `;


            participants.forEach(row => {

                /*
                 * Spreadsheet:
                 *
                 * A = NIK
                 * B = Nama
                 * C = Store
                 * D = Tanggal
                 * E = Jam
                 * F = Training
                 * G = Link Training
                 * H = Status
                 * J = Superior
                 * M = Kirim Pesan
                 */


                const nik =
                    safeString(row[0]);


                const nama =
                    safeString(row[1]);


                const store =
                    safeString(row[2]);


                const tanggal =
                    formatDate(row[3]);


                const jam =
                    safeString(row[4]);


                const training =
                    safeString(row[5]);


                const trainingUrl =
    normalizeTrainingUrl(row[6]);


                const messageUrl =
                    safeString(row[12]);


                html += `

                    <tr>

                        <!-- PESERTA -->

                        <td>

                            <div class="participant-name">

                                <strong>
                                    ${escapeHtml(nama)}
                                </strong>

                            </div>

                        </td>


                        <!-- STORE -->

                        <td>
                            ${escapeHtml(store)}
                        </td>


                        <!-- TANGGAL -->

                        <td>
                            ${escapeHtml(tanggal)}
                        </td>


                        <!-- JAM -->

                        <td>
                            ${escapeHtml(jam)}
                        </td>


                        <!-- TRAINING -->

                        <td class="training-name">

                            ${escapeHtml(training)}

                        </td>


                        <!-- LINK TRAINING -->

                        <td class="training-link-cell">
                `;


                if(trainingUrl){

                    html += `

                            <a
                                href="${escapeHtml(trainingUrl)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="btn-training-link"
                                title="Buka link training"
                            >

                                <i
                                    class="fa-solid fa-link"
                                ></i>

                                Buka

                            </a>

                    `;

                }
                else{

                    html += `

                            <span class="no-link">
                                -
                            </span>

                    `;

                }


                html += `

                        </td>


                        <!-- STATUS -->

                        <td>

                            ${statusSelect(row)}

                        </td>


                        <!-- WHATSAPP -->

                        <td>
                `;


                if(messageUrl){

                    html += `

                            <a
                                href="${escapeHtml(messageUrl)}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="btn-wa"
                                title="Kirim pesan"
                            >

                                <i
                                    class="fa-brands fa-whatsapp"
                                ></i>

                                Kirim

                            </a>

                    `;

                }
                else{

                    html += `

                            <span class="no-message">
                                -
                            </span>

                    `;

                }


                html += `

                        </td>

                    </tr>

                `;

            });


            html += `

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            `;

        }
    );


    content.innerHTML =
        html;

}
function normalizeTrainingUrl(url){

    url = safeString(url).trim();

    if(!url){
        return "";
    }

    if(
        url.startsWith("http://") ||
        url.startsWith("https://")
    ){
        return url;
    }

    return "https://" + url;

}


/* ==========================================================
   RENDER PAGE
========================================================== */

function renderPage(){

    const rows =
        getRows();


    /*
     * KPI TIDAK menggunakan rows.
     *
     * KPI mengambil langsung dari
     * trainingRows yang berasal dari Spreadsheet.
     */

    renderKPI();


    /*
     * Tabel tetap menggunakan rows
     * supaya Search tetap bekerja.
     */

    renderSuperior(rows);

}
/* ==========================================================
   UPDATE LOCAL STATUS
========================================================== */
/* ==========================================================
   UPDATE LOCAL STATUS
   MATCH RECORD SECARA UNIK
========================================================== */

function updateLocalStatus(
    nik,
    trainingDate,
    trainingTitle,
    status
){

    trainingRows.forEach(row => {

        if(
            safeString(row[0]) ===
                safeString(nik) &&

            safeString(row[3]) ===
                safeString(trainingDate) &&

            safeString(row[5]) ===
                safeString(trainingTitle)
        ){

            row[7] = status;

        }

    });

}
/* ==========================================================
   BIND STATUS DROPDOWN
========================================================== */

function bindStatus(){

    const selects =
        document.querySelectorAll(
            ".status-select"
        );


    selects.forEach(select => {

        select.onchange = async function(){

            const dropdown = this;


            const nik =
                safeString(
                    dropdown.dataset.nik
                );


            const trainingDate =
                safeString(
                    dropdown.dataset.trainingDate
                );


            const trainingTitle =
                safeString(
                    dropdown.dataset.trainingTitle
                );


            const status =
                safeString(
                    dropdown.value
                );


            console.log(
                "Update training:",
                {
                    nik,
                    trainingDate,
                    trainingTitle,
                    status
                }
            );


            /* ==========================================
               VALIDASI
            ========================================== */

            if(
                !nik ||
                !trainingDate ||
                !trainingTitle
            ){

                showToast(
                    "Identitas training tidak lengkap.",
                    "error"
                );

                renderPage();

                return;

            }


            if(
                status !== "Hadir" &&
                status !== "Tidak Hadir"
            ){

                showToast(
                    "Status tidak valid.",
                    "error"
                );

                renderPage();

                return;

            }


            /* ==========================================
               LOCK SELAMA REQUEST
            ========================================== */

            dropdown.disabled = true;


            try{

                showLoading();


                /* ======================================
                   KIRIM KE APPS SCRIPT
                ====================================== */

                const response =
                    await fetch(
                        API_BASE,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/x-www-form-urlencoded;charset=UTF-8"

                            },

                            body:
                                new URLSearchParams({

                                    action:
                                        "updateTraining",

                                    nik:
                                        nik,

                                    trainingDate:
                                        trainingDate,

                                    trainingTitle:
                                        trainingTitle,

                                    status:
                                        status

                                })

                        }
                    );


                if(!response.ok){

                    throw new Error(
                        "HTTP " +
                        response.status
                    );

                }


                const result =
                    await response.json();


                console.log(
                    "Update result:",
                    result
                );


                /* ======================================
                   SERVER MENOLAK
                ====================================== */

                if(
                    !result ||
                    result.success !== true
                ){

                    throw new Error(
                        result.message ||
                        "Status gagal diperbarui."
                    );

                }


                /* ======================================
                   UPDATE LOCAL DATA
                ====================================== */

                updateLocalStatus(
                    nik,
                    trainingDate,
                    trainingTitle,
                    status
                );


                /* ======================================
                   SUCCESS
                ====================================== */

                showToast(
                    status === "Hadir"
                        ? "Peserta ditandai Hadir."
                        : "Status diperbarui."
                );


                /*
                 * Render ulang.
                 *
                 * Dropdown Hadir akan otomatis
                 * disabled karena status row[7]
                 * sudah berubah menjadi Hadir.
                 */

                renderPage();

            }


            catch(error){

                console.error(
                    "updateTraining error:",
                    error
                );


                showToast(
                    error.message ||
                    "Gagal memperbarui status.",
                    "error"
                );


                /*
                 * Jangan update local data
                 * kalau server gagal.
                 */

                renderPage();

            }


            finally{

                hideLoading();

            }

        };

    });

}


/* ==========================================================
   BIND STATUS
========================================================== */

function bindStatus(){

    document
        .querySelectorAll(".status-select")
        .forEach(select => {

            select.onchange = async function(){

                const dropdown =
                    this;


                /* ==========================================
                   IDENTIFIER RECORD
                ========================================== */

                const nik =
                    safeString(
                        dropdown.dataset.nik
                    );


                const trainingDate =
                    safeString(
                        dropdown.dataset.trainingDate
                    );


                const trainingTitle =
                    safeString(
                        dropdown.dataset.trainingTitle
                    );


                const status =
                    safeString(
                        dropdown.value
                    );


                console.log(
                    "Updating training record:",
                    {
                        nik,
                        trainingDate,
                        trainingTitle,
                        status
                    }
                );


                /* ==========================================
                   VALIDASI
                ========================================== */

                if(
                    !nik ||
                    !trainingDate ||
                    !trainingTitle
                ){

                    showToast(
                        "Identitas training tidak lengkap.",
                        "error"
                    );

                    renderPage();

                    return;

                }


                if(
                    status !== "Hadir" &&
                    status !== "Tidak Hadir"
                ){

                    showToast(
                        "Status tidak valid.",
                        "error"
                    );

                    renderPage();

                    return;

                }


                /*
                 * Cegah double click
                 */

                dropdown.disabled = true;


                try{

                    showLoading();


                    /* ======================================
                       SEND TO APPS SCRIPT
                    ====================================== */

                    const response =
                        await fetch(
                            API_BASE,
                            {

                                method: "POST",

                                headers: {

                                    "Content-Type":
                                        "application/x-www-form-urlencoded;charset=UTF-8"

                                },

                                body:
                                    new URLSearchParams({

                                        action:
                                            "updateTraining",

                                        nik:
                                            nik,

                                        trainingDate:
                                            trainingDate,

                                        trainingTitle:
                                            trainingTitle,

                                        status:
                                            status

                                    })

                            }
                        );


                    if(!response.ok){

                        throw new Error(
                            "HTTP " +
                            response.status
                        );

                    }


                    const result =
                        await response.json();


                    console.log(
                        "Update result:",
                        result
                    );


                    /* ======================================
                       SERVER REJECT
                    ====================================== */

                    if(
                        !result ||
                        result.success !== true
                    ){

                        throw new Error(
                            result?.message ||
                            "Status gagal diperbarui."
                        );

                    }


                    /* ======================================
                       UPDATE LOCAL DATA
                    ====================================== */

                    updateLocalStatus(
                        nik,
                        trainingDate,
                        trainingTitle,
                        status
                    );


                    /* ======================================
                       SUCCESS
                    ====================================== */

                    showToast(
                        status === "Hadir"
                            ? "Peserta ditandai Hadir."
                            : "Status diperbarui."
                    );


                    /*
                     * Render ulang.
                     *
                     * KPI akan mengambil data dari
                     * trainingRows terbaru.
                     */

                    renderPage();

                }

                catch(error){

                    console.error(
                        "Attendance update error:",
                        error
                    );


                    showToast(
                        error.message ||
                        "Gagal memperbarui attendance.",
                        "error"
                    );


                    /*
                     * Kalau gagal,
                     * jangan ubah local data.
                     */

                    renderPage();

                }

                finally{

                    hideLoading();

                }

            };

        });

}


/* ==========================================================
   RENDER PAGE OVERRIDE
========================================================== */

function renderPage(){

    const rows =
    getRows();


    /*
     1. KPI
    */

    renderKPI(rows);


    /*
     2. Superior + table
    */

    renderSuperior(rows);


    /*
     3. Pasang event dropdown
    */

    bindStatus();

}
/* ==========================================================
   ACCORDION SUPERIOR
========================================================== */

function toggleSuperior(header){

    if(!header){
        return;
    }

    const group =
    header.closest(".superior-group");

    if(!group){
        return;
    }

    const body =
    group.querySelector(".superior-body");

    const arrow =
    group.querySelector(".superior-arrow");

    if(!body){
        return;
    }

    const isOpen =
    body.classList.contains("open");

    body.classList.toggle(
        "open",
        !isOpen
    );

    if(arrow){

        arrow.classList.toggle(
            "fa-chevron-down",
            !isOpen
        );

        arrow.classList.toggle(
            "fa-chevron-right",
            isOpen
        );

    }

}


/* ==========================================================
   OPEN WHATSAPP / MESSAGE
========================================================== */

function openMessage(url){

    if(!url){
        showToast(
            "Link pesan tidak tersedia.",
            "error"
        );

        return;
    }

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* ==========================================================
   DOWNLOAD SUPERIOR AS JPG
========================================================== */

async function downloadSuperior(event, button){

    if(event){
        event.stopPropagation();
    }

    const group =
        button?.closest(".superior-group");

    if(!group){

        showToast(
            "Superior tidak ditemukan.",
            "error"
        );

        return;
    }

    const title =
        group.querySelector(
            ".superior-title h3"
        );

    const superiorName =
        safeString(
            title?.textContent
        ) || "Training";

    const body =
        group.querySelector(
            ".superior-body"
        );

    const wasOpen =
        body?.classList.contains("open");


    try{

        showLoading();


        /* ==========================================
           BUKA GROUP
        ========================================== */

        if(body){
            body.classList.add("open");
        }


        await new Promise(resolve => {

            requestAnimationFrame(() => {

                requestAnimationFrame(resolve);

            });

        });


        /* ==========================================
           HTML2CANVAS
        ========================================== */

        const canvas =
            await html2canvas(
                group,
                {

                    scale: 2,

                    backgroundColor:
                        "#ffffff",

                    useCORS: true,

                    allowTaint: false,

                    logging: false,

                    imageTimeout: 15000,

                    removeContainer: true,


                    /* ==================================
                       KHUSUS SAAT SCREENSHOT
                    ================================== */

                    onclone: function(clonedDocument){

                        const clonedGroup =
                            clonedDocument.querySelector(
                                ".superior-group"
                            );


                        if(!clonedGroup){
                            return;
                        }


                        /*
                         * Hilangkan efek yang membuat
                         * hasil screenshot pucat.
                         */

                        clonedGroup.style.opacity =
                            "1";

                        clonedGroup.style.filter =
                            "none";

                        clonedGroup.style.background =
                            "#ffffff";

                        clonedGroup.style.color =
                            "#222222";

                        clonedGroup.style.boxShadow =
                            "none";


                        /*
                         * Semua element di dalam group
                         * dipaksa full opacity.
                         */

                        const allElements =
                            clonedGroup.querySelectorAll("*");


                        allElements.forEach(
                            function(el){

                                el.style.opacity =
                                    "1";

                                el.style.filter =
                                    "none";

                            }
                        );


                        /* ==================================
                           TEXT
                        ================================== */

                        const textElements =
                            clonedGroup.querySelectorAll(
                                "td, th, span, small, strong, h3"
                            );


                        textElements.forEach(
                            function(el){

                                el.style.opacity =
                                    "1";

                                el.style.color =
                                    "#222222";

                            }
                        );


                        /* ==================================
                           TABLE HEADER
                        ================================== */

                        const headers =
                            clonedGroup.querySelectorAll(
                                ".training-table thead th"
                            );


                        headers.forEach(
                            function(th){

                                th.style.backgroundColor =
                                    "#fff0a8";

                                th.style.color =
                                    "#222222";

                                th.style.fontWeight =
                                    "700";

                            }
                        );


                        /* ==================================
                           TABLE
                        ================================== */

                        const cells =
                            clonedGroup.querySelectorAll(
                                ".training-table td"
                            );


                        cells.forEach(
                            function(td){

                                td.style.backgroundColor =
                                    "#ffffff";

                                td.style.color =
                                    "#222222";

                                td.style.borderColor =
                                    "#e5e5e5";

                            }
                        );


                        /* ==================================
                           PARTICIPANT
                        ================================== */

                        const names =
                            clonedGroup.querySelectorAll(
                                ".participant-name strong"
                            );


                        names.forEach(
                            function(el){

                                el.style.color =
                                    "#222222";

                                el.style.fontWeight =
                                    "700";

                            }
                        );


                        const nikElements =
                            clonedGroup.querySelectorAll(
                                ".participant-name small"
                            );


                        nikElements.forEach(
                            function(el){

                                el.style.color =
                                    "#666666";

                            }
                        );


                        /* ==================================
                           TRAINING
                        ================================== */

                        const trainingNames =
                            clonedGroup.querySelectorAll(
                                ".training-name"
                            );


                        trainingNames.forEach(
                            function(el){

                                el.style.color =
                                    "#333333";

                            }
                        );


                        /* ==================================
                           LINK TRAINING
                        ================================== */

                        const trainingLinks =
                            clonedGroup.querySelectorAll(
                                ".btn-training-link"
                            );


                        trainingLinks.forEach(
                            function(el){

                                el.style.color =
                                    "#3157c7";

                                el.style.opacity =
                                    "1";

                            }
                        );


                        /* ==================================
                           STATUS DROPDOWN
                        ================================== */

                        const selects =
                            clonedGroup.querySelectorAll(
                                ".status-select"
                            );


                        selects.forEach(
                            function(select){

                                select.style.color =
                                    "#222222";

                                select.style.backgroundColor =
                                    "#ffffff";

                                select.style.borderColor =
                                    "#d5d5d5";

                                select.style.opacity =
                                    "1";

                            }
                        );


                        /* ==================================
                           WHATSAPP BUTTON
                        ================================== */

                        const waButtons =
                            clonedGroup.querySelectorAll(
                                ".btn-wa"
                            );


                        waButtons.forEach(
                            function(btn){

                                btn.style.opacity =
                                    "1";

                                btn.style.color =
                                    "#ffffff";

                                btn.style.backgroundColor =
                                    "#25D366";

                            }
                        );


                        /* ==================================
                           SUPERIOR HEADER
                        ================================== */

                        const superiorHeader =
                            clonedGroup.querySelector(
                                ".superior-header"
                            );


                        if(superiorHeader){

                            superiorHeader.style.opacity =
                                "1";

                            superiorHeader.style.color =
                                "#222222";

                            superiorHeader.style.backgroundColor =
                                "#ffffff";

                            superiorHeader.style.boxShadow =
                                "none";

                        }


                        /* ==================================
                           JPG BUTTON
                           dibuat lebih jelas
                        ================================== */

                        const downloadButton =
                            clonedGroup.querySelector(
                                ".btn-download"
                            );


                        if(downloadButton){

                            downloadButton.style.opacity =
                                "1";

                            downloadButton.style.color =
                                "#222222";

                            downloadButton.style.backgroundColor =
                                "#ffd400";

                        }

                    }

                }
            );


        /* ==========================================
           NAMA FILE
        ========================================== */

        const fileName =
            superiorName
                .replace(
                    /[\\/:*?"<>|]/g,
                    "_"
                )
                .replace(
                    /\s+/g,
                    "_"
                );


        /* ==========================================
           DOWNLOAD JPG
        ========================================== */

        const link =
            document.createElement("a");


        link.download =
            `${fileName}_Training.jpg`;


        link.href =
            canvas.toDataURL(
                "image/jpeg",
                0.95
            );


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        showToast(
            "JPG berhasil dibuat."
        );

    }

    catch(error){

        console.error(
            "Download JPG error:",
            error
        );


        showToast(
            "Gagal membuat JPG.",
            "error"
        );

    }

    finally{

        if(
            body &&
            !wasOpen
        ){

            body.classList.remove(
                "open"
            );

        }


        hideLoading();

    }

}


/* ==========================================================
   INIT
========================================================== */

updateClock();

setInterval(
    updateClock,
    1000
);


/*
   Load data pertama kali.
*/

loadTraining();
/* ==========================================================
   TRAINING TABS
========================================================== */

document
    .getElementById("btnToday")
    ?.addEventListener("click", function(){

        currentMode = "today";

        document
            .getElementById("btnToday")
            ?.classList.add("active");

        document
            .getElementById("btnFull")
            ?.classList.remove("active");

        renderPage();

    });


document
    .getElementById("btnFull")
    ?.addEventListener("click", function(){

        currentMode = "full";

        document
            .getElementById("btnFull")
            ?.classList.add("active");

        document
            .getElementById("btnToday")
            ?.classList.remove("active");

        renderPage();

    });