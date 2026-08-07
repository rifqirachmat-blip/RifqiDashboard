/* =========================================================
   SCHEDULE SUPPORT BM
   ========================================================= */

const API_URL =
    "https://script.google.com/macros/s/AKfycbxO_PO4ir698-9NFKSkMyF6IWu6B0kddtS-Nl-gbvaqzrB1IF4IVyUMuUY4DXh9H0ej/exec";


// =========================================================
// GLOBAL
// =========================================================

let scheduleData = [];

let bmList = [];

let storeList = [];

let selectedDate = new Date();

let filteredData = [];


// =========================================================
// STORE COLORS
// =========================================================

const storeColors = [
    "store-blue",
    "store-green",
    "store-orange",
    "store-purple",
    "store-cyan",
    "store-red",
    "store-pink",
    "store-teal"
];


// =========================================================
// DOM READY
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
         * BULAN SELALU MENGIKUTI BULAN SEKARANG
         */

        const today = new Date();

        selectedDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );


        /*
         * HILANGKAN TOMBOL PANAH
         * JIKA MASIH ADA DI HTML LAMA
         */

        const prev =
            document.getElementById(
                "btnPrevMonth"
            );

        const next =
            document.getElementById(
                "btnNextMonth"
            );

        if (prev) {
            prev.style.display = "none";
        }

        if (next) {
            next.style.display = "none";
        }


        updateTodayDate();

        setupEvents();

        loadScheduleData();


        setInterval(
            updateTodayDate,
            1000
        );

    }
);


// =========================================================
// LOAD DATA
// =========================================================

async function loadScheduleData() {

    try {

        showLoading();


        const response =
            await fetch(
                API_URL
            );


        if (!response.ok) {

            throw new Error(
                "HTTP Error " +
                response.status
            );

        }


        const result =
            await response.json();


        console.log(
            "Schedule Support API:",
            result
        );


        if (!result.status) {

            throw new Error(
                result.message ||
                "API mengembalikan status false."
            );

        }


        scheduleData =
            Array.isArray(result.data)
                ? result.data
                : [];


        bmList =
            Array.isArray(result.bm)
                ? result.bm
                : [];


        storeList =
            Array.isArray(result.stores)
                ? result.stores
                : [];


        if (
            scheduleData.length === 0
        ) {

            showEmpty(
                "Data Schedule Support masih kosong."
            );

            return;

        }


        /*
         * PENTING:
         * Tidak menggunakan latest month.
         *
         * Selalu gunakan bulan sekarang.
         */

        const today = new Date();

        selectedDate =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                1
            );


        renderAll();

    }
    catch (error) {

        console.error(
            "Schedule Support Error:",
            error
        );


        showError(
            error.message
        );

    }

}


// =========================================================
// EVENTS
// =========================================================

function setupEvents() {


    const btnToday =
        document.getElementById(
            "btnToday"
        );


    if (btnToday) {

        btnToday.addEventListener(
            "click",
            function () {

                const today =
                    new Date();


                selectedDate =
                    new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        1
                    );


                renderAll();

            }
        );

    }


    const search =
        document.getElementById(
            "searchSchedule"
        );


    if (search) {

        search.addEventListener(
            "input",
            function () {

                renderAll();

            }
        );

    }

}


// =========================================================
// RENDER ALL
// =========================================================

function renderAll() {

    filteredData =
        getSelectedMonthData();


    updateMonthTitle();

    renderKPI();

    renderTodaySupport();

    renderTomorrowSupport();

    renderTable();

    renderStoreSummary();

}


// =========================================================
// GET SELECTED MONTH
// =========================================================

function getSelectedMonthData() {

    const year =
        selectedDate.getFullYear();

    const month =
        selectedDate.getMonth();


    let data =
        scheduleData.filter(
            function (item) {

                const date =
                    parseDate(
                        item.date
                    );


                if (!date) {

                    return false;

                }


                return (
                    date.getFullYear() === year &&
                    date.getMonth() === month
                );

            }
        );


    /*
     * SEARCH
     */

    const searchElement =
        document.getElementById(
            "searchSchedule"
        );


    const keyword =
        searchElement
            ? searchElement.value
                .trim()
                .toLowerCase()
            : "";


    if (!keyword) {

        return data;

    }


    data =
        data.filter(
            function (item) {

                const dateText =
                    String(
                        item.date || ""
                    ).toLowerCase();


                const dayText =
                    String(
                        item.day || ""
                    ).toLowerCase();


                if (
                    dateText.includes(keyword) ||
                    dayText.includes(keyword)
                ) {

                    return true;

                }


                /*
                 * SEARCH BM + STORE
                 */

                for (
                    let i = 0;
                    i < bmList.length;
                    i++
                ) {

                    const bm =
                        bmList[i];


                    const store =
                        String(
                            item.bm?.[bm] || ""
                        ).toLowerCase();


                    if (
                        bm
                            .toLowerCase()
                            .includes(keyword) ||
                        store.includes(keyword)
                    ) {

                        return true;

                    }

                }


                return false;

            }
        );


    return data;

}


// =========================================================
// MONTH TITLE
// =========================================================

function updateMonthTitle() {

    const monthElement =
        document.getElementById(
            "currentMonth"
        );


    const infoElement =
        document.getElementById(
            "currentMonthInfo"
        );


    const monthName =
        selectedDate.toLocaleDateString(
            "en-US",
            {
                month: "long",
                year: "numeric"
            }
        );


    if (monthElement) {

        monthElement.textContent =
            monthName;

    }


    if (infoElement) {

        infoElement.textContent =
            filteredData.length +
            " support days available";

    }

}


// =========================================================
// RENDER KPI
// =========================================================

function renderKPI() {

    const container =
        document.getElementById(
            "scheduleKPI"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    /*
     * TOTAL DAYS DALAM BULAN
     */

    const year =
        selectedDate.getFullYear();

    const month =
        selectedDate.getMonth();


    const totalDays =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /*
     * SUMMARY CARD
     */

    const summary =
        document.createElement(
            "div"
        );


    summary.className =
        "schedule-kpi-card summary-card";


    let totalDO = 0;

    let totalAL = 0;

    let totalVisits = 0;


    bmList.forEach(
        function (bm) {

            const stats =
                calculateBMStats(
                    bm
                );


            totalDO += stats.doDays;

            totalAL += stats.alDays;

            totalVisits += stats.visits;

        }
    );


    /*
     * SUMMARY
     */

    summary.innerHTML = `

        <div class="kpi-card-header">

            <div class="schedule-kpi-icon">

                <i class="fa-solid fa-calendar-days"></i>

            </div>

            <div>

                <h3>Summary</h3>

                <span>
                    Monthly Overview
                </span>

            </div>

        </div>


        <div class="summary-row">

            <span>Hari Kerja</span>

            <strong class="work-color">

                ${Math.max(
                    totalDays -
                    Math.round(
                        (totalDO + totalAL) /
                        Math.max(bmList.length, 1)
                    ),
                    0
                )}

            </strong>

            <small>Hari</small>

        </div>


        <div class="summary-row">

            <span>Day Off</span>

            <strong class="leave-color">

                ${totalDO}

            </strong>

            <small>Hari</small>

        </div>


        <div class="summary-row">

            <span>Annual Leave</span>

            <strong class="leave-color">

                ${totalAL}

            </strong>

            <small>Hari</small>

        </div>


        <div class="summary-row">

            <span>Visit</span>

            <strong class="visit-color">

                ${totalVisits}

            </strong>

            <small>Visit</small>

        </div>


        <div class="summary-total">

            <span>Total Hari</span>

            <strong>

                ${totalDays}

            </strong>

            <small>Hari</small>

        </div>

    `;


    container.appendChild(
        summary
    );


    /*
     * BM CARDS
     */

    bmList.forEach(
        function (bm) {

            const stats =
                calculateBMStats(
                    bm
                );


            const card =
                createBMKpiCard(
                    bm,
                    stats,
                    totalDays
                );


            container.appendChild(
                card
            );

        }
    );

}


// =========================================================
// CALCULATE BM STATS
// =========================================================

function calculateBMStats(
    bm
) {

    let doDays = 0;

    let alDays = 0;

    let visits = 0;


    filteredData.forEach(
        function (item) {

            const value =
                String(
                    item.bm?.[bm] || ""
                ).trim();


            if (!value) {

                return;

            }


            const upper =
                value.toUpperCase();


            /*
             * DAY OFF
             */

            if (
                upper === "DO"
            ) {

                doDays++;

                return;

            }


            /*
             * ANNUAL LEAVE
             */

            if (
                upper === "AL"
            ) {

                alDays++;

                return;

            }


            /*
             * VISIT
             *
             * STORE CODE = 4 HURUF
             */

            if (
                isFourCharacterStore(
                    value
                )
            ) {

                visits++;

            }

        }
    );


    const totalDays =
        new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth() + 1,
            0
        ).getDate();


    const workDays =
        Math.max(
            totalDays -
            doDays -
            alDays,
            0
        );


    return {

        workDays: workDays,

        doDays: doDays,

        alDays: alDays,

        visits: visits

    };

}


// =========================================================
// CHECK STORE CODE 4 CHARACTER
// =========================================================

function isFourCharacterStore(
    value
) {

    if (!value) {

        return false;

    }


    const text =
        String(
            value
        ).trim();


    /*
     * Contoh:
     *
     * XBTU
     * DBOT
     * KINN
     * CIMA
     * XRYU
     *
     * Tidak termasuk:
     *
     * DO
     * AL
     * ST XEUM
     */

    return /^[A-Za-z0-9]{4}$/.test(
        text
    );

}


// =========================================================
// CREATE BM KPI CARD
// =========================================================

function createBMKpiCard(
    bm,
    stats,
    totalDays
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "schedule-kpi-card bm-kpi-card";


    card.innerHTML = `

        <div class="kpi-card-header">

            <div class="schedule-kpi-icon">

                <i class="fa-solid fa-user-tie"></i>

            </div>


            <div>

                <h3>

                    ${escapeHtml(bm)}

                </h3>

                <span>
                    Monthly Schedule
                </span>

            </div>

        </div>


        <div class="summary-row">

            <span>
                Hari Kerja
            </span>


            <strong class="work-color">

                ${stats.workDays}

            </strong>


            <small>
                Hari
            </small>

        </div>


        <div class="summary-row">

            <span>
                Day Off
            </span>


            <strong class="leave-color">

                ${stats.doDays}

            </strong>


            <small>
                Hari
            </small>

        </div>


        <div class="summary-row">

            <span>
                Annual Leave
            </span>


            <strong class="leave-color">

                ${stats.alDays}

            </strong>


            <small>
                Hari
            </small>

        </div>


        <div class="summary-row">

            <span>
                Visit
            </span>


            <strong class="visit-color">

                ${stats.visits}

            </strong>


            <small>
                Visit
            </small>

        </div>


        <div class="summary-total">

            <span>
                Total Hari
            </span>


            <strong>
                ${totalDays}
            </strong>


            <small>
                Hari
            </small>

        </div>

    `;


    return card;

}


// =========================================================
// TODAY SUPPORT
// =========================================================

function renderTodaySupport() {

    const container =
        document.getElementById(
            "todaySupportGrid"
        );


    const status =
        document.getElementById(
            "todayStatus"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    const today =
        new Date();


    const todayString =
        formatDateKey(
            today
        );


    const todayData =
        scheduleData.find(
            function (item) {

                return (
                    formatDateKey(
                        parseDate(
                            item.date
                        )
                    ) === todayString
                );

            }
        );


    /*
     * TODAY TIDAK ADA
     */

    if (!todayData) {

        if (status) {

            status.textContent =
                "No Schedule Today";

        }


        container.innerHTML = `

            <div class="support-empty">

                <i class="fa-solid fa-calendar-xmark"></i>

                <strong>
                    No Schedule Today
                </strong>

            </div>

        `;


        return;

    }


    if (status) {

        status.textContent =
            "Today: " +
            formatDisplayDate(
                today
            );

    }


    /*
     * CREATE BM CARDS
     */

    bmList.forEach(
        function (bm) {

            const store =
                String(
                    todayData.bm?.[bm] || ""
                ).trim();


            if (!store) {

                return;

            }


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "support-card";


            const isDO =
                store.toUpperCase() === "DO";


            const isAL =
                store.toUpperCase() === "AL";


            const storeClass =
                getStoreColorClass(
                    store
                );


            card.innerHTML = `

                <div class="support-bm">

                    <i class="fa-solid fa-user"></i>

                    ${escapeHtml(bm)}

                </div>


                <div
                    class="
                        support-store
                        ${storeClass}
                        ${
                            isDO || isAL
                                ? "leave-store"
                                : ""
                        }
                    "
                >

                    ${escapeHtml(store)}

                </div>


                <div class="support-label">

                    ${
                        isDO
                            ? "Day Off"
                            : isAL
                                ? "Annual Leave"
                                : "Today's Support"
                    }

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );


    if (
        container.children.length === 0
    ) {

        container.innerHTML = `

            <div class="support-empty">

                <i class="fa-solid fa-calendar-xmark"></i>

                <strong>
                    No BM Assignment
                </strong>

            </div>

        `;

    }

}

// =========================================================
// TOMORROW SUPPORT
// =========================================================

function renderTomorrowSupport() {

    const container =
        document.getElementById(
            "tomorrowSupportGrid"
        );


    const status =
        document.getElementById(
            "tomorrowStatus"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    // =========================================
    // TOMORROW DATE
    // =========================================

    const tomorrow =
        new Date();


    tomorrow.setDate(
        tomorrow.getDate() + 1
    );


    const tomorrowString =
        formatDateKey(
            tomorrow
        );


    // =========================================
    // FIND TOMORROW DATA
    // =========================================

    const tomorrowData =
        scheduleData.find(
            function (item) {

                return (
                    formatDateKey(
                        parseDate(
                            item.date
                        )
                    ) === tomorrowString
                );

            }
        );


    // =========================================
    // TOMORROW TIDAK ADA
    // =========================================

    if (!tomorrowData) {

        if (status) {

            status.textContent =
                "No Schedule Tomorrow";

        }


        container.innerHTML = `

            <div class="support-empty">

                <i class="fa-solid fa-calendar-xmark"></i>

                <strong>
                    No Schedule Tomorrow
                </strong>

            </div>

        `;


        return;

    }


    // =========================================
    // STATUS
    // =========================================

    if (status) {

        status.textContent =
            "Tomorrow: " +
            formatDisplayDate(
                tomorrow
            );

    }


    // =========================================
    // CREATE BM CARDS
    // =========================================

    bmList.forEach(
        function (bm) {

            const store =
                String(
                    tomorrowData.bm?.[bm] || ""
                ).trim();


            if (!store) {

                return;

            }


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "support-card";


            // =================================
            // CHECK DO / AL
            // =================================

            const isDO =
                store.toUpperCase() === "DO";


            const isAL =
                store.toUpperCase() === "AL";


            // =================================
            // STORE COLOR
            // =================================

            const storeClass =
                getStoreColorClass(
                    store
                );


            // =================================
            // CARD HTML
            // =================================

            card.innerHTML = `

                <div class="support-bm">

                    <i class="fa-solid fa-user"></i>

                    ${escapeHtml(bm)}

                </div>


                <div
                    class="
                        support-store
                        ${storeClass}
                        ${
                            isDO || isAL
                                ? "leave-store"
                                : ""
                        }
                    "
                >

                    ${escapeHtml(store)}

                </div>


                <div class="support-label">

                    ${
                        isDO
                            ? "Day Off"
                            : isAL
                                ? "Annual Leave"
                                : "Tomorrow's Support"
                    }

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );


    // =========================================
    // NO BM ASSIGNMENT
    // =========================================

    if (
        container.children.length === 0
    ) {

        container.innerHTML = `

            <div class="support-empty">

                <i class="fa-solid fa-calendar-xmark"></i>

                <strong>
                    No BM Assignment
                </strong>

            </div>

        `;

    }

}


// =========================================================
// RENDER TABLE
// =========================================================

function renderTable() {

    const header =
        document.getElementById(
            "scheduleHeader"
        );


    const body =
        document.getElementById(
            "scheduleBody"
        );


    const count =
        document.getElementById(
            "scheduleCount"
        );


    if (!header || !body) {

        return;

    }


    header.innerHTML = `

        <th>
            Date
        </th>


        <th>
            Day
        </th>

    `;


    bmList.forEach(
        function (bm) {

            const th =
                document.createElement(
                    "th"
                );


            th.innerHTML =
                escapeHtml(
                    bm
                );


            header.appendChild(
                th
            );

        }
    );


    body.innerHTML = "";


    if (
        filteredData.length === 0
    ) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="${bmList.length + 2}"
                    class="loading-cell"
                >

                    No schedule found

                </td>

            </tr>

        `;


        if (count) {

            count.textContent =
                "0 Days";

        }


        return;

    }


    const sortedData =
        [...filteredData].sort(
            function (a, b) {

                return (
                    parseDate(a.date) -
                    parseDate(b.date)
                );

            }
        );


    sortedData.forEach(
        function (item) {

            const tr =
                document.createElement(
                    "tr"
                );


            const date =
                parseDate(
                    item.date
                );


            /*
             * DATE
             */

            const tdDate =
                document.createElement(
                    "td"
                );


            tdDate.className =
                "date-cell";


            tdDate.textContent =
                formatFullDate(
                    date
                );


            tr.appendChild(
                tdDate
            );


            /*
             * DAY
             */

            const tdDay =
                document.createElement(
                    "td"
                );


            tdDay.className =
                "day-cell";


            tdDay.textContent =
                item.day ||
                "-";


            tr.appendChild(
                tdDay
            );


            /*
             * BM
             */

            bmList.forEach(
                function (bm) {

                    const td =
                        document.createElement(
                            "td"
                        );


                    const store =
                        String(
                            item.bm?.[bm] || "-"
                        ).trim();


                    const upper =
                        store.toUpperCase();


                    const isLeave =
                        upper === "DO" ||
                        upper === "AL";


                    const storeClass =
                        getStoreColorClass(
                            store
                        );


                    td.innerHTML = `

                        <span
                            class="
                                schedule-store
                                ${storeClass}
                                ${
                                    isLeave
                                        ? "leave-store"
                                        : ""
                                }
                            "
                        >

                            ${escapeHtml(store)}

                        </span>

                    `;


                    tr.appendChild(
                        td
                    );

                }
            );


            body.appendChild(
                tr
            );

        }
    );


    if (count) {

        count.textContent =
            sortedData.length +
            " Days";

    }

}


// =========================================================
// STORE SUMMARY
// =========================================================

function renderStoreSummary() {

    const container =
        document.getElementById(
            "storeSummaryGrid"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    const totals = {};


    storeList.forEach(
        function (store) {

            totals[store] =
                0;

        }
    );


    filteredData.forEach(
        function (item) {

            storeList.forEach(
                function (store) {

                    const value =
                        Number(
                            item.daySupport?.[store]
                        ) || 0;


                    totals[store] +=
                        value;

                }
            );

        }
    );


    const sortedStores =
        [...storeList].sort(
            function (a, b) {

                return (
                    totals[b] -
                    totals[a]
                );

            }
        );


    sortedStores.forEach(
        function (store) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "store-summary-card";


            card.innerHTML = `

                <span
                    class="${getStoreColorClass(store)}"
                >

                    ${escapeHtml(store)}

                </span>


                <strong>

                    ${totals[store] || 0}

                </strong>


                <small>

                    Support MPP

                </small>

            `;


            container.appendChild(
                card
            );

        }
    );

}

// =========================================================
// STORE COLOR
// =========================================================

function getStoreColorClass(store) {

    const code =
        String(store || "")
            .trim()
            .toUpperCase();

    // =========================================
    // DO / AL = MERAH
    // =========================================

    if (
        code === "DO" ||
        code === "AL"
    ) {

        return "leave-store";

    }


    // =========================================
    // STORE COLOR
    // =========================================

    const colorMap = {

        // BDIP - BIRU TUA
        "BDIP": "store-blue",

        // KINN - HIJAU
        "KINN": "store-green",

        // XBTU - KUNING
        "XBTU": "store-orange",

        // XKPT - COKLAT
        "XKPT": "store-purple",

        // FTCT - ORANGE
        "FTCT": "store-cyan",

        // MRIM - UNGU
        "MRIM": "store-red",

        // MIKO - BIRU MUDA
        "MIKO": "store-pink"

    };


    return colorMap[code] || "";

}
// =========================================================
// TODAY DATE
// =========================================================

function updateTodayDate() {

    const dateElement =
        document.getElementById(
            "todayDate"
        );


    const timeElement =
        document.getElementById(
            "todayTime"
        );


    const now =
        new Date();


    if (dateElement) {

        dateElement.textContent =
            now.toLocaleDateString(
                "en-US",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );

    }


    if (timeElement) {

        timeElement.textContent =
            now.toLocaleTimeString(
                "en-US",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );

    }

}


// =========================================================
// LOADING
// =========================================================

function showLoading() {

    const body =
        document.getElementById(
            "scheduleBody"
        );


    if (!body) {

        return;

    }


    body.innerHTML = `

        <tr>

            <td
                colspan="10"
                class="loading-cell"
            >

                <div class="loading-card">

                    <div class="spinner"></div>

                    <p>
                        Kela Euy...
                    </p>

                </div>

            </td>

        </tr>

    `;

}


// =========================================================
// EMPTY
// =========================================================

function showEmpty(
    message
) {

    const body =
        document.getElementById(
            "scheduleBody"
        );


    if (!body) {

        return;

    }


    body.innerHTML = `

        <tr>

            <td
                colspan="10"
                class="loading-cell"
            >

                ${escapeHtml(message)}

            </td>

        </tr>

    `;

}


// =========================================================
// ERROR
// =========================================================

function showError(
    message
) {

    const body =
        document.getElementById(
            "scheduleBody"
        );


    if (body) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="loading-cell"
                >

                    <div class="loading-card">

                        <i
                            class="fa-solid fa-triangle-exclamation"
                            style="font-size:30px;"
                        ></i>


                        <p>
                            Gagal mengambil data
                        </p>


                        <small>
                            ${escapeHtml(message)}
                        </small>

                    </div>

                </td>

            </tr>

        `;

    }

}


// =========================================================
// DATE PARSER
// =========================================================

function parseDate(
    value
) {

    if (!value) {

        return null;

    }


    if (
        value instanceof Date
    ) {

        return value;

    }


    if (
        typeof value === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(
            value
        )
    ) {

        const parts =
            value.split("-");


        return new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );

    }


    const date =
        new Date(
            value
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


// =========================================================
// DATE KEY
// =========================================================

function formatDateKey(
    date
) {

    if (!date) {

        return "";

    }


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


// =========================================================
// DISPLAY DATE
// =========================================================

function formatDisplayDate(
    date
) {

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


// =========================================================
// FULL DATE
// =========================================================

function formatFullDate(
    date
) {

    if (!date) {

        return "-";

    }


    return date.toLocaleDateString(
        "en-US",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}