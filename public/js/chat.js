const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatBox = document.getElementById("chatBox");

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();

  if (text === "") return;

  try {
    // Send message to backend
    const response = await axios.post(
      "http://localhost:3000/chat/add-message",
      {
        message: text,
        userId: 1,
      },
    );

    console.log(response.data);

    // Create UI message
    const message = document.createElement("div");

    message.classList.add("message", "sent");

    // Time
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

    // Append to UI
    chatBox.appendChild(message);

    // Auto scroll
    chatBox.scrollTop = chatBox.scrollHeight;

    // Clear input
    messageInput.value = "";
  } catch (err) {
    console.log(err);
  }
});
