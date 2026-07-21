const API_URL = "https://script.google.com/macros/s/AKfycbxfXMWU7XGfaOebsqjq8H_XWD7Kzdtlcz_mIuqspC8Ysr1ZLj5j3Nn3HInboBPVtZBibA/exec";

let salesData = [];

async function loadData() {

    try {

        const response = await fetch(API_URL);

        salesData = await response.json();

        console.log("===== DATA BERHASIL DIMUAT =====");
        console.log(salesData);

        initDashboard();

    }

    catch(err){

        console.error(err);

    }

}