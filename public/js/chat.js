const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatBox = document.getElementById("chatBox");

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();

  if (text === "") return;

  try {
    const response = await axios.post(
      "http://localhost:3000/chat/add-message",
      {
        message: text,
        userId: 1,
      },
    );

    console.log(response.data);
    const message = document.createElement("div");
    message.classList.add("message", "sent");

    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();

    minutes = minutes < 10 ? "0" + minutes : minutes;

    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    message.innerHTML = `
      ${text}
      <span class="time">${hours}:${minutes} ${ampm}</span>
    `;

    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight;
    messageInput.value = "";
  } catch (err) {
    console.log(err);
  }
});
window.addEventListener("DOMContentLoaded", getMessages);

async function getMessages() {

  try {
    const response = await axios.get(
      "http://localhost:3000/chat/messages"
    );

    const messages = response.data.messages;
    chatBox.innerHTML = "";

    messages.forEach((msg) => {

      const message = document.createElement("div");
      const currentUserId = 1;

     if (Number(msg.userTableId) === Number(currentUserId)) {

  message.classList.add("message", "sent");

} else {

  message.classList.add("message", "received");

}
      // Time formatting
      const date = new Date(msg.createdAt);

      let hours = date.getHours();
      let minutes = date.getMinutes();

      minutes = minutes < 10 ? "0" + minutes : minutes;

      const ampm = hours >= 12 ? "PM" : "AM";

      hours = hours % 12 || 12;

      // Message UI
      message.innerHTML = `
        ${msg.message}
        <span class="time">
          ${hours}:${minutes} ${ampm}
        </span>
      `;

      // Add to chat box
      chatBox.appendChild(message);

    });

    // Auto scroll bottom
    chatBox.scrollTop = chatBox.scrollHeight;

  } catch (err) {
    console.log(err);
  }
}

setInterval(() => {
  getMessages();
}, 3000);