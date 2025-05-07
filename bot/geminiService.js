//? en este archivo esta separado la lógica para interactuar con la API de Gemini

const axios = require("axios");
require("dotenv").config();

const API_KEY = process.env.API_KEY_GEMINI; 
const MODEL_IA = "gemini-2.0-flash-lite";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_IA}:generateContent?key=${API_KEY}`;


async function sendToGemini(chatHistory) {
  const requestData = { contents: [{ parts: chatHistory }] };
  try {
    const response = await axios.post(URL, requestData, {
      headers: { "Content-Type": "application/json" },
    });

    const botReply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No entendí tu mensaje, podrías repetirlo";

    return { botReply, tokenData: response.data?.usageMetadata || {} };
  } catch (error) {
    console.error("Error en la API de Gemini:", error);
    throw new Error("Error en la API de Gemini");
  }
}

module.exports = { sendToGemini };
