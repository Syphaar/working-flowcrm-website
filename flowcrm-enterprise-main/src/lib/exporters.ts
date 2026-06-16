import Papa from "papaparse";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function download(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    anchor.remove();
  }, 0);
}

export function exportCSV(filename: string, rows: Record<string, unknown>[]) {
  const csv = Papa.unparse(rows);
  download(`${filename}.csv`, new Blob([csv], { type: "text/csv;charset=utf-8" }));
}

export function exportXLSX(filename: string, rows: Record<string, unknown>[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Export");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  download(`${filename}.xlsx`, new Blob([out], { type: "application/octet-stream" }));
}

export function exportPDF(filename: string, rows: Record<string, unknown>[], title = "Export") {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 14);
  if (rows.length) {
    const cols = Object.keys(rows[0]);
    autoTable(doc, {
      startY: 20,
      head: [cols],
      body: rows.map((row) => cols.map((col) => String(row[col] ?? ""))),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] },
    });
  }
  doc.save(`${filename}.pdf`);
}
