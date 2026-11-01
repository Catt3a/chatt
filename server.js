const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

const messages = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Отправляем новому пользователю старые сообщения
  socket.emit("chat history", messages);

  socket.on("chat message", (data) => {
    const newMessage = {
      username: data.username || "Anonymous",
      message: data.message,
      time: Date.now()
    };

    // Сохраняем сообщение в памяти сервера
    messages.push(newMessage);

    // Ограничиваем историю 100 сообщениями
    if (messages.length > 100) {
      messages.shift();
    }

    // Отправляем всем пользователям
    io.emit("chat message", newMessage);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
