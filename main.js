//? En este archivo se encuentra la inicializacion del servidor y la conexión a la base de datos. 



const app = require('./app.js');
const { sequelizeDB } = require("./database/db.js");
require("dotenv").config();

const PORT = process.env.PORT;

async function main() {
  try {
 
    // await sequelizeDB.sync({ force: false });
    await sequelizeDB.authenticate();
    console.log("✅ Conexión a la base de datos establecida correctamente.");
    // const tables = await sequelizeDB.getQueryInterface().showAllTables();
    // console.log("Tablas en la base de datos:", tables);
    // console.log("Configuración del pool:", sequelizeDB.options.pool);
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    
    console.log(`Conexión a la base de datos incompleta `, error);
  }
}


main();