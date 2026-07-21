// ================================
// SALES MTD
// ================================

const API_URL = "TEMPEL_URL_APPS_SCRIPT_KAMU_DI_SINI";

let mtdData = [];
let filteredData = [];

// ================================
// LOAD DATA
// ================================

async function loadMTD() {

    try {

        const response = await fetch(API_URL + "?page=mtd");

        mtdData = await response.json();

        filteredData = [...mtdData];

        console.log(mtdData);

    } catch (err) {

        console.error(err);

        alert("Gagal mengambil data MTD");

    }

}

// ================================

loadMTD();