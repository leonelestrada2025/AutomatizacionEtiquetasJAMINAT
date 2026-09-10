const express = require("express");
const cors = require("cors");
const path = require("path");

const productosRoutes = require("./backend/productos.routes");

const app = express();
const PORT = 5555;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Rutas API
app.use("/productos", productosRoutes);

// Servir index.html para cualquier otra ruta
app.get("/{*path}", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});