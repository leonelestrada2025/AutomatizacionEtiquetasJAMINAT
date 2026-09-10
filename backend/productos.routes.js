const { Router } = require("express");
const db = require("./db");
const router = Router();
// GET ALL
router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM productos ORDER BY idProductos ASC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// GET ONE
router.get("/:id", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT * FROM productos WHERE idProductos = ?",
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// POST
router.post("/", async (req, res) => {
    const { idProductos, nombreProducto, precio } = req.body;
    if (!idProductos || !nombreProducto || precio === undefined) {
        return res.status(400).json({ error: "Faltan campos requeridos" });
    }
    try {
        await db.query(
            "INSERT INTO productos (idProductos, nombreProducto, precio) VALUES (?, ?, ?)",
            [idProductos, nombreProducto, precio]
        );
        res.status(201).json({ message: "Producto creado", id: idProductos });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: `El ID ${idProductos} ya existe` });
        }
        res.status(500).json({ error: err.message });
    }
});
// PUT
router.put("/:id", async (req, res) => {
    const { nombreProducto, precio } = req.body;
    if (!nombreProducto || precio === undefined) {
        return res.status(400).json({ error: "Faltan campos: nombreProducto, precio" });
    }
    try {
        const [result] = await db.query(
            "UPDATE productos SET nombreProducto = ?, precio = ? WHERE idProductos = ?",
            [nombreProducto, precio, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: "Producto no encontrado" });
        res.json({ message: "Producto actualizado" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// DELETE
router.delete("/:id", async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM productos WHERE idProductos = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: "Producto no encontrado" });
        res.json({ message: "Producto eliminado" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;