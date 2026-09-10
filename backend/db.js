const mysql = require("mysql2");
const pool = mysql.createPool({
    host: "localhost",
    user: "root",         // cambia por tu usuario de MariaDB
    password: "leo",         // cambia por tu contraseña
    database: "jami",
    port: "3307",
    waitForConnections: true,
    connectionLimit: 10,
});
module.exports = pool.promise();
