// form.js — lógica del formulario CRUD (crear / editar)
import { api } from "./api.js";
import { cargarTabla } from "./tabla.js";
import { mostrarMsg } from "./utils.js";
const $form = document.querySelector(".crud-form");
const $title = document.querySelector(".crud-title");
const $btnCancelar = document.getElementById("btnCancelar");
const $formMsg = document.getElementById("form-msg");
// ── Helpers ──────────────────────────────────────────────────────────────────
function limpiarForm() {
    $form.reset();
    $form.editId.value = "";
    $title.textContent = "Agregar Producto";
    $btnCancelar.style.display = "none";
    $form.idProductos.disabled = false;
    $formMsg.textContent = "";
}
function modoEdicion(datos) {
    $title.textContent = "Editar Producto";
    $form.idProductos.value = datos.id;
    $form.idProductos.disabled = true;   // el PK no se edita
    $form.nombreProducto.value = datos.nombre;
    $form.precio.value = datos.precio;
    $form.editId.value = datos.id;
    $btnCancelar.style.display = "";
    $form.nombreProducto.focus();
}
// ── Evento: tabla solicita edición ──────────────────────────────────────────
document.addEventListener("tabla:editar", (e) => {
    modoEdicion(e.detail);
});
// ── Submit ───────────────────────────────────────────────────────────────────
$form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const editId = $form.editId.value;
    const esEdicion = !!editId;
    const body = esEdicion
        ? {
            nombreProducto: $form.nombreProducto.value.trim(),
            precio: parseFloat($form.precio.value),
        }
        : {
            idProductos: parseInt($form.idProductos.value),
            nombreProducto: $form.nombreProducto.value.trim(),
            precio: parseFloat($form.precio.value),
        };
    // Validación básica
    if (!body.nombreProducto || isNaN(body.precio)) {
        mostrarMsg($formMsg, "Completa todos los campos correctamente.", "error");
        return;
    }
    try {
        if (esEdicion) {
            await api.update(editId, body);
            mostrarMsg($formMsg, "Producto actualizado correctamente.", "ok");
        } else {
            await api.create(body);
            mostrarMsg($formMsg, "Producto creado correctamente.", "ok");
        }

        limpiarForm();
        await cargarTabla();

    } catch (err) {
        mostrarMsg($formMsg, err.message, "error");
    }
});
// ── Cancelar edición ─────────────────────────────────────────────────────────
$btnCancelar.addEventListener("click", limpiarForm);