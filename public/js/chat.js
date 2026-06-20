const chatForm = document.getElementById("chatForm");
const predictiveSuggestions = document.getElementById("predictiveSuggestions");
const smartReplies = document.getElementById("smartReplies");
const messageInput = document.getElementById("messageInput");
const chatBox = document.getElementById("chatBox");

const form = document.getElementById("searchForm");
const emailInput = document.getElementById("emailInput");
const userList = document.getElementById("userList");
const sendBtn = document.getElementById("sendBtn");

const createGroupBtn = document.getElementById("createGroupBtn");

const token = localStorage.getItem("token");

let currentRoom = "";
let currentGroupId = null;
let chatType = "broadcast";
let selectedUsers = [];
let uploading = false;
let uploadedFileUrl = null;
let uploadedFileType = null;

if (!token) {
  window.location.href = "/login.html";
}

const payload = JSON.parse(atob(token.split(".")[1]));
const currentUserId = payload.id;

function getFileHTML(fileUrl, fileType) {
  if (!fileUrl) return "";

  console.log("FILE HTML:", fileUrl, fileType);


  if (fileType && fileType.startsWith("image")) {
    return `
        <img 
        src="${fileUrl}"
        class="chat-image"
        onload="console.log('IMAGE LOADED')"
        onerror="console.log('IMAGE FAILED')"
      />
    `;
  }

  return `
    <a href="${fileUrl}" target="_blank">
      📎 Open File
    </a>
  `;
}

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

socket.on("message", async(data) => {
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

    <div>${data.message || ""}</div>

${getFileHTML(data.fileUrl, data.fileType)}

    <span class="time">
      ${hours}:${minutes} ${ampm}
    </span>

  `;

  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;

    if (Number(data.userId) !== Number(currentUserId)) {
    await loadSmartReplies(data.message);
  }

});

socket.on("personal-message", async(data) => {
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
     
<div>${data.message || ""}</div>

${getFileHTML(data.fileUrl, data.fileType)}
      <span class="time">${hours}:${minutes} ${ampm}</span>
  `;

  chatBox.appendChild(message);
    if (Number(data.senderId) !== Number(currentUserId)) {
    await loadSmartReplies(data.message);
  }
});

socket.on("group-message", async(data) => {
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

   <div>${data.message || ""}</div>

${getFileHTML(data.fileUrl, data.fileType)}

    <span class="time">
      ${hours}:${minutes} ${ampm}
    </span>

  `;

  chatBox.appendChild(message);
  if (Number(data.senderId) !== Number(currentUserId)) {
    await loadSmartReplies(data.message);
  }
});

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (uploading) {
    alert("File is still uploading...");
    return;
  }

  const text = messageInput.value.trim();

  if (!text && !uploadedFileUrl) return;

  try {
    console.log("Sending:", uploadedFileUrl, uploadedFileType);
    if (chatType === "broadcast") {
      await axios.post(
        "http://localhost:3000/chat/add-message",
        {
          message: text,
          fileUrl: uploadedFileUrl,
          fileType: uploadedFileType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      

      socket.emit("message", {
        message: text,
        fileUrl: uploadedFileUrl,
        fileType: uploadedFileType,
      });
    } else if (chatType === "group") {
      if (!currentGroupId) {
        alert("Please select a group");
        return;
      }

      socket.emit("group-message", {
        groupId: currentGroupId,
        message: text,
        fileUrl: uploadedFileUrl,
        fileType: uploadedFileType,
      });
    } else {
      socket.emit("personal-message", {
        message: text,
        roomName: currentRoom,
        fileUrl: uploadedFileUrl,
        fileType: uploadedFileType,
      });
    }

    messageInput.value = "";

    uploadedFileUrl = null;
    uploadedFileType = null;
    mediaFile.value = "";
  } catch (err) {
    console.log(err);
  }
});

async function getMessages() {
  try {
    const response = await axios.get("http://localhost:3000/chat/messages", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

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

<div>${msg.message || ""}</div>

${getFileHTML(msg.fileUrl, msg.fileType)}

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
  const groupName = prompt("Enter Group Name");

  if (!groupName) return;

  const response = await axios.post(
    "http://localhost:3000/chat/group/create",
    {
      name: groupName,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
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
        Authorization: `Bearer ${token}`,
      },
    },
  );

  userList.innerHTML = "";

  response.data.forEach((group) => {
    const div = document.createElement("div");

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

const memberSearch = document.getElementById("memberSearch");

const suggestions = document.getElementById("suggestions");
const closeModalBtn = document.getElementById("closeModal");
const memberModal = document.getElementById("memberModal");

closeModalBtn.addEventListener("click", () => {
  memberModal.style.display =
    memberModal.style.display === "block" ? "none" : "block";
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
        Authorization: `Bearer ${token}`,
      },
    },
  );

  suggestions.innerHTML = "";

  response.data.forEach((user) => {
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
            userId: user.id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
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
        authorization: `Bearer ${token}`,
      },
    },
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

    currentRoom = [currentUserId, user.id].sort().join("_");

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
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  response.data.messages.forEach((msg) => {
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

    <div>${msg.message || ""}</div>

${getFileHTML(msg.fileUrl, msg.fileType)}

    <span class="time">
      ${hours}:${minutes} ${ampm}
    </span>

  `;

    chatBox.appendChild(div);
  });
}

const mediaBtn = document.getElementById("mediaBtn");
mediaBtn.onclick = () => {
  mediaFile.click();
};

const mediaFile = document.getElementById("mediaFile");

mediaFile.onchange = async () => {
  const file = mediaFile.files[0];

  if (!file) return;

  uploading = true;

  sendBtn.disabled = true; 

  const formData = new FormData();

  formData.append("file", file);

  try {
    const response = await fetch("http://localhost:3000/media/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    uploadedFileUrl = data.url;
    uploadedFileType = file.type;

    console.log("Uploaded:", uploadedFileUrl);
  } catch (err) {
    console.log(err);
  } finally {
    uploading = false;
    sendBtn.disabled = false;
  }
};


let typingTimer;

messageInput.addEventListener("input", () => {

  clearTimeout(typingTimer);

  const text = messageInput.value.trim();

  if (text.length < 3) {
    predictiveSuggestions.innerHTML = "";
    return;
  }

  typingTimer = setTimeout(async () => {

    try {

      const response = await axios.post(
        "http://localhost:3000/chat/suggestions",
        { text },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      predictiveSuggestions.innerHTML = "";

      response.data.suggestions.forEach(item => {

        const btn =
          document.createElement("button");

        btn.textContent = item;

        btn.addEventListener("click", () => {
          messageInput.value =
            messageInput.value + " " + item;
        });

        predictiveSuggestions.appendChild(btn);
      });

    } catch (err) {
      console.log(err);
    }

  }, 2500);

});

async function loadSmartReplies(message) {

  try {

    const response = await axios.post(
      "http://localhost:3000/chat/smart-replies",
      { message },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    smartReplies.innerHTML = "";

    response.data.replies.forEach(reply => {

      const btn =
        document.createElement("button");

      btn.textContent = reply;

      btn.addEventListener("click", () => {
        messageInput.value = reply;
      });

      smartReplies.appendChild(btn);
    });

  } catch (err) {
    console.log(err);
  }
}