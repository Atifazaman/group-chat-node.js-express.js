const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatBox = document.getElementById("chatBox");


const socket = new WebSocket("ws://localhost:3000");

window.addEventListener("DOMContentLoaded", getMessages);

socket.onmessage = async (event) => {

  const data = JSON.parse(event.data);

  const message = document.createElement("div");


  if (Number(data.userId) === 1) {

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
    <span class="time">
      ${hours}:${minutes} ${ampm}
    </span>
  `;

  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;

};


chatForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const text = messageInput.value.trim();

  if (text === "") return;

  try {

    await axios.post(
      "http://localhost:3000/chat/add-message",
      {
        message: text,
        userId: 1,
      }
    );

    socket.send(
      JSON.stringify({
        message: text,
        userId: 1
      })
    );

    messageInput.value = "";

  } catch (err) {

    console.log(err);

  }

});

async function getMessages() {

  try {

    const response = await axios.get(
      "http://localhost:3000/chat/messages"
    );
    const messages = response.data.messages;

    chatBox.innerHTML = "";

    messages.forEach((msg) => {

      const message = document.createElement("div");

      if (Number(msg.userTableId) === 1) {

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
        <span class="time">
          ${hours}:${minutes} ${ampm}
        </span>
      `;

      chatBox.appendChild(message);

    });

    chatBox.scrollTop = chatBox.scrollHeight;

  } catch (err) {

    console.log(err);

  }
}