// =========================================
// FORMAT RUPIAH
// =========================================

function formatRupiah(angka) {

    return "Rp" + Number(angka).toLocaleString("id-ID");

}

// =========================================
// FORMAT ANGKA
// =========================================

function formatNumber(angka) {

    return Number(angka).toLocaleString("id-ID");

}

// =========================================
// FORMAT PERSENTASE
// =========================================

function formatPercent(value) {

    return value.toFixed(2) + "%";

}

// =========================================
// HITUNG GROWTH
// =========================================

function growth(current, previous) {

    if (previous == 0) return 0;

    return ((current - previous) / previous) * 100;

}

// =========================================
// SUM
// =========================================

function sum(data, field) {

    return data.reduce((total, item) => total + Number(item[field]), 0);

}

// =========================================
// UNIQUE
// =========================================

function unique(data, field) {

    return [...new Set(data.map(item => item[field]))].sort();

}