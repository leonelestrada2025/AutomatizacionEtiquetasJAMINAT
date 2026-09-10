const { app, BrowserWindow } = require("electron");
const path = require("path");

// Inicia Express
require("./server");

function createWindow() {
    const win = new BrowserWindow({
        width: 1400,
        height: 900,
        autoHideMenuBar: true,

        // Cambia la ruta cuando tengas tu icon.ico
        icon: path.join(__dirname, "icon.ico")
    });

    win.loadURL("http://localhost:5555");

    // Descomenta si quieres abrir las herramientas de desarrollo
    // win.webContents.openDevTools();
}

app.whenReady().then(() => {

    // Esperar un poco para que Express arranque
    setTimeout(() => {
        createWindow();
    }, 2000);

});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});