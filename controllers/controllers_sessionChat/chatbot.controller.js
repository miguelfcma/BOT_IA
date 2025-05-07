//?Este archivo tiene funciones que gestionan las sesiones de chat y los mensajes asociados en una base de datos SQLite. Estas funciones las uso para manejar la lógica de interacción entre el chatbot y los usuarios, incluyendo la creación de sesiones, el almacenamiento de mensajes, la recuperación del historial de chat y la gestión de prompt.

const db = require("../../database/db_sqlite/db.js");

async function getSession(agentmessagestemplatesId, userId) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id, started_at FROM sessions WHERE agentmessagestemplates_id = ? AND user_id = ? AND ended_at IS NULL",
      [agentmessagestemplatesId, userId],
      (err, row) => {
        if (err) return reject(err);
        resolve(row);
      }
    );
  });
}

async function createSession(agentmessagestemplatesId, userId, sectionId) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO sessions (agentmessagestemplates_id, user_id, agentmessages_id) VALUES (?, ?, ?)",
      [agentmessagestemplatesId, userId, sectionId],
      function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });
}

async function closeSession(sessionId) {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE sessions SET ended_at = ? WHERE id = ?",
      [new Date().toISOString(), sessionId],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

async function saveMessage(sessionId, role, message, data = null) {
  return new Promise((resolve, reject) => {
    db.run(
      "INSERT INTO messages (session_id, role, message, data) VALUES (?, ?, ?, ?)",
      [sessionId, role, message, data ? JSON.stringify(data) : null],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

async function getChatHistory(sessionId) {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT role, message, data FROM messages WHERE session_id = ? ORDER BY timestamp ASC",
      [sessionId],
      (err, rows) => {
        if (err) return reject(err);

        if (rows.length === 0) {
          return resolve([]); // Si no hay mensajes, devolver un array vacío
        }

        const firstMessage = rows[0]; // Primer mensaje
        const lastFiveMessages = rows.slice(-5); // Últimos 5 mensajes

        const filteredMessages = [firstMessage, ...lastFiveMessages];

        const history = filteredMessages.map((row, index) => {
          let text = row.message;

          // Información extra en el último mensaje
          if (index === filteredMessages.length - 1 && row.data) {
            try {
              const extra = JSON.parse(row.data);
              text += "\nInformación adicional: " + JSON.stringify(extra);
            } catch (e) {}
          }

          return { text };
        });

        resolve(history);
      }
    );
  });
}

// async function getChatHistory(sessionId) {
//   return new Promise((resolve, reject) => {
//     db.all(
//       `SELECT role, message, data FROM messages WHERE session_id = ? ORDER BY timestamp ASC LIMIT 1
//        UNION ALL
//        SELECT role, message, data FROM messages WHERE session_id = ? ORDER BY timestamp DESC LIMIT 5`,
//       [sessionId, sessionId],
//       (err, rows) => {
//         if (err) return reject(err);

//         if (rows.length === 0) return resolve([]);

//         // Ordenar correctamente: primero el mensaje inicial, luego los últimos 5 en orden cronológico
//         const firstMessage = rows.shift();
//         const lastMessages = rows.reverse(); // Revertir orden cronológico

//         const history = lastMessages.map((row) => ({ text: row.message }));

//         history.unshift({ text: firstMessage.message });

//         const lastIndex = history.length - 1;
//         if (history[lastIndex] && rows[lastIndex].data) {
//           try {
//             const extra = JSON.parse(rows[lastIndex].data);
//             history[lastIndex].text +=
//               "\nInformación adicional: " + JSON.stringify(extra);
//           } catch (e) {}
//         }

//         resolve(history);
//       }
//     );
//   });
// }

// async function getChatHistory(sessionId) {
//   return new Promise((resolve, reject) => {
//     db.all(
//       `SELECT role, message, data, timestamp, 1 AS order_col
//        FROM messages WHERE session_id = ?
//        LIMIT 1

//        UNION ALL

//        SELECT role, message, data, timestamp, 2 AS order_col
//        FROM messages WHERE session_id = ?
//        ORDER BY timestamp DESC
//        LIMIT 5

//        ORDER BY order_col ASC, timestamp ASC`,
//       [sessionId, sessionId],
//       (err, rows) => {
//         if (err) return reject(err);

//         if (rows.length === 0) return resolve([]);

//         // Convertimos los resultados en el formato esperado
//         const history = rows.map((row, index) => {
//           let text = row.message;

//           // Solo agregamos la información extra al último mensaje
//           if (index === rows.length - 1 && row.data) {
//             try {
//               const extra = JSON.parse(row.data);
//               text += "\nInformación adicional: " + JSON.stringify(extra);
//             } catch (e) {}
//           }

//           return { text };
//         });

//         resolve(history);
//       }
//     );
//   });
// }

async function getInitialPrompt(agentmessagestemplatesId) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT id, prompt FROM agentmessages WHERE agentmessagestemplates_Id = ? AND action = ?",
      [agentmessagestemplatesId, "INITIAL"],
      (err, row) => {
        if (err) return reject(err);
        resolve(row);
      }
    );
  });
}

// Obtiene un prompt específico basado en agentmessages
async function getAgentPrompt(agentmessagestemplatesId, action) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT prompt FROM agentmessages WHERE agentmessagestemplates_id = ? AND action = ?",
      [agentmessagestemplatesId, action],
      (err, row) => {
        if (err) return reject(err);
        resolve(row);
      }
    );
  });
}

// Actualiza el total de tokens en una sesión
async function updateTotalTokens(sessionId, tokens) {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE sessions SET total_tokens = COALESCE(total_tokens, 0) + ? WHERE id = ?",
      [tokens, sessionId],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

module.exports = {
  saveMessage,
  getChatHistory,
  getSession,
  createSession,
  closeSession,
  getInitialPrompt,
  updateTotalTokens,
  getAgentPrompt,
};
