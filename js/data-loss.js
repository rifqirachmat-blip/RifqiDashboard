/* ==========================================
   CONFIG
========================================== */
console.log("data-loss.js loaded");
const API_BASE =
"https://script.google.com/macros/s/AKfycbxkRUqtmj7SqIMEZkwdJ6xha31uZ-a429dm4Pp7D0ETEsbD8vpfKKji-Ays4wsctnh9/exec";

let storeList = [];

const searchInput = document.getElementById("searchLoss");
const suggestionBox = document.getElementById("lossSuggestion");
const content = document.getElementById("lossContent");
const loading = document.getElementById("loadingLoss");
/* ==========================================
   GLOBAL
========================================== */

let stockList = [];

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

        const res = await fetch(API_BASE + "?action=stockloss");

        stockList = await res.json();

        console.log("Store List :", stockList);

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