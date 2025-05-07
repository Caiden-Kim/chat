//import { Filter } from "https://www.unpkg.com/browse/bad-words@4.0.0/";

// Getting the elements within the document
const form = document.getElementById("form");
const messageButton = document.getElementById("send-button");
const joinRoomButton = document.getElementById("room-button");
const makeRoomButton = document.getElementById("create-room")
const messageInput = document.getElementById("message-input");
const roomInput = document.getElementById("room-input");
const messageContainer = document.getElementById("message-container");

var name = prompt("What is your name?");
while (name.trim() === "" || name == null) {
  name = prompt("What is your name? (Minimum 1 character)");
}

const socket = io('https://5000.cs.glitchedblox.net');

socket.on('connect', () => {
  console.log('Connected to backend');
});

socket.on('chat message', (msg) => {
  console.log('New message:', msg);
  displayMessage(msg);
});

function sendMessage(msg) {
  socket.emit('chat message', msg);
}

socket.on('room created', (code) => {
  currentRoom = code;
  alert(`Room created! Share this code: ${code}`);
});

socket.on('room joined', (code) => {
  currentRoom = code;
  alert(`Successfully joined room: ${code}`);
});

socket.on('room not found', () => {
  alert('Room not found. Please check the code and try again.');
});

var sentToday = false;
var lastSentTime;
var currentDate;

let currentRoom = ''

//const filter = new Filter();
//filter.addWords(atob("c2lnbWE="));

form.addEventListener("submit", (e) => {
  e.preventDefault();

  var message = messageInput.value;
  const room = roomInput.value;

  if (message.trim() === "") return;
  sendMessage(message)
  messageContainer.scrollTop = messageContainer.scrollHeight;

  messageInput.value = "";
});

joinRoomButton.addEventListener("click", () => {
  const roomCode = roomInput.value.trim().toUpperCase();
  socket.emit('join room', roomCode);
});

makeRoomButton.addEventListener("click", () => {
  socket.emit('create room');
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
  div.textContent = name + ": " + message;
  div.classList.add("message");
  messageContainer.append(div);
}
