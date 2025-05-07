//import { Filter } from "https://www.unpkg.com/browse/bad-words@4.0.0/";

// Getting the elements within the document
const form = document.getElementById("form");
const messageButton = document.getElementById("send-button");
const joinRoomButton = document.getElementById("room-button");
const makeRoomButton = document.getElementById("create-room")
const messageInput = document.getElementById("message-input");
const roomInput = document.getElementById("room-input");
const roomText = document.getElementById("room-text")
const messageContainer = document.getElementById("message-container");

var username = prompt("What is your username?");
while (username.trim() == "" || username == null) {
  username = prompt("What is your username? (Minimum 1 character)");
}

const socket = io('https://5000.cs.glitchedblox.net');
let currentRoom = ''

socket.on('connect', () => {
  console.log('Connected to backend');
});

socket.on('chat message', (msg) => {
  console.log('New message:', msg);
  displayMessage(msg);
});

function sendMessage() {
  const rawMessage = messageInput.value.trim();
  if (!rawMessage || !currentRoom) {
    console.warn('Message or room is missing', { rawMessage, currentRoom });
    return;
  }

  socket.emit('chat message', {
    room: currentRoom,
    message: rawMessage
  });

  messageInput.value = "";
  messageContainer.scrollTop = messageContainer.scrollHeight;
  lastSentTime = Date.now();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  sendMessage();
});

socket.on('room created', (code) => {
  currentRoom = code;
  roomText.textContent = "Current Room: " + currentRoom
  alert(`Room created! Share this code: ${code}`);
});

socket.on('room joined', (code) => {
  currentRoom = code;
  roomText.textContent = "Current Room: " + currentRoom
  alert(`Successfully joined room: ${code}`);
});

socket.on('room not found', () => {
  alert('Room not found. Please check the code and try again.');
});

var sentToday = false;
var lastSentTime;
var currentDate;

//const filter = new Filter();
//filter.addWords(atob("c2lnbWE="));

/*
form.addEventListener("submit", (e) => {
  e.preventDefault();

  var message = messageInput.value;

  if (message.trim() === "") return;
  sendMessage(message)
  messageContainer.scrollTop = messageContainer.scrollHeight;

  messageInput.value = "";
});
*/

joinRoomButton.addEventListener("click", () => {
  const roomCode = roomInput.value.trim().toUpperCase();
  socket.emit('join room', roomCode);
});

makeRoomButton.addEventListener("click", () => {
  if (currentRoom == '') {
    socket.emit('create room');
    makeRoomButton.textContent = "Leave Room";
  } else {
    socket.emit('disconnect');
    makeRoomButton.textContent = "Create Room"
    currentRoom = ''
  }
})

function displayMessage(message) {
  const now = new Date();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  var meridiem = " am";

  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  const formattedDate = `${month}/${day}/${year}`;

  if (!sentToday || formattedDate != currentDate) {
    const dateDiv = document.createElement("div");
    dateDiv.textContent = "—————————— " + formattedDate + " ——————————";
    dateDiv.classList.add("time");
    messageContainer.append(dateDiv);
    sentToday = true;
    currentDate = formattedDate;
  }

  if (Date.now() - lastSentTime >= 300000 || lastSentTime == null) {
    const timeDiv = document.createElement("div");

    if (hours > 12) {
      hours = hours - 12;
      meridiem = " pm";
    }

    timeDiv.textContent = hours + ":" + minutes + meridiem;
    timeDiv.classList.add("time");
    messageContainer.append(timeDiv);
  }

  lastSentTime = Date.now();

  const div = document.createElement("div");
  div.textContent = username + ": " + message;
  div.classList.add("message");
  messageContainer.append(div);
}
