
    const chatForm = document.getElementById("chatForm");
    const messageInput = document.getElementById("messageInput");
    const chatBox = document.getElementById("chatBox");

    chatForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const text = messageInput.value.trim();

      if(text === "") return;

      // Create message
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

      // Append
      chatBox.appendChild(message);

      // Auto scroll
      chatBox.scrollTop = chatBox.scrollHeight;

      // Clear input
      messageInput.value = "";

      // Fake reply
      setTimeout(() => {

        const reply = document.createElement("div");

        reply.classList.add("message", "received");

        reply.innerHTML = `
          Nice message 🚀
          <span class="time">${hours}:${minutes} ${ampm}</span>
        `;

        chatBox.appendChild(reply);

        // Scroll again
        chatBox.scrollTop = chatBox.scrollHeight;

      }, 1000);

    });
