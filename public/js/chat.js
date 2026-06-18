const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const chatBox = document.getElementById("chatBox");

const form = document.getElementById("searchForm");
const emailInput = document.getElementById("emailInput");
const userList = document.getElementById("userList");

const createGroupBtn = document.getElementById("createGroupBtn");

const token = localStorage.getItem("token");

let currentRoom = "";
let currentGroupId = null;
let chatType = "broadcast";
let selectedUsers = [];

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

window.addEventListener("DOMContentLoaded", () => {
  getMessages();
  loadGroups();
});

socket.on("message", (data) => {

  console.log("broadcast data:", data);

  const message = document.createElement("div");

  if (Number(data.userId) === Number(currentUserId)) {
    message.classList.add("message", "sent");
  } else {
    message.classList.add("message", "received");
  }


  const date = new Date(data.createdAt);

  let hours = date.getHours();
  let minutes = date.getMinutes();

  minutes = minutes < 10 ? "0" + minutes : minutes;

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;


  message.innerHTML = `

    ${
      Number(data.userId) !== Number(currentUserId)
      ? `<div class="sender-name">${data.senderName}</div>`
      : ""
    }

    <div>${data.message}</div>

    <span class="time">
      ${hours}:${minutes} ${ampm}
    </span>

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

socket.on("group-message", (data) => {

  const message = document.createElement("div");

  if (Number(data.senderId) === Number(currentUserId)) {
    message.classList.add("message", "sent");
  } else {
    message.classList.add("message", "received");
  }

  const date = new Date(data.createdAt);

  let hours = date.getHours();
  let minutes = date.getMinutes();

  minutes = minutes < 10 ? "0" + minutes : minutes;

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;


  message.innerHTML = `

    ${
      Number(data.senderId) !== Number(currentUserId)
        ? `<div class="sender-name">${data.senderName}</div>`
        : ""
    }

    <div>${data.message}</div>

    <span class="time">
      ${hours}:${minutes} ${ampm}
    </span>

  `;

  chatBox.appendChild(message);
});

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();

  if (!text) return;

  try {
    if (chatType === "broadcast") {

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
    message:text
});

}else if (chatType === "group") {

  if (!currentGroupId) {
    alert("Please select a group");
    return;
  }

  socket.emit("group-message", {
    groupId: currentGroupId,
    message: text,
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

${
  Number(msg.userTableId) !== Number(currentUserId)
    ? `<div class="sender-name">${msg.user_table?.name || ""}</div>`
    : ""
}

<div>${msg.message}</div>

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



createGroupBtn.addEventListener("click", async () => {

  const groupName =
    prompt("Enter Group Name");

  if (!groupName) return;

  const response = await axios.post(
    "http://localhost:3000/chat/group/create",
    {
      name: groupName,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  const group = response.data.group;

joinGroup(group.id);

loadGroups();
});



async function loadGroups() {

  const response = await axios.get(
    "http://localhost:3000/chat/group/my-groups",
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  userList.innerHTML = "";

  response.data.forEach(group => {

    const div =
      document.createElement("div");

    div.classList.add("user-card");

    div.innerHTML = `
      <div class="user-avatar">G</div>
      <div class="user-details">
        <h4>${group.name}</h4>
        
      </div>
      <button class="addMemberBtn">Add Member</button>
    `;
const addBtn = div.querySelector(".addMemberBtn");

addBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  currentGroupId = group.id;

  document.getElementById("memberModal").style.display = "block";
});

    div.addEventListener("click", () => {
      joinGroup(group.id);
    });

    userList.appendChild(div);

  });
}

const memberSearch =
  document.getElementById("memberSearch");
 
const suggestions =
  document.getElementById("suggestions");
const closeModalBtn=document.getElementById("closeModal")
const memberModal=document.getElementById("memberModal")

closeModalBtn.addEventListener("click", () => {
  memberModal.style.display =
    memberModal.style.display === "block"
      ? "none"
      : "block";
});
 
memberSearch.addEventListener("input", async () => {
 
  const query = memberSearch.value.trim();
 
  if (query.length < 2) {
    suggestions.innerHTML = "";
    return;
  }
 
  const response = await axios.get(
    `http://localhost:3000/chat/search-user?query=${query}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
 
  suggestions.innerHTML = "";
 
  response.data.forEach(user => {
 
    const div = document.createElement("div");
    div.classList.add("suggestion-item");
 
    div.innerHTML = `
      <span>${user.name} (${user.email})</span>
      <button class="addUserBtn">Add</button>
    `;
 
    const addBtn = div.querySelector(".addUserBtn");
 
    addBtn.addEventListener("click", async () => {
 
      addBtn.disabled = true;
      addBtn.textContent = "Adding...";
 
      try {
 
        await axios.post(
          "http://localhost:3000/chat/group/add-member",
          {
            groupId: currentGroupId,
            userId: user.id
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
 
        addBtn.textContent = "Added";
 
      } catch (err) {
 
        if (err.response && err.response.status === 409) {
          addBtn.textContent = "Already added";
        } else {
          console.log(err);
          addBtn.disabled = false;
          addBtn.textContent = "Add";
          alert("Could not add user. Please try again.");
        }
 
      }
 
    });
 
    suggestions.appendChild(div);
 
  });
 
});


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value;

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


async function joinGroup(groupId) {

  chatType = "group";
  currentGroupId = groupId;

  socket.emit("join-group", groupId);

  chatBox.innerHTML = "";


  const response = await axios.get(
    `http://localhost:3000/chat/group/${groupId}/messages`,
    {
      headers:{
        Authorization:`Bearer ${token}`
      }
    }
  );


response.data.messages.forEach(msg => {

  const div = document.createElement("div");


  if (Number(msg.userId) === Number(currentUserId)) {
    div.classList.add("message", "sent");
  } else {
    div.classList.add("message", "received");
  }


  const date = new Date(msg.createdAt);

  let hours = date.getHours();
  let minutes = date.getMinutes();

  minutes = minutes < 10 ? "0" + minutes : minutes;

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;


  div.innerHTML = `

    ${
      Number(msg.userId) !== Number(currentUserId)
      ? `<div class="sender-name">${msg.sender?.name || ""}</div>`
      : ""
    }

    <div>${msg.message}</div>

    <span class="time">
      ${hours}:${minutes} ${ampm}
    </span>

  `;

  chatBox.appendChild(div);

});

}
