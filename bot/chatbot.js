//? Este archivo tiene la la lógica principal para manejar las interacciones del chatbot. su principal objetivo es procesar las solicitudes entrantes de los usuarios, gestionar sesiones de chat, recuperar datos relevantes y generar respuestas utilizando Gemini o incluso podria ser remplezado con otro, mas adelante

const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");
// module.exports = { saveMessage, getChatHistory };
// module.exports = { getSession, createSession, closeSession };
const {
  getSession,
  createSession,
  closeSession,
  saveMessage,
  getChatHistory,
  getInitialPrompt,
  getAgentPrompt,
  updateTotalTokens,
} = require("../controllers/controllers_sessionChat/chatbot.controller.js");

const {
  getClientInfoByClientId,
  getOrders2,
  getEssentialData,
} = require("../controllers/bdController.js");
// const db = required("../db/db.js");
const { sendToGemini } = require("./geminiService.js");

exports.chatHandler = async (req, res) => {
  const {
    agentmessagestemplatesId, //Se usa para obtener el prompt inicial de la app
    userId,
    clientId,
    routeId, // Opcional
    message,
    module, //Opcional para recuperar info del modulo en el que esta
    action, //opcional para tomar el prompt de la accion que el eligio
  } = req.body;
  console.log("Mensaje recibido:", message);
  if (
    agentmessagestemplatesId === undefined ||
    userId === undefined ||
    clientId === undefined ||
    message === undefined
  ) {
    return res.status(400).json({ error: "Faltan campos requeridos." });
  }
  try {
    const sectionRow = await getInitialPrompt(agentmessagestemplatesId);

    if (!sectionRow) {
      return res.status(400).json({ error: "No hay prompt inicial." });
    }

    let sessionRow = await getSession(agentmessagestemplatesId, userId);
    let sessionId;

    if (sessionRow) {
      const now = new Date();
      const startedAt = new Date(sessionRow.started_at);
      const diffMinutes = (now - startedAt) / 1000 / 60;
      // if (diffMinutes > 5) {
      //   await closeSession(sessionRow.id);
      //   sessionId = await createSession(
      //     agentmessagestemplatesId,
      //     userId,
      //     sectionRow.id
      //   );
      //   await saveMessage(sessionId, "bot", sectionRow.prompt);
      // } else {
      sessionId = sessionRow.id;
      // }
    } else {
      sessionId = await createSession(
        agentmessagestemplatesId,
        userId,
        sectionRow.id
      );
      await saveMessage(sessionId, "bot", sectionRow.prompt);
    }

    //Obtener la data
    if (module) {
      const data = await getDataByModule(clientId, module);
      await saveMessage(sessionId, "user", message, JSON.stringify(data));
    } else {
      const data = await getDataByModule(clientId, "initial");

      await saveMessage(sessionId, "user", message, JSON.stringify(data));
    }
    if (action) {
      const agentRow = await getAgentPrompt(agentmessagestemplatesId, action);

      if (agentRow && agentRow.prompt) {
        await saveMessage(sessionId, "bot", agentRow.prompt);
      }
    }

    const chatHistory = await getChatHistory(sessionId);
    // console.log(chatHistory);
    const { botReply, tokenData } = await sendToGemini(chatHistory);

    await saveMessage(sessionId, "bot", botReply);

    await updateTotalTokens(sessionId, tokenData.totalTokenCount || 0);

    res.json({ reply: botReply });
  } catch (error) {
    console.error("Error en chatHandler:", error);
    res.status(500).json({ error: "Error interno" });
  }
};

async function getDataByModule(clientId, module) {
  let data = {};
  switch (module) {
    case "initial":
      try {
        const [essentialData, orders] = await Promise.all([
          getEssentialData(clientId),
          // getOrders2(),
        ]);

        data = {
          essentialData,
          ordenes: orders,
        };
      } catch (error) {
        console.error("Error obteniendo datos:", error);
      }
      return data;
    case "orderspresale":
      try {
        const [essentialData, orders] = await Promise.all([
          getEssentialData(clientId),
          // getOrders2(),
        ]);

        data = {
          essentialData,
          ordenes: orders,
        };
      } catch (error) {
        console.error("Error obteniendo datos:", error);
      }
      return data;

    case "":
      break;
    case "":
      break;
    case "":
      break;
  }
}
