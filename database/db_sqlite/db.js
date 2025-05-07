const sqlite3 = require("sqlite3").verbose();
// const db = new sqlite3.Database("./chatbot.db");
const db = new sqlite3.Database("./database/db_sqlite/chatbot.db", (err) => {
  if (err) {
    console.error("Error al abrir la BD:", err.message);
  } else {
    console.log("✅ Conectado a la BD sqlite");

    // // Mostrar todas las tablas
    // db.all(
    //   "SELECT name FROM sqlite_master WHERE type='table'",
    //   (err, tables) => {
    //     if (err) {
    //       console.error("Error al obtener las tablas:", err.message);
    //     } else {
    //       console.log("Tablas en la base de datos:");
    //       console.table(tables);

    //       // Por cada tabla, muestra su estructura
    //       tables.forEach((table) => {
    //         db.all(`PRAGMA table_info(${table.name})`, (err, info) => {
    //           if (err) {
    //             console.error(
    //               `Error al obtener la estructura de ${table.name}:`,
    //               err.message
    //             );
    //           } else {
    //             console.log(`\nEstructura de la tabla ${table.name}:`);
    //             console.table(info);
    //           }
    //         });
    //       });
    //     }
    //   }
    // );

    // db.all("PRAGMA database_list;", (err, rows) => {
    //   if (err) {
    //     console.error("Error al ejecutar PRAGMA database_list:", err.message);
    //   } else {
    //     console.log("Lista de bases de datos:");
    //     console.table(rows);
    //   }
    // });
  }
});

module.exports = db;
