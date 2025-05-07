//? Aqui se configura la aplicación principal del servidor utilizando Express.  inicializar el servidor, configurar middleware y definir las rutas principales para el chatbot.

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const path = require('path');

const app = express();

app.use(express.json());
app.use(cors());
// app.use(express.static("public")); 


const chatRoutes = require("./routes/chatbot.routes.js");
app.use("/api", chatRoutes);

app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos desde la carpeta "public"

module.exports = app;


