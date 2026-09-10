// tabla.js — renderiza filas y delega eventos de la tabla principal
import { api } from "./api.js";
import { mostrarMsg } from "./utils.js";
const $tbody = document.getElementById("productos-body");
const $tableMsg = document.getElementById("table-msg");
const $template = document.getElementById("row-template").content;
const $buscar = document.getElementById("buscarCodigo");
// ── Configuración ─────────────────────────────────────────────────────────────
const LIMITE_INICIAL = 15;
let todosLosProductos = []; // Guardamos todos los productos para búsqueda
// ── Evento personalizado que otros módulos escuchan ─────────────────────────
// "tabla:editar"   → form.js recibe el dataset del producto
// "tabla:addpdf"   → pdf.js recibe el dataset del producto
function emitir(nombre, detalle) {
    document.dispatchEvent(new CustomEvent(nombre, { detail: detalle }));
}
// ── Renderizado ─────────────────────────────────────────────────────────────
function crearFila(producto) {
    const $clone = document.importNode($template, true);
    const $tr = $clone.querySelector("tr");
    $clone.querySelector(".col-id").textContent = producto.idProductos;
    $clone.querySelector(".col-desc").textContent = producto.nombreProducto;
    $clone.querySelector(".col-precio").textContent = `$${Number(producto.precio).toFixed(2)}`;
    // Guardamos los datos en el <tr> para la delegación
    $tr.dataset.id = producto.idProductos;
    $tr.dataset.nombre = producto.nombreProducto;
    $tr.dataset.precio = producto.precio;
    return $clone;
}
function renderizarProductos(productos) {
    $tbody.innerHTML = "";
    if (productos.length === 0) {
        $tbody.innerHTML = `<tr><td colspan="4" class="msg-empty">No hay productos que coincidan.</td></tr>`;
        return;
    }
    const $frag = document.createDocumentFragment();
    productos.forEach(p => $frag.appendChild(crearFila(p)));
    $tbody.appendChild($frag);
}
export async function cargarTabla() {
    $tbody.innerHTML = `<tr><td colspan="4" class="cargando">Cargando…</td></tr>`;
    try {
        todosLosProductos = await api.getAll();
        if (todosLosProductos.length === 0) {
            $tbody.innerHTML = `<tr><td colspan="4" class="msg-empty">No hay productos aún.</td></tr>`;
            return;
        }
        // Mostrar solo los primeros 15 productos
        const productosIniciales = todosLosProductos.slice(0, LIMITE_INICIAL);
        renderizarProductos(productosIniciales);
        // Mostrar mensaje si hay más productos
        if (todosLosProductos.length > LIMITE_INICIAL) {
            const $msg = document.createElement("tr");
            $msg.innerHTML = `<td colspan="4" class="msg-info">Mostrando ${LIMITE_INICIAL} de ${todosLosProductos.length} productos. Usa la búsqueda para ver más.</td>`;
            $tbody.appendChild($msg);
        }
    } catch (err) {
        mostrarMsg($tableMsg, err.message, "error");
    }
}
// ── Filtro de búsqueda ───────────────────────────────────────────────────────
$buscar.addEventListener("input", () => {
    const texto = $buscar.value.toLowerCase().trim();
    if (!texto) {
        // Si no hay texto de búsqueda, mostrar los primeros 15
        const productosIniciales = todosLosProductos.slice(0, LIMITE_INICIAL);
        renderizarProductos(productosIniciales);
        if (todosLosProductos.length > LIMITE_INICIAL) {
            const $msg = document.createElement("tr");
            $msg.innerHTML = `<td colspan="4" class="msg-info">Mostrando ${LIMITE_INICIAL} de ${todosLosProductos.length} productos. Usa la búsqueda para ver más.</td>`;
            $tbody.appendChild($msg);
        }
        return;
    }
    // Filtrar productos por ID o nombre
    const filtrados = todosLosProductos.filter(p => {
        const id = String(p.idProductos).toLowerCase();
        const nombre = p.nombreProducto.toLowerCase();
        return id.includes(texto) || nombre.includes(texto);
    });
    renderizarProductos(filtrados);
    // Mostrar mensaje con el total de resultados
    if (filtrados.length > 0) {
        const $msg = document.createElement("tr");
        $msg.innerHTML = `<td colspan="4" class="msg-info">Encontrados ${filtrados.length} resultado(s) para "${texto}"</td>`;
        $tbody.appendChild($msg);
    }
});
// ── Delegación de eventos en tbody ──────────────────────────────────────────
$tbody.addEventListener("click", async (e) => {
    const $tr = e.target.closest("tr");
    if (!$tr) return;
    // Verificar que el tr tenga datos (ignorar filas de mensaje)
    if (!$tr.dataset.id) return;
    const datos = {
        id: $tr.dataset.id,
        nombre: $tr.dataset.nombre,
        precio: $tr.dataset.precio,
    };
    // EDITAR
    if (e.target.matches(".btn-edit")) {
        emitir("tabla:editar", datos);
    }
    // ELIMINAR
    if (e.target.matches(".btn-delete")) {
        const confirmar = confirm(`¿Eliminar el producto con ID ${datos.id}?`);
        if (!confirmar) return;
        try {
            await api.remove(datos.id);
            await cargarTabla();
            mostrarMsg($tableMsg, "Producto eliminado.", "ok");
        } catch (err) {
            mostrarMsg($tableMsg, err.message, "error");
        }
    }
    // AÑADIR A PDF
    if (e.target.matches(".btn-add-pdf")) {
        emitir("tabla:addpdf", datos);
    }
});