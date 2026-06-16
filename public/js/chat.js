const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatBox = document.getElementById("chatBox");

const form = document.getElementById("searchForm");
const emailInput = document.getElementById("emailInput");
const userList = document.getElementById("userList");
const groupBtn = document.getElementById("groupBtn");

const token = localStorage.getItem("token");

let currentRoom = "";
let chatType = "group";

if (!token) {
  window.location.href = "/login.html";
}

const payload = JSON.parse(atob(token.split(".")[1]));
const currentUserId = payload.id; 


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

socket.on("personal-message", (data) => {

  console.log(data); 

    console.log("senderId:", data.senderId);
  console.log("currentUserId:", currentUserId);

  const message = document.createElement("div");
 if (Number(data.senderId) === Number(currentUserId)) {
    console.log("ADDING SENT");
    message.classList.add("message", "sent");
  } else {
    console.log("ADDING RECEIVED");
    message.classList.add("message", "received");
  }


  console.log(message.className); // DEBUG

  const date = new Date(data.createdAt);

  let hours = date.getHours();
  let minutes = date.getMinutes();

  minutes = minutes < 10 ? "0" + minutes : minutes;

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  message.innerHTML = `
      ${data.message}
      <span class="time">${hours}:${minutes} ${ampm}</span>
  `;

  chatBox.appendChild(message);
});

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();

  if (!text) return;

  try {
    if (chatType === "group") {

  await axios.post(
    "http://localhost:3000/chat/add-message",
    { message: text },
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

} else {

  socket.emit("personal-message", {
    message: text,
    roomName: currentRoom
  });

}

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

groupBtn.addEventListener("click", () => {
  chatType = "group";
  currentRoom = "";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value;

  const token = localStorage.getItem("token");

  const response = await axios.get(
    `http://localhost:3000/chat/search-user?email=${email}`,
    {
      headers: {
        authorization: `Bearer ${token}`
      }
    }
  );
  

  displayUser(response.data);
});

function displayUser(user) {

  userList.innerHTML = "";

  const div = document.createElement("div");

  div.classList.add("user-card");

  div.innerHTML = `
    <div class="user-avatar">
      ${user.name.charAt(0).toUpperCase()}
    </div>

    <div class="user-details">
      <h4>${user.name}</h4>
      <p>${user.email}</p>
    </div>
  `;

  div.addEventListener("click", () => {

    chatType = "personal";

    currentRoom = [currentUserId, user.id]
      .sort()
      .join("_");

    socket.emit("join-room", currentRoom);

    chatBox.innerHTML = "";

    console.log("Joined:", currentRoom);

    alert(`Chatting with ${user.name}`);
    
  });

  userList.appendChild(div);
}

