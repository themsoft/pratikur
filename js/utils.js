/* ============================================
   Pratikur - Yardimci Fonksiyonlar
   ============================================ */

// --- Sayi Formatlama ---

function formatla(n) {
    if (n < 0.01) return n.toFixed(6);
    if (n < 1) return n.toFixed(4);
    return n.toFixed(2);
}

// --- CSV Indirme ---

function csvIndir(filename, csvContent) {
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = filename;
    link.click();
}
