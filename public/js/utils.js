// utils.js — funciones de utilidad compartidas
/**
 * Muestra un mensaje temporal en un elemento dado.
 * @param {HTMLElement} $el  - Contenedor del mensaje
 * @param {string} texto     - Texto a mostrar
 * @param {"ok"|"error"} tipo
 * @param {number} duracion  - Milisegundos antes de desaparecer (0 = permanente)
 */
export function mostrarMsg($el, texto, tipo = "ok", duracion = 3500) {
    $el.textContent = texto;
    $el.className = `msg msg-${tipo}`;
    if (duracion > 0) {
        setTimeout(() => {
            $el.textContent = "";
            $el.className = "msg";
        }, duracion);
    }
}