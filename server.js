const express = require("express");
const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html/home.html"));
});

app.get("/home", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html/home.html"));
});

app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html/about.html"));
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "html/chat.html"));
});

const server = require("http").Server(app);
const io = require("socket.io")(server);

class Client {
  constructor(id, userName) {
    this.id = id;
    this.userName = userName;
    this.createdAt = Date.now();
    this.state = "Alive";
  }
}

var clients = {};

io.on("connection", (socket) => {
  socket.on("init", (userName) => {
    var clientObj = new Client(socket.id, userName);
    clients[socket.id] = clientObj;
    socket.broadcast.emit("come", clientObj);
    io.emit("init", clients);
  });
  socket.on("state", (state) => {
    clients[socket.id].state = state;
    socket.broadcast.emit("state", clients[socket.id]);
  });
  socket.on("chat", (content) => {
    socket.broadcast.emit("chat", {
      sender: socket.id,
      content: content,
    });
    socket.emit("chat", {
      sender: socket.id,
      content: content,
    });
  });
  socket.on("disconnect", () => {
    delete clients[socket.id];
    socket.broadcast.emit("leave", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server listening on port 3000!");
});
