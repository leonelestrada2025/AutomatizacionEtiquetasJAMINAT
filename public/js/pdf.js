// pdf.js — gestión de la lista de etiquetas y generación del PDF

import { mostrarMsg } from "./utils.js";

const $pdfBody = document.getElementById("pdf-body");
const $pdfEmpty = document.getElementById("pdf-empty");
const $btnGenerar = document.getElementById("generarPDF");

// Lista en memoria de etiquetas seleccionadas
const etiquetas = [];

// ── Helpers ───────────────────────────────────────────────────────────────────

function actualizarVisibilidadVacia() {
    $pdfEmpty.style.display = etiquetas.length === 0 ? "" : "none";
}

function formatearPrecio(precio) {
    const num = Number(precio);
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
}

function agregarFilaPDF(datos) {
    const $tr = document.createElement("tr");

    $tr.dataset.id = datos.id;

    $tr.innerHTML = `
        <td>${datos.id}</td>
        <td>${datos.nombre}</td>
        <td>$${formatearPrecio(datos.precio)}</td>
        <td>
            <button class="btn-accion btn-remove-pdf" title="Quitar del PDF">
                ✕
            </button>
        </td>
    `;

    $pdfBody.appendChild($tr);
}

// ── Evento: tabla solicita agregar al PDF ─────────────────────────────────────

document.addEventListener("tabla:addpdf", (e) => {
    const datos = e.detail;

    const yaExiste = etiquetas.some(et => et.id === datos.id);

    if (yaExiste) {
        alert(`El producto "${datos.nombre}" ya está en la lista del PDF.`);
        return;
    }

    etiquetas.push(datos);

    agregarFilaPDF(datos);
    actualizarVisibilidadVacia();
});

// ── Delegación: quitar de la lista PDF ────────────────────────────────────────

$pdfBody.addEventListener("click", (e) => {
    if (!e.target.matches(".btn-remove-pdf")) return;

    const $tr = e.target.closest("tr");
    const id = $tr.dataset.id;

    const idx = etiquetas.findIndex(et => et.id === id);

    if (idx !== -1) {
        etiquetas.splice(idx, 1);
    }

    $tr.remove();

    actualizarVisibilidadVacia();
});

// ── Generar PDF ───────────────────────────────────────────────────────────────

$btnGenerar.addEventListener("click", () => {

    if (etiquetas.length === 0) {
        alert("No hay etiquetas seleccionadas para el PDF.");
        return;
    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "letter"
    });

    const pageW = 279.4;
    const pageH = 215.9;

    const cols = 3;
    const rows = 6;

    const marginX = 5;
    const marginY = 3;

    const etiW = (pageW - marginX * 2) / cols;
    const etiH = (pageH - marginY * 2) / rows;

    let idx = 0;

    while (idx < etiquetas.length) {

        if (idx > 0) {
            doc.addPage();
        }

        for (let row = 0; row < rows; row++) {

            for (let col = 0; col < cols; col++) {

                if (idx >= etiquetas.length) break;

                const el = etiquetas[idx];

                const x = marginX + col * etiW;
                const y = marginY + row * etiH;

                const padding = 2;
                const descFontSize = 11;
                const lineHeight = 4.2;
                const espacioExtra = 5; // espacio entre descripción y código

                // ── DESCRIPCIÓN ──────────────────────────────────────────────

                doc.setFont("helvetica", "bold");
                doc.setFontSize(descFontSize);
                doc.setTextColor(0, 0, 0);

                const maxDescW = etiW - (padding * 2);

                const lines = doc.splitTextToSize(
                    el.nombre || "",
                    maxDescW
                );

                const displayLines = lines.slice(0, 2);

                const descStartY = y + padding + 3;

                doc.text(
                    displayLines,
                    x + padding,
                    descStartY
                );

                // ── CÓDIGO ──────────────────────────────────────────────────

                const descEndY =
                    descStartY +
                    ((displayLines.length - 1) * lineHeight);

                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.setTextColor(80, 80, 80);

                doc.text(
                    `${el.id}`,
                    x + etiW - padding,
                    descEndY + espacioExtra,
                    { align: "right" }
                );

                // ── PRECIO ──────────────────────────────────────────────────

                doc.setFont("helvetica", "bold");
                doc.setFontSize(40);
                doc.setTextColor(0, 0, 0);

                const precioY = descEndY + espacioExtra + 12;

                doc.text(
                    `$${formatearPrecio(el.precio)}`,
                    x + (etiW / 2),
                    precioY,
                    { align: "center" }
                );

                idx++;
            }
        }
    }

    doc.save("etiquetas_JAMI.pdf");
});
// Estado inicial
actualizarVisibilidadVacia();