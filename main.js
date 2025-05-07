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

let username = prompt("What is your username?");
while (!username || username.trim() === "" && username !== "System") {
  // Keep asking until the user provides a valid username
  username = prompt("What is your username? (Minimum 1 character, cannot be \"System\")");
}

const socket = io('https://5000.cs.glitchedblox.net');
let currentRoom = ''

socket.on('connect', () => {
  console.log('Connected to backend');
  socket.emit('register username', username);
});

socket.on('chat message', (msg) => {
  console.log('New message:', msg);
  displayMessage(msg);
  lastSentTime = Date.now();
});

function sendMessage() {
  const rawMessage = messageInput.value.trim();
  if (!rawMessage || !currentRoom) {
    console.warn('Message or room is missing', { rawMessage, currentRoom });
    return;
  }

  socket.emit('chat message', {
    room: currentRoom,
    message: rawMessage,
    username: username
  });

  messageInput.value = "";
  messageContainer.scrollTop = messageContainer.scrollHeight;
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
  makeRoomButton.textContent = "Leave Room";
  alert(`Successfully joined room: ${code}`);
});

socket.on('room not found', () => {
  alert('Room not found. Please check the code and try again.');
});

socket.on('room left', (roomCode) => {
  alert(`Left room: ${roomCode}`);
  currentRoom = '';
  roomText.textContent = "Not in a room";
  makeRoomButton.textContent = "Create Room";
});

socket.on('username taken', () => {
  alert('That username is already taken in this room. Choose another.');
  currentRoom = '';

  username = prompt("What is your new username?");
  socket.emit('join room', roomCode);
});

var sentToday = false;
var lastSentTime;
var currentDate;

joinRoomButton.addEventListener("click", () => {
  const roomCode = roomInput.value.trim().toUpperCase();
  socket.emit('join room', roomCode);
});

makeRoomButton.addEventListener("click", () => {
  if (currentRoom === '') {
    socket.emit('create room');
    makeRoomButton.textContent = "Leave Room";
  } else {
    socket.emit('leave room', currentRoom);
    
    messageContainer.innerHTML = '';
    lastSentTime = null
    currentDate = null;
    sentToday = false
  }
});

function displayMessage(data) {
  const { message, username } = data;

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

  if (username === 'System') {
    const div = document.createElement("div");
    div.textContent = `${message}`;
    div.classList.add("notification");
    messageContainer.append(div);
  } else {
    const div = document.createElement("div");
    div.textContent = `${username}: ${message}`;
    div.classList.add("message");
    messageContainer.append(div);
  }
}