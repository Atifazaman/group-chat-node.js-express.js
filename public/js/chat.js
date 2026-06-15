const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatBox = document.getElementById("chatBox");

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/login.html";
}

const payload = JSON.parse(atob(token.split(".")[1]));
const currentUserId = payload.id; 

console.log(payload);
console.log(currentUserId);

const socket = io("http://localhost:3000", {
  auth: {
    token,
  },
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.log("Socket error:", err.message);
});

window.addEventListener("DOMContentLoaded", getMessages);

socket.on("message", (data) => {
  const message = document.createElement("div");

  if (Number(data.userId) === Number(currentUserId)) {
    message.classList.add("message", "sent");
  } else {
    message.classList.add("message", "received");
  }

  const now = new Date();

  let hours = now.getHours();
  let minutes = now.getMinutes();

  minutes = minutes < 10 ? "0" + minutes : minutes;

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  message.innerHTML = `
    ${data.message}
    <span class="time">${hours}:${minutes} ${ampm}</span>
  `;

  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
});

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();

  if (!text) return;

  try {
    await axios.post(
      "http://localhost:3000/chat/add-message",
      {
        message: text,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    socket.emit("message", {
      message: text,
      userId: currentUserId,
    });

    messageInput.value = "";
  } catch (err) {
    console.log(err);
  }
});

async function getMessages() {
  try {
    const response = await axios.get(
      "http://localhost:3000/chat/messages",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    chatBox.innerHTML = "";

    response.data.messages.forEach((msg) => {
      const message = document.createElement("div");

      if (Number(msg.userTableId) === Number(currentUserId)) {
        message.classList.add("message", "sent");
      } else {
        message.classList.add("message", "received");
      }

      const date = new Date(msg.createdAt);

      let hours = date.getHours();
      let minutes = date.getMinutes();

      minutes = minutes < 10 ? "0" + minutes : minutes;

      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;

      message.innerHTML = `
        ${msg.message}
        <span class="time">${hours}:${minutes} ${ampm}</span>
      `;

      chatBox.appendChild(message);
    });

    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    console.log(err);
  }
}