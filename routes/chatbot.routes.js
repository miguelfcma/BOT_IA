const { Router } = require("express");
const router = Router();
const { chatHandler } = require("../bot/chatbot.js");
const path = require('path');
//Ruta prompt
router.post("/chat", chatHandler);
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  });

module.exports = router;
