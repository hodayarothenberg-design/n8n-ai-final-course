const WEBHOOK_URL = "PASTE_N8N_CHAT_WEBHOOK_URL_HERE";

const messagesEl = document.getElementById("messages");
const formEl = document.getElementById("chat-form");
const inputEl = document.getElementById("chat-input");

const sessionId =
  window.localStorage.getItem("zooSessionId") ||
  (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));

window.localStorage.setItem("zooSessionId", sessionId);

function addBubble(text, role) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${role}`;
  bubble.textContent = text;
  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function extractReply(payload) {
  if (!payload) return "לא הצלחתי לקרוא תשובה מהוורקפלואו.";
  if (typeof payload === "string") return payload;
  if (Array.isArray(payload)) {
    const first = payload[0];
    return first?.output || first?.text || extractReply(first);
  }
  return (
    payload.output ||
    payload.text ||
    payload.message ||
    JSON.stringify(payload)
  );
}

async function sendMessage(text) {
  if (!WEBHOOK_URL || WEBHOOK_URL.includes("PASTE_N8N")) {
    addBubble(
      "צריך להדביק ב-script.js את כתובת ה-webhook של ה-Chat Trigger אחרי שמפעילים את הוורקפלואו ב-n8n.",
      "system"
    );
    return;
  }

  addBubble(text, "user");
  inputEl.value = "";
  formEl.querySelector("button").disabled = true;

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sendMessage",
        sessionId,
        chatInput: text
      })
    });

    const data = await response.json();
    addBubble(extractReply(data), "bot");
  } catch (error) {
    addBubble("הייתה תקלה בשליחה אל n8n. בדקו שהוורקפלואו פעיל ושהכתובת נכונה.", "system");
  } finally {
    formEl.querySelector("button").disabled = false;
    inputEl.focus();
  }
}

formEl.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = inputEl.value.trim();
  if (text) sendMessage(text);
});

addBubble("שלום! אני זוהר מהגן. אפשר לשאול אותי על גן החיות התנ\"כי בירושלים.", "bot");
