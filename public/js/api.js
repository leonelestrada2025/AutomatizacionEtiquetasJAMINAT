// api.js — capa de comunicación con el backend
// Todos los módulos importan de aquí para hacer peticiones REST.
const BASE = "http://localhost:5555/productos";
/**
 * Wrapper genérico sobre fetch.
 * Lanza un Error con el mensaje del servidor si la respuesta no es 2xx.
 */
async function request(url, options = {}) {
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || `Error ${res.status}`);
    }
    return data;
}
export const api = {
    getAll: () => request(BASE),
    getOne: (id) => request(`${BASE}/${id}`),
    create: (body) => request(BASE, { method: "POST", body: JSON.stringify(body) }),
    update: (id, body) => request(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    remove: (id) => request(`${BASE}/${id}`, { method: "DELETE" }),
};